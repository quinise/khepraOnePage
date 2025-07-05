import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { take } from 'rxjs';
import { EventListComponent } from 'src/app/components/event-list-component/event-list-component.component';
import { CalendarViewComponent } from 'src/app/components/shared/calendar-view/calendar-view.component';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { EventsService } from 'src/app/services/events.service';
import { IfViewDirective } from 'src/app/shared/ifViewDirective';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule,
    CalendarViewComponent,
    EventListComponent,
    IfViewDirective,
    MatButtonModule,
  ],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css',
})
export class PanelComponent implements OnInit {
  showCalendar: boolean = true;

  appointments: Appointment[] = [];
  events: Event[] = [];
  
  isAdmin: boolean = false;

  // Optional: Add error message fields if you want to show errors in the UI
  errorMessage: string | null = null;

  constructor(
    private appointmentsApiService: AppointmentApiService,
    private eventsApiService: EventsApiService,
    private eventsService: EventsService,
    private authService: AuthService,
    private authWrapperService: AuthWrapperService,
    private eventStore: EventStoreService
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user) => {
        this.isAdmin = user?.role === 'admin';
        this.fetchData();
      },
      error: () => {
        this.handleError('Failed to load user data');
      }
    });
  }

  fetchData(): void {
    const userId = this.authWrapperService.getCurrentUser()?.uid || '';

    this.eventsService.fetchAppointmentsAndEvents(this.isAdmin, userId, null).subscribe({
      next: ([appointments, events]) => {
        this.appointments = appointments;
        this.events = events;
        this.eventStore.setEvents(events);
        this.errorMessage = '';
      },
      error: () => {
        this.appointments = [];
        this.events = [];
        this.errorMessage = 'Failed to load calendar data';
      }
    });
  }

  handleError(message: string): void {
    this.appointments = [];
    this.events = [];
    this.errorMessage = message;
  }


  toggleView(): void {
    this.showCalendar = !this.showCalendar;
  }

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    events: [],
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay',
    },
  };
}