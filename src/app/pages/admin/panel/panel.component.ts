import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectChange } from '@angular/material/select';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { take } from 'rxjs';
import { CalendarViewComponent } from 'src/app/components/shared/calendar-view/calendar-view.component';
import { EventListComponent } from 'src/app/components/event-list-component/event-list-component.component';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { EventsService } from 'src/app/services/events.service';

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [
    CommonModule,
    CalendarViewComponent,
    EventListComponent,
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

  constructor(private eventsService: EventsService, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      this.fetchData();
    });
  }

  fetchData(): void {
    this.eventsService.fetchAppointmentsAndEvents(this.isAdmin).subscribe(
      ([appointments, events]) => {
        this.appointments = appointments;
        this.events = events;
      }
    );
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
    },};
}