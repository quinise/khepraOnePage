import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { CreateEventFormComponent } from '../forms/create-event-form/create-event-form.component';
import { EventFilterComponent } from '../shared/event-filter/event-filter.component';
import { AppointmentFormComponent } from '../forms/book-appointment-form/book-appointment-form.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventFilterComponent, NgFor],
  templateUrl: './event-list-component.component.html',
  styleUrls: ['./event-list-component.component.css'],
})
export class EventListComponent implements OnInit {
  isAdmin: boolean = false;
  currentUserEmail: string | null = null;

  private _appointments: Appointment[] = [];
  private _events: Event[] = [];

  filteredAppointments$ = this.filterService.filteredAppointments$;
  filteredPastAppointments$ = this.filterService.filteredPastAppointments$;
  filteredEvents$ = this.filterService.filteredEvents$;
  filteredPastEvents$ = this.filterService.filteredPastEvents$;

  filteredAppointmentsGrouped: { [date: string]: Appointment[] } = {};
  filteredEventsGrouped: { [date: string]: Event[] } = {};

  pastAppointmentsGrouped: { [date: string]: Appointment[] } = {};
  pastEventsGrouped: { [date: string]: Event[] } = {};

  private subscriptions: Subscription[] = [];

  displayedListEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  pastDisplayedListEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  sortedDates: string[] = [];
  computedSortedPastDates: string[] = [];

  includePast: boolean = false;
  private includePastSub!: Subscription;

  @Input()
  set appointments(value: Appointment[]) {
    if (value && value.length) {
      this._appointments = value;
      this.filterService.updateAppointments(this._appointments);
    }
  }

  get appointments(): Appointment[] {
    return this._appointments;
  }

  @Input()
  set events(value: Event[]) {

    if (value && value.length) {
      this._events = value;
      this.filterService.updateEvents(this._events);
    }
  }

  get events(): Event[] {
    return this._events;
  }

  constructor(
    private authService: AuthService,
    private deleteService: DeleteEventService,
    public filterService: EventFilterService,
    private dialog: MatDialog,
    public appointmentsService: AppointmentApiService,
    public eventsService: EventsApiService,
    private eventStore: EventStoreService
  ) {}

  ngOnInit(): void {
    const now = new Date();

    // Subscribe to includePast toggle
    this.includePastSub = this.filterService.includePast$.subscribe((value) => {
      this.includePast = value;
      this.updateListView(); // re-evaluate display list based on toggle
    });

    // Subscribe to filtered appointments
    this.subscriptions.push(
      this.filterService.filteredAppointments$.subscribe((filtered: { [key: string]: Appointment[] }) => {
        const allAppointments = Object.values(filtered).flat();
        const future = allAppointments.filter((app) => new Date(app.date) >= now);

        this.filteredAppointmentsGrouped = this.filterService.groupItemsByDate(future, 'date');

        this.updateListView();
      })
    );


    // Subscribe to filtered past appointments
    this.subscriptions.push(
      this.filterService.filteredPastAppointments$.subscribe((filtered: { [key: string]: Appointment[] }) => {
        const allAppointments = Object.values(filtered).flat();
        const past = allAppointments.filter((app) => new Date(app.date) < now);

        this.pastAppointmentsGrouped = this.filterService.groupItemsByDate(past, 'date');

        this.updateListView();
      })
    )

    // Subscribe to filtered events
    this.subscriptions.push(
      this.filterService.filteredEvents$.subscribe((filtered: { [key: string]: Event[] }) => {
        const allEvents = Object.values(filtered).flat();
        const future = allEvents.filter((event) => new Date(event.startDate) >= now);

        this.filteredEventsGrouped = this.filterService.groupItemsByDate(future, 'startDate');

        this.updateListView();
      })
    );

    // Subscribe to filtered past events
    this.subscriptions.push(
      this.filterService.filteredPastEvents$.subscribe((filtered: { [key: string]: Event[] }) => {
        const allEvents = Object.values(filtered).flat();
        const past = allEvents.filter((event) => new Date(event.startDate) < now);

        this.pastEventsGrouped = this.filterService.groupItemsByDate(past, 'startDate');

        this.updateListView();
      })
    );

    // Get auth info
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.currentUserEmail = user?.email ?? null;
    });

    // Update initial filters
    this.filterService.updateAppointments(this.appointments);
    this.filterService.updateEvents(this.events);
}

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.includePastSub?.unsubscribe();
  }

  updateListView(): void {
    const futureAppointments = Object.values(this.filteredAppointmentsGrouped).flat();
    const futureEvents = Object.values(this.filteredEventsGrouped).flat();

    const pastAppointments = this.includePast ? Object.values(this.pastAppointmentsGrouped).flat() : [];
    const pastEvents = this.includePast ? Object.values(this.pastEventsGrouped).flat() : [];

    const combined = [
      ...futureAppointments.map(app => ({
        id: app.id,
        title: app.name,
        date: new Date(app.date).toISOString(),
        type: 'appointment' as const
      })),
      ...futureEvents.map(evt => ({
        id: evt.id,
        title: evt.eventName,
        date: new Date(evt.startDate).toISOString(),
        type: 'event' as const
      })),
      ...pastAppointments.map(app => ({
        id: app.id,
        title: app.name,
        date: new Date(app.date).toISOString(),
        type: 'appointment' as const
      })),
      ...pastEvents.map(evt => ({
        id: evt.id,
        title: evt.eventName,
        date: new Date(evt.startDate).toISOString(),
        type: 'event' as const
      }))
    ];

    this.displayedListEvents = combined.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    this.sortedDates = Array.from(
      new Set([...Object.keys(this.filteredAppointmentsGrouped), ...Object.keys(this.filteredEventsGrouped)])
    ).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    this.computedSortedPastDates = this.filterService.getUnifiedSortedPastKeys(
      this.pastAppointmentsGrouped,
      this.pastEventsGrouped
    );
  }

  deleteAppointment(id: number): void {
    this.deleteService.deleteAppointment(
      id.toString(),
      this.appointments,
      () => this.updateListView(),
      () => {}
    );
  }

  deleteEvent(id: number): void {
    this.deleteService.deleteEvent(
      id.toString(),
      this.events,
      () => this.updateListView(),
      () => {}
    );
  }

  get sortedPastDates() {
    return this.filterService.getSortedKeys(this.pastAppointmentsGrouped);
  }

  get sortedPastAppointmentDates(): string[] {
    return this.filterService.getSortedKeys(this.pastAppointmentsGrouped);
  }

  get sortedPastEventDates(): string[] {
    return this.filterService.getSortedKeys(this.pastEventsGrouped);
  }

  get unifiedSortedFutureDates(): string[] {
    return this.filterService.getUnifiedSortedKeys(this.filteredAppointmentsGrouped, this.filteredEventsGrouped);
  }

  get unifiedSortedPastDates(): string[] {
    const pastAppointmentDates = Object.keys(this.pastAppointmentsGrouped);
    const pastEventDates = Object.keys(this.pastEventsGrouped);
    const allDates = new Set([...pastAppointmentDates, ...pastEventDates]);
    return Array.from(allDates).sort(); // or use a custom date sort if needed
  }

  get hasPastAppointments(): boolean {
    return Object.values(this.pastAppointmentsGrouped).some(group => group.length > 0);
  }

  get hasPastEvents(): boolean {
    return Object.values(this.pastEventsGrouped).some(group => group.length > 0);
  }

  get hasFutureAppointments(): boolean {
    return Object.values(this.filteredAppointmentsGrouped).some(group => group.length > 0);
  }

  get hasFutureEvents(): boolean {
    return Object.values(this.filteredEventsGrouped).some(group => group.length > 0);
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
    // Admins can edit appointments that admins have created
    return this.isAdmin && !!appointment.createdByAdmin
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
        this.eventsService.getAllEvents().subscribe((events: Event[]) => {
          this.events = events;
          this.filterService.updateEvents(events);
        });
      }
    });
  }
}