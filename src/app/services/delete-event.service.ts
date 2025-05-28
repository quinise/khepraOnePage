import { Injectable } from '@angular/core';
import { Appointment } from '../interfaces/appointment';
import { Event } from '../interfaces/event';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { EventsApiService } from './apis/events-api.service';
import { EventStoreService } from './event-store.service';

@Injectable({
  providedIn: 'root',
})
export class DeleteEventService {
  constructor(
    private eventStore: EventStoreService,
    private eventsApiService: EventsApiService,
    private appointmentApiService: AppointmentApiService
  ) {}

  deleteEvent(id: string, events: Event[], onSuccess: () => void, onComplete: () => void): void {
    const numericId = Number(id); // Convert string to number
    const event = events.find(e => e.id === numericId);

    if (!event) {
      alert('Event not found');
      onComplete();
      return;
    }

    if (event.id === undefined) {
      console.error('Cannot delete event: missing event ID');
      return;
    }

    const now = new Date();
    const eventDate = new Date(event.startDate); // Ensure event.date is an ISO string or Date object

    if (eventDate < now) {
      alert('Cannot delete events that have already occurred.');
      onComplete();
      return;
    }

    if (!confirm(`Are you sure you want to delete this event: "${event.eventName}"?`)) {
      onComplete();
      return;
    }

    this.eventsApiService.deleteEvent(event.id).subscribe({
      next: () => {
        if (typeof event.id === 'number') {
          this.eventStore.removeEventById(String(event.id));
        }
        onSuccess();
      },
      error: (err) => {
        console.error('Failed to delete event', err);
        alert('Failed to delete event');
      },
      complete: onComplete,
    });
  }

  deleteAppointment(id: string, appointments: Appointment[], onSuccess: () => void, onComplete: () => void): void {
    const numericId = Number(id);
    const appointment = appointments.find(a => a.id === numericId);

    if (!appointment) {
      alert('Appointment not found');
      onComplete();
      return;
    }

    if (appointment.id === undefined) {
      console.error('Cannot delete appointment: missing appointment ID');
      return;
    }

    const now = new Date();
    const appointmentDate = new Date(appointment.date); // Ensure `appointment.date` is a proper ISO string or Date

    if (appointmentDate < now) {
      alert('Cannot delete appointments that have already occurred.');
      onComplete();
      return;
    }

    if (!confirm(`Are you sure you want to delete this appointment: "${appointment.name}"?`)) {
      onComplete();
      return;
    }

    this.appointmentApiService.deleteAppointment(appointment.id).subscribe({
      next: () => {
        this.eventStore.removeAppointmentById(String(appointment.id));
        onSuccess();
      },
      error: (err) => {
        console.error('Failed to delete appointment', err);
        alert('Failed to delete appointment');
      },
      complete: onComplete,
    });
  }
}