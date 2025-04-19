import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { Appointment } from 'src/app/interfaces/appointment';
import { ApiService } from 'src/app/services/api.service';
import { MatSelectModule, MatSelectChange } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-panel',
  imports: [CommonModule, FullCalendarModule, MatSelectModule, MatFormFieldModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent {
  protected appointmentsList: Appointment[] = [];
  protected pastAppointments: Appointment[] = [];
  groupedAppointments: { [date: string]: Appointment[] } = {};
  groupedPastAppointments: { [date: string]: Appointment[] } = {};
  filteredAppointments: { [date: string]: Appointment[] } = {};
  filteredPastAppointments: { [date: string]: Appointment[] } = {};
  daysRange: number = 3;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.apiService.getAllAppointments().subscribe(data => {
      const now = new Date();
      this.appointmentsList = data.sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      this.pastAppointments = this.appointmentsList.filter(a => new Date(a.date) < now);
      const futureAppointments = this.appointmentsList.filter(a => new Date(a.date) >= now);

      this.groupAppointmentsByDate(futureAppointments);
      this.groupPastAppointmentsByDate(this.pastAppointments);
      
      // Filter both future and past appointments based on the selected range
      this.filterAppointmentsByRange(false); // Future appointments
      this.filterAppointmentsByRange(true); // Past appointments
    });
  }

  // Group appointments by date (future appointments)
  groupAppointmentsByDate(appointments: Appointment[]): void {
    this.groupedAppointments = {};
    for (const appointment of appointments) {
      const dateKey = new Date(appointment.date).toLocaleDateString();
      if (!this.groupedAppointments[dateKey]) {
        this.groupedAppointments[dateKey] = [];
      }
      this.groupedAppointments[dateKey].push(appointment);
    }
  }

  // Group past appointments by date
  groupPastAppointmentsByDate(appointments: Appointment[]): void {
    this.groupedPastAppointments = {};
    for (const appointment of appointments) {
      const dateKey = new Date(appointment.date).toLocaleDateString();
      if (!this.groupedPastAppointments[dateKey]) {
        this.groupedPastAppointments[dateKey] = [];
      }
      this.groupedPastAppointments[dateKey].push(appointment);
    }
  }

  // Filter appointments (future or past) based on the selected date range
  filterAppointmentsByRange(isPast: boolean): void {
    const today = new Date();
    
    // If no range is selected, show all appointments
    if (this.daysRange === -1) {
      if (isPast) {
        this.filteredPastAppointments = { ...this.groupedPastAppointments };
      } else {
        this.filteredAppointments = { ...this.groupedAppointments };
      }
      return;
    }

    const startDate = new Date(today);
    const endDate = new Date(today);

    if (isPast) {
      // For past appointments, set the start date to be 'daysRange' days before today
      startDate.setDate(today.getDate() - this.daysRange);
    } else {
      // For future appointments, set the end date to be 'daysRange' days after today
      endDate.setDate(today.getDate() + this.daysRange);
    }

    // Filter appointments based on the range
    const group = isPast ? this.groupedPastAppointments : this.groupedAppointments;
    const filteredAppointments = Object.keys(group)
      .filter(dateStr => {
        const appointmentDate = new Date(dateStr);
        return isPast
          ? appointmentDate <= today && appointmentDate >= startDate
          : appointmentDate >= today && appointmentDate <= endDate;
      })
      .reduce((filtered, dateStr) => {
        filtered[dateStr] = group[dateStr];
        return filtered;
      }, {} as { [date: string]: Appointment[] });

    // Assign filtered results to the correct property
    if (isPast) {
      this.filteredPastAppointments = filteredAppointments;
    } else {
      this.filteredAppointments = filteredAppointments;
    }
  }

  // Set the range and filter the appointments
  setRange(value: number): void {
    this.daysRange = value;
    this.filterAppointmentsByRange(false); // Future appointments
    this.filterAppointmentsByRange(true); // Past appointments
  }

  onRangeChange(event: MatSelectChange): void {
    this.setRange(event.value);
  }

  // Sort keys (dates) in ascending order
  getSortedKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
