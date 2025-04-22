import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import { Appointment } from 'src/app/interfaces/appointment';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { ViewChild } from '@angular/core';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { EventInput } from '@fullcalendar/core';
import { ChangeDetectorRef } from '@angular/core';

type GroupedAppointments = { [date: string]: Appointment[] };

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

  appointments: Appointment[] = []; // All fetched appointments
  filteredAppointments: Appointment[] = [];
  groupedAppointments: GroupedAppointments = {};
  
  protected calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
  };

  private authService = inject(AuthService);
  protected isAdmin: boolean = false;

  constructor(private apiService: ApiService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (this.isAdmin) {
        this.apiService.getAllAppointments().subscribe((appointments: Appointment[]) => {
          const now = new Date();
          const futureAppointments = appointments.filter(app => new Date(app.date) >= now);
          const events = this.transformAppointmentsToEvents(futureAppointments);
          const calendarApi = this.calendarComponent.getApi();
          calendarApi.removeAllEventSources();
          calendarApi.addEventSource(events);
        });
      } else {
        this.loadAdminEvents(); // Placeholder for non-admin users
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['daysRange'] || changes['includePast']) {
      this.loadEvents();
    }
  }

  updateListView(): void {
    this.groupedAppointments = this.groupAppointmentsByDate(this.filteredAppointments);
    this.cdr.detectChanges();
  }  

  updateCalendar(): void {
    const events = this.transformAppointmentsToEvents(this.filteredAppointments);
    const calendarApi = this.calendarComponent.getApi();
    calendarApi.removeAllEventSources();
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
    this.apiService.getAllAppointments().pipe(take(1)).subscribe((appointments: Appointment[]) => {
      this.appointments = appointments;
      this.applyFilters();
    });
  }

  private transformAppointmentsToEvents(appointments: Appointment[]): EventInput[] {
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

  loadEvents(): void {
    this.apiService.getAllAppointments().pipe(take(1)).subscribe((appointments: Appointment[]) => {
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

      const events = this.transformAppointmentsToEvents(filteredAppointments);
      const calendarApi = this.calendarComponent.getApi();
      calendarApi.removeAllEventSources();
      calendarApi.addEventSource(events);
    });
  }
  
  private loadAdminEvents(): void {
    // Placeholder for non-admin users
    this.calendarOptions = {
      ...this.calendarOptions,
      events: [
        { title: 'Sample Admin Event', date: new Date().toISOString() }
      ]
    };
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
}
