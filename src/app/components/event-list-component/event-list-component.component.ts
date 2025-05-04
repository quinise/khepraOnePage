import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventsService } from 'src/app/services/events.service';
import { EventFilterComponent } from '../shared/event-filter/event-filter.component';

@Component({
  selector: 'app-event-list',
  standalone: true,
  imports: [CommonModule, EventFilterComponent, NgFor],
  templateUrl: './event-list-component.component.html',
  styleUrls: ['./event-list-component.component.css'],
})
export class EventListComponent implements OnInit {
  @Input() events: Event[] = [];
  @Input() appointments: Appointment[] = [];

  filteredAppointmentsGrouped: { [date: string]: Appointment[] } = {};
  filteredEventsGrouped: { [date: string]: Event[] } = {};
  
  displayedListEvents: {
    id: number | string | undefined;
    title: string;
    date: string;
    type: 'appointment' | 'event';
  }[] = [];

  sortedDates: string[] = [];

  constructor(
    private deleteService: DeleteEventService,
    private appointmentApiService: AppointmentApiService,
    private eventsApiService: EventsApiService,
    private eventsService: EventsService,
    private filterService: EventFilterService

  ){}
  
  ngOnInit(): void {
    this.updateFilteredData();
  }

  updateFilteredData(): void {
    const includePast = this.filterService.includePast;

    this.filteredAppointmentsGrouped = includePast
      ? {
          ...this.filterService.filteredAppointments,
          ...this.filterService.filteredPastAppointments,
        }
      : this.filterService.filteredAppointments;

    this.filteredEventsGrouped = includePast
      ? {
          ...this.filterService.filteredEvents,
          ...this.filterService.filteredPastEvents,
        }
      : this.filterService.filteredEvents;

    const allKeys = new Set([
      ...Object.keys(this.filteredAppointmentsGrouped),
      ...Object.keys(this.filteredEventsGrouped),
    ]);

    this.sortedDates = Array.from(allKeys).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );
  }

  updateListView(): void {
    const appointmentList = Object.values(this.filteredAppointmentsGrouped).flat();
    const eventList = Object.values(this.filteredEventsGrouped).flat();

    const combined = [
      ...appointmentList.map(appointment => ({
        id: appointment.id,
        title: appointment.name,
        date: new Date(appointment.date).toISOString(),
        type: 'appointment' as const,
      })),
      ...eventList.map(event => ({
        id: event.id,
        title: event.eventName,
        date: new Date(event.startDate).toISOString(),
        type: 'event' as const,
      })),
    ];

    this.displayedListEvents = combined.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  deleteAppointment(id: number): void {
    this.deleteService.deleteAppointment(
      id,
      this.appointments,
      this.filteredAppointmentsGrouped,
      () => this.updateListView()
    )
      ;
  }

  deleteEvent(id: number): void {
    this.deleteService.deleteEvent(
      id,
      this.events,
      this.filteredEventsGrouped,
      () => this.updateListView(),
    );
  }

  get filteredPastAppointmentsGrouped() {
    return this.filterService.filteredPastAppointments;
  }

  get filteredPastEventsGrouped() {
    return this.filterService.filteredPastEvents;
  }
  
  get includePast() {
    return this.filterService.includePast;
  }

  get sortedPastDates() {
    return this.filterService.getSortedKeys(this.filteredPastAppointmentsGrouped);
  }
}
