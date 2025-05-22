import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Event } from '../interfaces/event';
import { Appointment } from '../interfaces/appointment';

@Injectable({
  providedIn: 'root',
})
export class EventStoreService {
  private eventsSubject = new BehaviorSubject<Event[]>([]);
  private appointmentsSubject = new BehaviorSubject<Appointment[]>([]);

  events$ = this.eventsSubject.asObservable();
  appointments$ = this.appointmentsSubject.asObservable();

  setEvents(events: Event[]): void {
    this.eventsSubject.next(events);
  }

  setAppointments(appointments: Appointment[]): void {
    this.appointmentsSubject.next(appointments);
  }

  removeEventById(id: string): void {
    const numericId = Number(id); // Convert string to number
  
    const updated = this.eventsSubject.getValue().filter(
      e => e.id !== numericId && e.id !== numericId
    );
  
    this.eventsSubject.next(updated);
  }
  

  removeAppointmentById(id: string): void {
    const numericId = Number(id); // Convert string to number

    const updated = this.appointmentsSubject.getValue().filter(
      a => a.id !== numericId && a.id !== numericId
    );
    this.appointmentsSubject.next(updated);
  }

  // Upsert (update if exists, else insert)
  upsertEvent(updatedEvent: Event): void {
    const current = this.eventsSubject.getValue();
    const index = current.findIndex(e => e.id === updatedEvent.id);

    const updated = index !== -1
      ? [...current.slice(0, index), updatedEvent, ...current.slice(index + 1)]
      : [...current, updatedEvent];

    this.eventsSubject.next(updated);
  }

  upsertAppointment(updatedAppointment: Appointment): void {
    const current = this.appointmentsSubject.getValue();
    const index = current.findIndex(a => a.id === updatedAppointment.id);

    const updated = index !== -1
      ? [...current.slice(0, index), updatedAppointment, ...current.slice(index + 1)]
      : [...current, updatedAppointment];

    this.appointmentsSubject.next(updated);
  }
}