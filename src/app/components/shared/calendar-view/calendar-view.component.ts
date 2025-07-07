import { NgIf } from '@angular/common';
import { Component, Input, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventApi, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Subscription, take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { EventsService } from 'src/app/services/events.service';
import { AppointmentFormComponent } from '../../forms/book-appointment-form/book-appointment-form.component';
import { CreateEventFormComponent } from '../../forms/create-event-form/create-event-form.component';
import { EventFilterComponent } from '../../shared/event-filter/event-filter.component';

@Component({
  selector: 'app-calendar-view',
  imports: [NgIf, FullCalendarModule, EventFilterComponent],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css'],
})
export class CalendarViewComponent implements OnDestroy {
  @Input() calendarOptions!: CalendarOptions;

  isAdmin = false;
  userId = this.authWrapperService.getCurrentUser()?.uid || '';


  showPanel = false;
  selectedEvent: EventApi | null = null;
  selectedEventDetails: EventInput | null = null;

  private events: Event[] = [];
  private appointments: Appointment[] = [];

  filteredAppointments$ = this.filterService.filteredAppointments$;
  filteredPastAppointments$ = this.filterService.filteredPastAppointments$;
  filteredEvents$ = this.filterService.filteredEvents$;
  filteredPastEvents$ = this.filterService.filteredPastEvents$;

  filteredAppointmentsGrouped: { [date: string]: Appointment[] } = {};
  filteredEventsGrouped: { [date: string]: Event[] } = {};

  pastAppointmentsGrouped: { [date: string]: Appointment[] } = {};
  pastEventsGrouped: { [date: string]: Event[] } = {};

  sortedDates: string[] = [];
  computedSortedPastDates: string[] = [];

  includePast: boolean = false;
  private includePastSub!: Subscription;

  private subscriptions: Subscription[] = [];

  displayedCalendarEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  pastDisplayedCalendarEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  constructor(
    private authService: AuthService,
    private authWrapperService: AuthWrapperService,
    private deleteService: DeleteEventService,
    private eventsService: EventsService,
    private filterService: EventFilterService,
    private dialog: MatDialog,
    public appointmentsService: AppointmentApiService,
    public eventsApiService: EventsApiService,
    private eventStore: EventStoreService
  ) {}

  ngOnInit(): void {
    const now = new Date();
    const today = this.stripTime(new Date());

    // Subscribe to includePast toggle
    this.includePastSub = this.filterService.includePast$.subscribe((value) => {
      this.includePast = value;
      this.updateCalendar();
    });

    // Subscribe to filtered appointments
    this.subscriptions.push(
      this.filterService.filteredAppointments$.subscribe((filtered: { [key: string]: Appointment[] }) => {
        const allAppointments = Object.values(filtered).flat();
        const future = allAppointments.filter(app => this.stripTime(new Date(app.date)) >= today);

        this.filteredAppointmentsGrouped = this.filterService.groupItemsByDate(future, 'date');

        this.updateCalendar();
      })
    );

    // Subscribe to filtered past appointments
    this.subscriptions.push(
      this.filterService.filteredPastAppointments$.subscribe((filtered: { [key: string]: Appointment[] }) => {
        const allAppointments = Object.values(filtered).flat();
        const past = allAppointments.filter((app) => new Date(app.date) < now);

        this.pastAppointmentsGrouped = this.filterService.groupItemsByDate(past, 'date');

        this.updateCalendar();
      })
    )

    // Subscribe to filtered events
    this.subscriptions.push(
      this.filterService.filteredEvents$.subscribe((filtered: { [key: string]: Event[] }) => {
        const allEvents = Object.values(filtered).flat();
        const future = allEvents.filter(event => this.stripTime(new Date(event.startDate)) >= today);

        this.filteredEventsGrouped = this.filterService.groupItemsByDate(future, 'startDate');

        this.updateCalendar();
      })
    );

    // Subscribe to filtered past events
    this.subscriptions.push(
      this.filterService.filteredPastEvents$.subscribe((filtered: { [key: string]: Event[] }) => {
        const allEvents = Object.values(filtered).flat();
        const past = allEvents.filter((event) => new Date(event.startDate) < now);

        this.pastEventsGrouped = this.filterService.groupItemsByDate(past, 'startDate');

        this.updateCalendar();
      })
    );

    // Get auth info
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });

    // Update initial filters
    this.filterService.updateAppointments(this.appointments);
    this.filterService.updateEvents(this.events);

    this.authService.user$.pipe(take(1)).subscribe((user) => {
      this.isAdmin = user?.role === 'admin';
      this.loadData();
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: [],
      headerToolbar: {
        left: 'prev,next',
        center: 'title',
        right: 'dayGridMonth',
      },
      eventClick: this.handleEventClick.bind(this),
    };
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.includePastSub?.unsubscribe();
  }

  loadData(): void {
    this.eventsService.fetchAppointmentsAndEvents(this.isAdmin, this.userId, null).subscribe({
      next: ([appointments, events]) => {
        this.appointments = appointments.filter((a) => !!a.date);
        this.events = events.filter((e) => !!e.startDate);

        // Update EventFilterService with new data
        this.filterService.updateAppointments(this.appointments);
        this.filterService.updateEvents(this.events);

        // Trigger filtering (e.g., based on initial days range)
        this.filterService.setRange(this.filterService.daysRange);
      },
      error: (error) => console.error('TESTING: Error loading data:', error)
    });
  }

  updateCalendar(): void {
    const futureAppointments = Object.values(this.filteredAppointmentsGrouped).flat();
    const futureEvents = Object.values(this.filteredEventsGrouped).flat();

    const pastAppointments = this.includePast ? Object.values(this.pastAppointmentsGrouped).flat() : [];
    const pastEvents = this.includePast ? Object.values(this.pastEventsGrouped).flat() : [];

    const futureCalendarAppointments = this.eventsService.transformAppointmentsForFullCalendar(futureAppointments);
    const futureCalendarEvents = this.eventsService.transformEventsForFullCalendar(futureEvents);

    const pastCalendarAppointments = this.eventsService.transformAppointmentsForFullCalendar(pastAppointments);
    const pastCalendarEvents = this.eventsService.transformEventsForFullCalendar(pastEvents)

    this.calendarOptions.events = [...futureCalendarAppointments, ...futureCalendarEvents, ...pastCalendarAppointments, ...pastCalendarEvents];
  }

  isValidEvent(obj: any): obj is Event {
    return obj && typeof obj === 'object' && 'id' in obj && 'title' in obj && 'startDate' in obj;
  }

  handleEventClick(clickInfo: EventClickArg) {
    this.selectedEvent = clickInfo.event;
    const maybeEvent = clickInfo.event.extendedProps?.['event'];

    this.selectedEventDetails = {
      title: clickInfo.event.title,
      startTime: clickInfo.event.start,
      extendedProps: { ...clickInfo.event.extendedProps },
    };
    this.showPanel = true;

    if (this.isFuture(clickInfo.event.start)) {
      if (maybeEvent && this.isValidEvent(maybeEvent)) {
        this.openEditEventDialog(maybeEvent);
      } else {
        console.warn('Invalid event data in extendedProps:', maybeEvent);
      }
    } else {
      console.log('Past events cannot be edited.');
    }
  }

  closeEventDetails() {
    this.showPanel = false;
    this.selectedEvent = null;
  }

  isFuture(startTime: string | Date | undefined | null): boolean {
    if (!startTime) return false;
    const date = new Date(startTime);
    return date.getTime() > new Date().getTime();
  }

  deleteEvent(): void {
    const id = this.selectedEvent?.id || this.selectedEvent?.id;
    if (!id) {
      alert('Invalid event ID');
      return;
    }

    // Include both future and past events for deletion
    const allEvents = [
      ...Object.values(this.filteredEventsGrouped).flat(),
      ...Object.values(this.pastEventsGrouped).flat()
    ];

    this.deleteService.deleteEvent(
      id,
      allEvents,
      () => this.updateCalendar(),
      () => this.closeEventDetails()
    );
  }

  deleteAppointment(): void {
    const id = this.selectedEvent?.id || this.selectedEvent?.id;
    if (!id) {
      alert('Invalid appointment ID');
      return;
    }

    // Include both future and past appointments for deletion
    const allAppointments = [
      ...Object.values(this.filteredAppointmentsGrouped).flat(),
      ...Object.values(this.pastAppointmentsGrouped).flat()
    ];

    this.deleteService.deleteAppointment(
      id,
      allAppointments,
      () => this.updateCalendar(),
      () => this.closeEventDetails()
    );
  }

  stripTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  openEditEventDialog(event: Event): void {
    const dialogRef = this.dialog.open(CreateEventFormComponent, {
      width: '600px',
      data: { eventToEdit: event }
    });

    const componentInstance = dialogRef.componentInstance;
    if (componentInstance) {
      componentInstance.eventSaved.subscribe((updatedEvent: Event) => {
        this.eventStore.upsertEvent(updatedEvent);
      });
    }
  }

  canEditAppointment(appointment: Appointment): boolean {
    const isFuture = new Date(appointment.startTime).getTime() > new Date().getTime();

    // Admins can edit appointments that they have created, and only if the appointment is in the future
    return this.isAdmin && !!appointment.createdByAdmin && isFuture;
  }

  editAppointment(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      width: '600px',
      data: { 
        appointmentToEdit: appointment,
        serviceType: appointment.type
      }
    });

    dialogRef.afterClosed().subscribe((updatedAppointment: Appointment | undefined) => {
      if (updatedAppointment) {
        this.appointmentsService.getAllAppointments().subscribe((appointments: Appointment[]) => {
          this.appointments = appointments;
          this.filterService.updateAppointments(appointments);
        });
      }
    });
  }

  editEvent(event: Event): void {
    const dialogRef = this.dialog.open(CreateEventFormComponent, {
      width: '600px',
      data: { eventToEdit: event }
    });

    dialogRef.afterClosed().subscribe((updatedEvent: Event | undefined) => {
      if (updatedEvent) {
        this.eventsApiService.getAllEvents().subscribe((events: Event[]) => {
          this.events = events;
          this.filterService.updateEvents(events);
        });
      }
    });
  }
}