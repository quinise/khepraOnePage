// src/app/services/event-filter.service.ts
import { Injectable } from '@angular/core';
import { MatSelectChange } from "@angular/material/select";
import { Appointment } from '../interfaces/appointment';
import { Event } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class EventFilterService {
  appointmentsList: Appointment[] = [];
  pastAppointments: Appointment[] = [];
  groupedAppointments: { [date: string]: Appointment[] } = {};
  groupedPastAppointments: { [date: string]: Appointment[] } = {};
  filteredAppointments: { [date: string]: Appointment[] } = {};
  filteredPastAppointments: { [date: string]: Appointment[] } = {};

  eventsList: Event[] = [];
  pastEvents: Event[] = [];
  groupedEvents: { [date: string]: Event[] } = {};
  groupedPastEvents: { [date: string]: Event[] } = {};
  filteredEvents: { [date: string]: Event[] } = {};
  filteredPastEvents: { [date: string]: Event[] } = {};

  includePast: boolean = false;
  daysRange: number = 3;

  handleIncludePastChange(value: boolean): void {
    this.includePast = value;
    this.filteredAppointments = this.filterItemsByRange(this.groupedAppointments, this.daysRange, false);
    this.filteredPastAppointments = this.filterItemsByRange(this.groupedPastAppointments, this.daysRange, true);
    
    this.filteredEvents = this.filterItemsByRange(this.groupedEvents, this.daysRange, false);
    this.filteredPastEvents = this.filterItemsByRange(this.groupedPastEvents, this.daysRange, true);
  }

  groupItemsByDate<T>(items: T[], dateKey: keyof T): { [date: string]: T[] } {
    return items.reduce((grouped, item) => {
      const rawDate = item[dateKey];
      if (!rawDate) return grouped;

      const date = new Date(rawDate as any).toISOString().split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);
      return grouped;
    }, {} as { [date: string]: T[] });
  }

  filterItemsByRange<T>(
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

  // Other preserved methods
  applyFilters(): void {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    if (this.daysRange === -1) {
      startDate = this.includePast ? new Date(0) : now;
      endDate = new Date(8640000000000000);
    } else {
      startDate = new Date(now);
      endDate = new Date(now);
      if (this.includePast) {
        startDate.setDate(now.getDate() - this.daysRange);
        endDate.setDate(now.getDate() + this.daysRange);
      } else {
        endDate.setDate(now.getDate() + this.daysRange);
      }
    }
  }

  setRange(value: number): void {
    this.daysRange = value;  // Modify the global daysRange directly (if possible)
    
    this.filteredAppointments = this.filterItemsByRange(this.groupedAppointments, this.daysRange, false);
    this.filteredPastAppointments = this.filterItemsByRange(this.groupedPastAppointments, this.daysRange, true);
    
    this.filteredEvents = this.filterItemsByRange(this.groupedEvents, this.daysRange, false);
    this.filteredPastEvents = this.filterItemsByRange(this.groupedPastEvents, this.daysRange, true);
  }

  onRangeChange(event: MatSelectChange): void {
    this.setRange(event.value);
  }

  getSortedKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }
}
