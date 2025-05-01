import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { FullCalendarComponent, FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppointmentApiService } from 'src/app/services/appointmentApi.service';
import { AuthService } from 'src/app/services/auth.service';
import { EventsApiService } from 'src/app/services/events-api.service';
import { Event } from 'src/app/interfaces/event';

type GroupedAppointments = { [date: string]: Appointment[] };
type GroupedEvents = { [date: string]: Event[] };
@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnChanges {
  @ViewChild('calendar') calendarComponent!: FullCalendarComponent;

  @Input() daysRange: number = -1; // default to "All"
  private _includePast: boolean = false;
  
  @Input()
  set includePast(value: boolean) {
    this._includePast = value;
    this.applyFilters(); // Call your filtering logic here
  }
  
  get includePast(): boolean {
    return this._includePast;
  }

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  groupedAppointments: GroupedAppointments = {};

  events: Event[] = [];
  filteredEvents: Event[] = [];
  groupedEvents: GroupedEvents  = {};
  
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

  constructor(private appointmentApiService: AppointmentApiService, private eventApiService: EventsApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (this.isAdmin) {
        this.appointmentApiService.getAllAppointments().subscribe((appointments: Appointment[]) => {
          const now = new Date();
          const futureAppointments = appointments.filter(app => new Date(app.date) >= now);
          const appointmentsForFullCalendar = this.transformAppointmentsForFullCalendar(futureAppointments);
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEventSources();
          calendarApi.addEventSource(appointmentsForFullCalendar);
        });
      } else if (!this.isAdmin) {
        

        this.eventApiService.getAllEvents().subscribe((events: Event[]) => {
          const eventsForFullCalendar = this.transformEventsForFullCalendar(events);
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEventSources();
          calendarApi.addEventSource(eventsForFullCalendar);
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daysRange'] || changes['includePast']) {
      this.loadAppointments();
      this.loadEvents();
    }
  }

  updateListView(): void {
    this.groupedAppointments = this.groupAppointmentsByDate(this.filteredAppointments);
    this.cdr.detectChanges();
  }

  updateCalendar(): void {
    const appointments = this.transformAppointmentsForFullCalendar(this.filteredAppointments);
    const events = this.transformEventsForFullCalendar(this.filteredEvents);
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEventSources();
    calendarApi.addEventSource(appointments);
    calendarApi.addEventSource(events);
  }
  
  applyFilters(): void {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
  
    if (this.daysRange === -1) {
      startDate = this.includePast ? new Date(0) : now;
      endDate = new Date(8640000000000000); // Maximum possible date
    } else {
      if (this.includePast) {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - this.daysRange);
        endDate = new Date(now);
        endDate.setDate(now.getDate() + this.daysRange);
      } else {
        startDate = new Date(now);
        endDate = new Date(now);
        endDate.setDate(now.getDate() + this.daysRange);
      }
    }
  
    this.filteredAppointments = this.appointments.filter(app => {
      const appDate = new Date(app.date);
      return appDate >= startDate && appDate <= endDate;
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
    return appointments.map(app => ({
      id: app.id?.toString(),
      title: `${app.name} - ${app.type}`,
      start: app.date,
      allDay: false, // Set to true if the event spans the entire day
      extendedProps: {
        appointmentId: app.id,
        appointmentType: app.type,
        // Add other custom properties as needed
      }
    }));
  }

  private transformEventsForFullCalendar(events: Event[]): EventInput[] {
    return events.map(event => ({
      id: event.id?.toString(),
      title: event.eventName,
      start: event.startDate,
      end: event.endDate,
      allDay: true, // Set to true if the event spans the entire day
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

  loadAppointments(): void {
    this.appointmentApiService.getAllAppointments().pipe(take(1)).subscribe((appointments: Appointment[]) => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
  
      if (this.daysRange === -1) {
        startDate = this.includePast ? new Date(0) : now;
        endDate = new Date(8640000000000000); // Maximum possible date
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
  
      const filteredAppointments = appointments.filter(app => {
        const appDate = new Date(app.date);
        return appDate >= startDate && appDate <= endDate;
      });

      const appointmentsForFullCalendar = this.transformAppointmentsForFullCalendar(filteredAppointments);
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEventSources();
      calendarApi.addEventSource(appointmentsForFullCalendar);
    });
  }
  
  loadEvents(): void {
    this.eventApiService.getAllEvents().pipe(take(1)).subscribe((events: Event[]) => {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;
  
      if (this.daysRange === -1) {
        startDate = this.includePast ? new Date(0) : now;
        endDate = new Date(8640000000000000); // Maximum possible date
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
  
      const filteredEvents = events.filter(event => {
        const eventStart = new Date(event.startDate);
        return eventStart >= startDate && eventStart <= endDate;
      });

      const eventsForFullCalendar = this.transformEventsForFullCalendar(filteredEvents);
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEventSources();
      calendarApi.addEventSource(eventsForFullCalendar);
    });
  }

  private groupAppointmentsByDate(appointments: Appointment[]): { [date: string]: Appointment[] } {
    return appointments.reduce((groups: { [date: string]: Appointment[] }, appointment) => {
      const date = new Date(appointment.date).toISOString().split('T')[0];
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(appointment);
      return groups;
    }, {});
  }

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
