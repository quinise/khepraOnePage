import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';

@Injectable({
  providedIn: 'root',
})
export class EventsService {
  constructor(
    private appointmentApiService: AppointmentApiService,
    private eventApiService: EventsApiService
  ) {}

  fetchAppointmentsAndEvents(isAdmin: boolean): Observable<[Appointment[], Event[]]> {
    const appointment$ = isAdmin
      ? this.appointmentApiService.getAllAppointments().pipe(
          take(1),) : of([]);
  
    const event$ = this.eventApiService.getAllEvents().pipe(
      take(1));
  
    return forkJoin([appointment$, event$]);
  }
  

  transformAppointmentsForFullCalendar(appointments: Appointment[]): any[] {
    return appointments.map(appointment => ({
      id: appointment.id?.toString(),
      title: `${appointment.name} - ${appointment.type}`,
      start: appointment.date,
      allDay: false,
      extendedProps: {
        appointmentId: appointment.id,
        appointmentType: appointment.type,
        appointmentName: appointment.name,
        appointmentEmail: appointment.email,
        appointmentPhone: appointment.phoneNumber,
        appointmentDate: appointment.date,
        appointmentVirtual: appointment.isVirtual,
      },
    }));
  }

  transformEventsForFullCalendar(events: Event[]): any[] {
    return events.map(event => ({
      id: event.id?.toString(),
      title: event.eventName,
      start: event.startDate,
      end: event.endDate,
      allDay: true,
      extendedProps: {
        eventId: event.id,
        eventName: event.eventName,
        eventType: event.eventType,
        eventStart: event.startDate,
        eventEnd: event.endDate,
        eventDescription: event.description,
        eventVirtual: event.isVirtual,
        eventStreet: event.streetAddress,
        eventCity: event.city,
        eventState: event.state,
        eventZip: event.zipCode,
      },
    }));
  }
}