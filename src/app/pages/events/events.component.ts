import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { Appointment } from 'src/app/interfaces/appointment';
import { ApiService } from 'src/app/services/api.service';
@Component({
    selector: 'app-events',
    imports: [FullCalendarModule, CommonModule],
    standalone: true,
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    providers: []
})

export class EventsComponent {
  protected appointmentsList: Appointment[] = [];

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAll().subscribe(data => {
      this.appointmentsList = data;
    });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
