import { NgIf } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventsService } from 'src/app/services/events.service';
import { EventFilterComponent } from '../../shared/event-filter/event-filter.component';
@Component({
  selector: 'app-calendar-view',
  imports: [FullCalendarModule, EventFilterComponent, NgIf],
  inputs: ['calendarOptions'],
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css'],
})
export class CalendarViewComponent {
  @Input() calendarOptions!: CalendarOptions;

  @Input() events: Event[] = [];
  @Input() appointments: Appointment[] = [];

  @Input() filteredEventsGrouped: { [date: string]: Event[] } = {};
  @Input() filteredAppointmentsGrouped: { [date: string]: Appointment[] } = {};

  sortedDates: string[] = [];
  showPanel = false;

  filteredEventsFlat: Event[] = [];
  filteredAppointmentsFlat: Appointment[] = [];

  private authService = inject(AuthService);
  protected isAdmin: boolean = false;

  constructor(
    private deleteService: DeleteEventService,
    private appointmentApiService: AppointmentApiService,
    private eventsApiService: EventsApiService,
    private eventsService: EventsService,
    private filterService: EventFilterService
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
  
      this.loadData();
    });

    this.calendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      events: [],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      eventClick: this.handleEventClick.bind(this),
    };
  }
  
  groupByDate(items: Appointment[]): { [date: string]: Appointment[] };
  groupByDate(items: Event[]): { [date: string]: Event[] };
  groupByDate<T extends { startDate?: string; date?: string }>(items: T[]): { [date: string]: T[] } {
    return items.reduce((acc, item) => {
      const rawDate = item.startDate || item.date;
  
      if (!rawDate) {
        console.warn('Missing date/startDate in item:', item);
        return acc;
      }
  
      const date = rawDate.split('T')[0];
      acc[date] = acc[date] || [];
      acc[date].push(item);
      return acc;
    }, {} as { [date: string]: T[] });
  }
  
  loadData(): void {
    this.eventsService.fetchAppointmentsAndEvents(this.isAdmin).subscribe(([appointments, events]) => {
      this.appointments = appointments;
      this.events = events;
  
      // Filter out malformed data
      this.appointments = appointments.filter(a => !!a.date);
      this.events = events.filter(e => !!e.startDate);

      // Populate grouped data if applicable
      this.filteredAppointmentsGrouped = this.groupByDate(appointments);
      this.filteredEventsGrouped = this.groupByDate(events);

      // Share data with filter service
      this.filterService.appointmentsList = appointments;
      this.filterService.eventsList = events;

      // Grouping data by date
      this.filterService.groupedAppointments = this.filterService.groupItemsByDate(appointments, 'date');
      this.filterService.groupedPastAppointments = this.filterService.groupItemsByDate(
        appointments.filter(a => new Date(a.date) < new Date()), 'date'
      );

      this.filterService.groupedEvents = this.filterService.groupItemsByDate(events, 'startDate');
      this.filterService.groupedPastEvents = this.filterService.groupItemsByDate(
        events.filter(e => new Date(e.startDate) < new Date()), 'startDate'
      );

      // Apply initial filter
      this.filterService.setRange(this.filterService.daysRange);

      // Refresh component view with filtered data
      this.updateFilteredData();
  
      this.updateFilteredData();
      this.updateCalendar();
    });
  }

  updateFilteredData(): void {
    const includePast = this.filterService.includePast;

    this.filteredAppointmentsGrouped = includePast
      ? {
          ...this.filterService.filteredAppointments,
          ...this.filterService.filteredPastAppointments,
        }
      : this.filterService.filteredAppointments;

    this.filteredEventsGrouped = includePast
      ? {
          ...this.filterService.filteredEvents,
          ...this.filterService.filteredPastEvents,
        }
      : this.filterService.filteredEvents;

    const allKeys = new Set([
      ...Object.keys(this.filteredAppointmentsGrouped),
      ...Object.keys(this.filteredEventsGrouped),
    ]);

    this.sortedDates = Array.from(allKeys).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }

  onFilterChange(): void {
    this.updateFilteredData();
    this.updateCalendar();
  }
  
  updateCalendar(): void {
    // Flatten grouped appointment and event objects into arrays
    const flatAppointments = Object.values(this.filteredAppointmentsGrouped).flat();
    const flatEvents = Object.values(this.filteredEventsGrouped).flat();
  
    // Store flattened lists for reference (e.g., deletion)
    this.filteredAppointmentsFlat = flatAppointments;
    this.filteredEventsFlat = flatEvents;
  
    // Transform for FullCalendar
    const calendarAppointments = this.eventsService.transformAppointmentsForFullCalendar(flatAppointments);
    const calendarEvents = this.eventsService.transformEventsForFullCalendar(flatEvents);
  
    // Assign to calendar options
    this.calendarOptions.events = [...calendarAppointments, ...calendarEvents];
  }
  
  selectedEvent: EventInput | null = null

  handleEventClick(clickInfo: EventClickArg) {
    console.log('Event clicked:', clickInfo.event);
    this.selectedEvent = {
      title: clickInfo.event.title,
      extendedProps: { ...clickInfo.event.extendedProps }
    };
    this.showPanel = true;
  }

  closeEventDetails() {
    this.showPanel = false;
    this.selectedEvent = null;
  }

  getCustomKeys(props: any): string[] {
    return Object.keys(props);
  }

  deleteEvent(): void {
    const id = this.selectedEvent?.extendedProps?.['eventId'] || this.selectedEvent?.extendedProps?.['id'];
    if (!id) {
      alert('Invalid event ID');
      return;
    }
  
    this.deleteService.deleteEvent(
      id,
      this.filteredEventsFlat,
      this.filteredEventsGrouped,
      () => this.updateCalendar(),
      () => {
        if (
          this.selectedEvent?.extendedProps?.['eventId'] === id ||
          this.selectedEvent?.extendedProps?.['id'] === id
        ) {
          this.closeEventDetails();
        }
      }
    );
  }
  
  deleteAppointment(): void {
    const id = this.selectedEvent?.extendedProps?.['appointmentId'] || this.selectedEvent?.extendedProps?.['id'];
    if (!id) {
      alert('Invalid appointment ID');
      return;
    }
  
    this.deleteService.deleteAppointment(
      id,
      this.filteredAppointmentsFlat,
      this.filteredAppointmentsGrouped,
      () => this.updateCalendar(),
      () => {
        if (
          this.selectedEvent?.extendedProps?.['appointmentId'] === id ||
          this.selectedEvent?.extendedProps?.['id'] === id
        ) {
          this.closeEventDetails();
        }
      }
    );
  }

  get filteredPastAppointmentsGrouped() {
    return this.filterService.filteredPastAppointments;
  }

  get filteredPastEventsGrouped() {
    return this.filterService.filteredPastEvents;
  }
  
  get includePast() {
    return this.filterService.includePast;
  }

  get sortedPastDates() {
    return this.filterService.getSortedKeys(this.filteredPastAppointmentsGrouped);
  }
}