import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { AppointmentFormComponent } from 'src/app/components/book-appointment-form/book-appointment-form/book-appointment-form.component';
import { Appointment } from 'src/app/interfaces/appointment';
import { BookAppointment } from 'src/app/services/bookAppointment.service';
@Component({
    selector: 'app-events',
    imports: [FullCalendarModule, CommonModule],
    standalone: true,
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    providers: [BookAppointment]
})

export class EventsComponent {
  protected appointmentsList: Appointment[] = [];

  readingForm: AppointmentFormComponent | undefined;

  constructor(private bookAppointment: BookAppointment) {
    
  }

  ngOnInit(): void {
    const data = this.bookAppointment.appointment;
    console.log(data);
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
