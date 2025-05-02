import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppointmentApiService } from 'src/app/services/appointmentApi.service';
import { EventsComponent } from '../../events/events.component';
import { EventsApiService } from 'src/app/services/events-api.service';
import { Event as CustomEvent } from 'src/app/interfaces/event';
import { AuthService } from 'src/app/services/auth.service';
import { take } from 'rxjs';
@Component({
  selector: 'app-panel',
  imports: [CommonModule, EventsComponent, FullCalendarModule, MatSelectModule, MatFormFieldModule, MatCardModule, MatSlideToggleModule, FormsModule, MatButtonModule],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.css'
})
export class PanelComponent {
  @ViewChild(EventsComponent) eventsComponent!: EventsComponent;

  protected appointmentsList: Appointment[] = [];
  protected pastAppointments: Appointment[] = [];
  groupedAppointments: { [date: string]: Appointment[] } = {};
  groupedPastAppointments: { [date: string]: Appointment[] } = {};
  filteredAppointments: { [date: string]: Appointment[] } = {};
  filteredPastAppointments: { [date: string]: Appointment[] } = {};
  
  protected eventsList: CustomEvent[] = [];
  protected pastEvents: CustomEvent[] = [];
  groupedEvents: { [date: string]: CustomEvent[] } = {};
  groupedPastEvents: { [date: string]: CustomEvent[] } = {};
  filteredEvents: { [date: string]: CustomEvent[] } = {};
  filteredPastEvents: { [date: string]: CustomEvent[] } = {};

  includePast: boolean = false;
  daysRange: number = 3;
  
  private authService = inject(AuthService);
  protected isAdmin: boolean = false;

  constructor(private appointmentApiService: AppointmentApiService, private eventApiService: EventsApiService) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';
    });

    this.appointmentApiService.getAllAppointments().subscribe(data => {
      this.appointmentsList = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
      const now = new Date();
      const pastAppointments = this.appointmentsList.filter(a => new Date(a.date) < now);
      const futureAppointments = this.appointmentsList.filter(a => new Date(a.date) >= now);
  
      this.groupedAppointments = this.groupItemsByDate(futureAppointments, 'date');
      this.groupedPastAppointments = this.groupItemsByDate(pastAppointments, 'date');
  
      this.filteredAppointments = this.filterItemsByRange(this.groupedAppointments, this.daysRange, false);
      this.filteredPastAppointments = this.filterItemsByRange(this.groupedPastAppointments, this.daysRange, true);
    });
  
    this.eventApiService.getAllEvents().subscribe(data => {
      this.eventsList = data.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  
      const now = new Date();
      const pastEvents = this.eventsList.filter(e => new Date(e.startDate) < now);
      const futureEvents = this.eventsList.filter(e => new Date(e.startDate) >= now);
  
      this.groupedEvents = this.groupItemsByDate(futureEvents, 'startDate');
      this.groupedPastEvents = this.groupItemsByDate(pastEvents, 'startDate');

      this.filteredEvents = this.filterItemsByRange(this.groupedEvents, this.daysRange, false);
      this.filteredPastEvents = this.filterItemsByRange(this.groupedPastEvents, this.daysRange, true);
    });
  }

  handleIncludePastChange(value: boolean): void {
    this.includePast = value;
    // Re-filter appointments based on the new includePast value
    this.filteredAppointments = this.filterItemsByRange(this.groupedAppointments, this.daysRange, false);
    this.filteredPastAppointments = this.filterItemsByRange(this.groupedPastAppointments, this.daysRange, true);

    this.filteredEvents = this.filterItemsByRange(this.groupedEvents, this.daysRange, false);
    this.filteredPastEvents = this.filterItemsByRange(this.groupedPastEvents, this.daysRange, true);
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

  // Generic function to group Events and Appointments by date
  private groupItemsByDate<T>(items: T[], dateKey: keyof T): { [date: string]: T[] } {
    return items.reduce((grouped, item) => {
      const rawDate = item[dateKey];
      if (!rawDate) return grouped;
  
      const date = new Date(rawDate as any).toISOString().split('T')[0]; // 'YYYY-MM-DD'
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
      return grouped;
    }, {} as { [date: string]: T[] });
  }

  // Generic filtering function for Events and Appointments
  private filterItemsByRange<T>(
    groupedItems: { [date: string]: T[] },
    daysRange: number,
    isPast: boolean
  ): { [date: string]: T[] } {
    const today = new Date();

    if (daysRange === -1) {
      return { ...groupedItems };
    }

    const startDate = new Date(today);
    const endDate = new Date(today);
    isPast
      ? startDate.setDate(today.getDate() - daysRange)
      : endDate.setDate(today.getDate() + daysRange);

    return Object.entries(groupedItems).reduce((filtered, [dateStr, items]) => {
      const itemDate = new Date(dateStr + 'T00:00:00');
      const isInRange = isPast
        ? itemDate <= today && itemDate >= startDate
        : itemDate >= today && itemDate <= endDate;

      if (isInRange) {
        filtered[dateStr] = items;
      }
      return filtered;
    }, {} as { [date: string]: T[] });
  }

  // Set the range and filter the appointments
  setRange(value: number): void {
    this.daysRange = value;

    this.filteredAppointments = this.filterItemsByRange(this.groupedAppointments, this.daysRange, false);
    this.filteredPastAppointments = this.filterItemsByRange(this.groupedPastAppointments, this.daysRange, true);

    this.filteredEvents = this.filterItemsByRange(this.groupedEvents, this.daysRange, false);
    this.filteredPastEvents = this.filterItemsByRange(this.groupedPastEvents, this.daysRange, true);
  }

  onRangeChange(event: MatSelectChange): void {
    this.setRange(event.value);
  }

  // Sort keys (dates) in ascending order
  getSortedKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  showCalendar: boolean = false;

  toggleView(): void {
    this.showCalendar = !this.showCalendar;
  }

  @Output() eventDeleted = new EventEmitter<number>();
  @Output() appointmentDeleted = new EventEmitter<number>();

  public deleteAppointment(id: number, onSuccess?: () => void): void {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
  
    this.appointmentApiService.deleteAppointment(id).pipe(take(1)).subscribe({
      next: () => {
        this.appointmentDeleted.emit(id);
        this.appointmentsList = this.appointmentsList.filter(a => a.id !== id);
  
        for (const date in this.filteredAppointments) {
          this.filteredAppointments[date] = this.filteredAppointments[date].filter(a => a.id !== id);
        }
  
        this.eventsComponent.updateCalendar();
        this.eventsComponent.updateListView();
        onSuccess?.();
      },
      error: err => {
        console.error('Failed to delete appointment:', err);
        alert('Could not delete appointment.');
      }
    });
  }  
    
    public deleteEvent(id: number, onSuccess?: () => void): void {
      if (!confirm('Are you sure you want to delete this event?')) return;
    
      this.eventApiService.deleteEvent(id).pipe(take(1)).subscribe({
        next: () => {
          this.eventDeleted.emit(id);
          this.eventsList = this.eventsList.filter(e => e.id !== id);

          for (const date in this.filteredEvents) {
            this.filteredEvents[date] = this.filteredEvents[date].filter(e => e.id !== id);
          }

          this.eventsComponent.updateCalendar();
          this.eventsComponent.updateListView();
          onSuccess?.();
        },
        error: err => {
          console.error('Failed to delete event:', err);
          alert('Could not delete event.');
        }
      });
    }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
