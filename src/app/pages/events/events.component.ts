import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { forkJoin, of, take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/appointmentApi.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsApiService } from 'src/app/services/events-api.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnChanges, AfterViewInit {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;
  private calendarReady = false;
  private listReady = false;

  @Input() daysRange: number = -1;
  private _includePast: boolean = false;

  @Input()
  set includePast(value: boolean) {
    this._includePast = value;
    if (this.calendarReady || this.listReady) {
      this.applyFilters();
    }
  }

  get includePast(): boolean {
    return this._includePast;
  }

  @Output() appointmentDeleted = new EventEmitter<number>();
  @Output() eventDeleted = new EventEmitter<number>();  

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  groupedAppointments: { [date: string]: Appointment[] } = {};

  events: Event[] = [];
  filteredEvents: Event[] = [];
  groupedEvents: { [date: string]: Event[] } = {};

  displayedListEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  protected calendarOptions: CalendarOptions = {
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

  private authService = inject(AuthService);
  protected isAdmin: boolean = false;

  constructor(
    private appointmentApiService: AppointmentApiService,
    private eventApiService: EventsApiService,
  ) {}

  ngAfterViewInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.calendarReady = true;
      this.loadCalendarEvents();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daysRange'] || changes['includePast']) {
      this.applyFilters();
    }
  }

  updateListView(): void {
    if (!this.listReady) return;

    const combined = [
      ...this.filteredAppointments.map(appointment => ({
        id: appointment.id,
        title: appointment.name,
        date: new Date(appointment.date).toISOString(),
        type: 'appointment' as const,
      })),
      ...this.filteredEvents.map(event => ({
        id: event.id,
        title: event.eventName,
        date: new Date(event.startDate).toISOString(),
        type: 'event' as const,
      })),
    ];

    this.displayedListEvents = combined.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  updateCalendar(): void {
    if (!this.calendarReady || !this.calendarComponent) return;

    const appointments = this.transformAppointmentsForFullCalendar(this.filteredAppointments);
    const events = this.transformEventsForFullCalendar(this.filteredEvents);
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEventSources();
    calendarApi.addEventSource(appointments);
    calendarApi.addEventSource(events);
  }

  applyFilters(): void {    
    if (!this.calendarReady) return;
  
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
  
    if (this.daysRange === -1) {
      startDate = this.includePast ? new Date(0) : now;
      endDate = new Date(8640000000000000);
    } else {
      startDate = new Date(now);
      endDate = new Date(now);
      if (this.includePast) {
        startDate.setDate(now.getDate() - this.daysRange);
        endDate.setDate(now.getDate() + this.daysRange);
      } else {
        endDate.setDate(now.getDate() + this.daysRange);
      }
    }
  
    this.filteredAppointments = this.appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= startDate && appDate <= endDate;
    });
  
    this.filteredEvents = this.events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate >= startDate && eventDate <= endDate;
    });
  
    this.updateCalendar();
    this.updateListView();
  }
  

  fetchAndFilterAppointments(): void {
    this.appointmentApiService.getAllAppointments().pipe(take(1)).subscribe((appointments: Appointment[]) => {
      this.appointments = appointments;
      this.applyFilters();
    });
  }

  private transformAppointmentsForFullCalendar(appointments: Appointment[]): EventInput[] {
    return appointments.map(appointment => ({
      id: appointment.id?.toString(),
      title: `${appointment.name} - ${appointment.type}`,
      start: appointment.date,
      allDay: false,
      extendedProps: {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        appointmentName: appointment.name,
        appointmentEmail: appointment.email,
        appointmentPhone: appointment.phoneNumber,
        appointmentDate: appointment.date,
        appointmentVirtual: appointment.isVirtual,
      }
    }));
  }

  private transformEventsForFullCalendar(events: Event[]): EventInput[] {
    return events.map(event => ({
      id: event.id?.toString(),
      title: event.eventName,
      start: event.startDate,
      end: event.endDate,
      allDay: true,
      extendedProps: {
        eventId: event.id,
        eventName: event.eventName,
        eventType: event.eventType,
        eventStart: event.startDate,
        eventEnd: event.endDate,
        eventDescription: event.description,
        eventVirtual: event.isVirtual,
        eventStreet: event.streetAddress,
        eventCity: event.city,
        eventState: event.state,
        eventZip: event.zipCode,
      }
    }));
  }

  private loadCalendarEvents(): void {
    const appointment$ = this.isAdmin
      ? this.appointmentApiService.getAllAppointments().pipe(take(1))
      : of([]);

    const event$ = this.eventApiService.getAllEvents().pipe(take(1));

    forkJoin([appointment$, event$]).subscribe(([appointments, events]) => {
      this.appointments = appointments as Appointment[];
      this.events = events;

      this.filteredAppointments = this.appointments;
      this.filteredEvents = this.events;

      this.listReady = true;
      this.applyFilters();
    });
  }

  deleteSelectedEvent(): void {
    if (!this.selectedEvent || !this.isAdmin) return;
  
    const appointmentId = this.selectedEvent.extendedProps?.['appointmentId'];
    const eventId = this.selectedEvent.extendedProps?.['eventId'];
  
    if (appointmentId) {
      if (!confirm('Are you sure you want to delete this appointment?')) return;
  
      this.appointmentApiService.deleteAppointment(appointmentId).pipe(take(1)).subscribe({
        next: () => {
          this.appointmentDeleted.emit(appointmentId);
          this.appointments = this.appointments.filter(a => a.id !== appointmentId);
          this.filteredAppointments = this.filteredAppointments.filter(a => a.id !== appointmentId);
          this.selectedEvent = null;
          this.updateCalendar();
          this.updateListView();
        },
        error: err => {
          console.error('Failed to delete appointment:', err);
          alert('Could not delete appointment.');
        }
      });
    }
  
    if (eventId) {
      if (!confirm('Are you sure you want to delete this event?')) return;
  
      this.eventApiService.deleteEvent(eventId).pipe(take(1)).subscribe({
        next: () => {
          this.eventDeleted.emit(eventId);
          this.events = this.events.filter(e => e.id !== eventId);
          this.filteredEvents = this.filteredEvents.filter(e => e.id !== eventId);
          this.selectedEvent = null;
          this.updateCalendar();
          this.updateListView();
        },
        error: err => {
          console.error('Failed to delete event:', err);
          alert('Could not delete event.');
        }
      });
    }
  }

  selectedAppointment: EventInput | null = null;
  selectedEvent: EventInput | null = null;


  handleEventClick(arg: any): void {
    this.selectedEvent = arg.event;
  }

  closeEventDetails(): void {
    this.selectedEvent = null;
  }

  getCustomKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }
}