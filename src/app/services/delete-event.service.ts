import { Injectable, EventEmitter } from '@angular/core';
import { take } from 'rxjs';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { EventsApiService } from './apis/events-api.service';
import { Appointment } from '../interfaces/appointment';
import { Event } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class DeleteEventService {
  appointmentDeleted = new EventEmitter<number>();
  eventDeleted = new EventEmitter<number>();

  constructor(
    private appointmentApiService: AppointmentApiService,
    private eventApiService: EventsApiService
  ) {}

  deleteAppointment(
    id: number,
    flatAppointments: Appointment[],
    groupedAppointments: { [date: string]: Appointment[] },
    onSuccess: () => void,
    onCleanup?: () => void
  ): void {
    if (!confirm('Are you sure you want to delete this appointment?')) return;
  
    this.appointmentApiService.deleteAppointment(id).pipe(take(1)).subscribe({
      next: () => {
        this.appointmentDeleted.emit(id);
  
        // Remove from flat list
        const index = flatAppointments.findIndex(a => a.id === id);
        if (index > -1) flatAppointments.splice(index, 1);
  
        // Remove from grouped object
        for (const date in groupedAppointments) {
          groupedAppointments[date] = groupedAppointments[date].filter(a => a.id !== id);
          if (groupedAppointments[date].length === 0) delete groupedAppointments[date];
        }
  
        onSuccess();
        onCleanup?.();
      },
      error: err => {
        console.error('Failed to delete appointment:', err);
        alert('Could not delete appointment.');
      }
    });
  }
  
  deleteEvent(
    id: number,
    flatEvents: Event[],
    groupedEvents: { [date: string]: Event[] },
    onSuccess: () => void,
    onCleanup?: () => void
  ): void {
    if (!confirm('Are you sure you want to delete this event?')) return;
  
    this.eventApiService.deleteEvent(id).pipe(take(1)).subscribe({
      next: () => {
        this.eventDeleted.emit(id);
  
        // Remove from flat list
        const index = flatEvents.findIndex(e => e.id === id);
        if (index > -1) flatEvents.splice(index, 1);
  
        // Remove from grouped object
        for (const date in groupedEvents) {
          groupedEvents[date] = groupedEvents[date].filter(e => e.id !== id);
          if (groupedEvents[date].length === 0) delete groupedEvents[date];
        }
  
        onSuccess();
        onCleanup?.();
      },
      error: err => {
        console.error('Failed to delete event:', err);
        alert('Could not delete event.');
      }
    });
  }

  private filterOutItem<T extends { id?: number }>(
    list: T[] | { [key: string]: T[] },
    id: number
  ): void {
    if (Array.isArray(list)) {
      const index = list.findIndex(item => item.id === id);
      if (index !== -1) list.splice(index, 1);
    } else {
      for (const key in list) {
        list[key] = list[key].filter(item => item.id !== id);
      }
    }
  }
}