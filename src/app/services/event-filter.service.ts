// src/app/services/event-filter.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Appointment } from '../interfaces/appointment';
import { Event } from '../interfaces/event';

@Injectable({
  providedIn: 'root'
})
export class EventFilterService {
  // Raw lists
  appointmentsListSubject = new BehaviorSubject<Appointment[]>([]);
  eventsListSubject = new BehaviorSubject<Event[]>([]);

  // Grouped
  groupedAppointmentsSubject = new BehaviorSubject<{ [date: string]: Appointment[] }>({});
  groupedPastAppointmentsSubject = new BehaviorSubject<{ [date: string]: Appointment[] }>({});
  groupedEventsSubject = new BehaviorSubject<{ [date: string]: Event[] }>({});
  groupedPastEventsSubject = new BehaviorSubject<{ [date: string]: Event[] }>({});

  // Filtered
  private filteredAppointmentsSubject = new BehaviorSubject<{ [date: string]: Appointment[] }>({});
  filteredAppointments$ = this.filteredAppointmentsSubject.asObservable();
  private _filteredPastAppointmentsSubject = new BehaviorSubject<{ [date: string]: Appointment[] }>({});
  filteredPastAppointments$ = this._filteredPastAppointmentsSubject.asObservable();
  private filteredEventsSubject = new BehaviorSubject<{ [date: string]: Event[] }>({});
  filteredEvents$ = this.filteredEventsSubject.asObservable();
  private filteredPastEventsSubject = new BehaviorSubject<{ [date: string]: Event[] }>({});
  filteredPastEvents$ = this.filteredPastEventsSubject.asObservable();
  
  // Filter settings
  private includePastSubject = new BehaviorSubject<boolean>(false);
  includePast$ = this.includePastSubject.asObservable();
  daysRange: number = 3;


  // Filters
  private _filters = new BehaviorSubject<FilterCriteria>({});
  public filters$ = this._filters.asObservable();

  private static idCounter = 0;
  private instanceId: number;

  constructor() {
    this.instanceId = EventFilterService.idCounter++;
  }

  // ----------------------
  // Public API
  // ----------------------

  setRange(value: number): void {
    this.daysRange = value;
    
    const now = new Date();
    let start: Date;
    let end: Date = new Date(); // default to now

    switch (this.daysRange) {
      case 3:
        start = new Date(now);
        start.setHours(now.getDate() - 3);
        break;
      case 7:
        start = new Date(now);
        start.setDate(now.getDate() - 7);
        break;
      case 14:
        start = new Date(now);
        start.setDate(now.getDate() - 14);
        break
      case 30:
        start = new Date(now);
        start.setDate(now.getDate() - 30);
        break;
      case 365:
        start = new Date(2000, 0, 1); // Arbitrary far-past date
        break;
      default:
        console.warn('TESTING: Unknown range:', this.daysRange);
        return;
    }

    this.onRangeChange(start, end);
  }

  toggleIncludePast(): void {
    const current = this.includePastSubject.getValue();
    this.includePastSubject.next(!current);
  }

  setIncludePast(value: boolean) {
    if (this.includePastSubject.value !== value) {
      this.includePastSubject.next(value);
    }
  }

  get currentIncludePast(): boolean {
    return this.includePastSubject.value;
  }

  onRangeChange(start: Date, end: Date): void {
    const current = this._filters.getValue();
    this._filters.next({ ...current, dateRange: { start, end } });
    this.applyFilters(); // Optional
  }

  handleIncludePastChange(value: boolean): void {
    this.includePastSubject.next(value);
    this.applyFilters();
  }

  updateAppointments(appointments: Appointment[]) {  
    this.appointmentsListSubject.next(appointments);
  
    const now = new Date();
  
    try {
      const grouped = this.groupItemsByDate(appointments, 'date');

      this.groupedAppointmentsSubject.next(grouped);
      this.filteredAppointmentsSubject.next(grouped); // ✅ ADD THIS LINE
  
      const pastGrouped = this.groupItemsByDate(
        appointments.filter(a => !!a.date && new Date(a.date) < now),
        'date'
      );
  
      this.groupedPastAppointmentsSubject.next(pastGrouped);
    } catch (e) {
      console.error('TESTING: ❌ Error while grouping appointments:', e);
    }

    this.applyFilters();
  }

  updateFilteredPastAppointments(appointments: { [date: string]: Appointment[] }) {
    this._filteredPastAppointmentsSubject.next(appointments);
  }
  
  updateEvents(events: Event[]) {  
    this.eventsListSubject.next(events);
  
    const now = new Date();
  
    try {
      const grouped = this.groupItemsByDate(events, 'startDate');
      this.groupedEventsSubject.next(grouped);
  
      const pastGrouped = this.groupItemsByDate(
        events.filter(e => !!e.startDate && new Date(e.startDate) < now),
        'startDate'
      );

      this.groupedPastEventsSubject.next(pastGrouped);
    
    } catch (e) {
      console.error('TESTING: ❌ Error while grouping events:', e);
    }

    this.applyFilters();
  }

  updateFilteredPastEvents(events: { [date: string]: Event[] }) {
    this.filteredPastEventsSubject.next(events);
  }

  // ----------------------
  // Apply filters to current grouped data
  // ----------------------

  applyFilters(): void {
    this.filterEventsByRange();
    this.filterAppointmentsByRange();

    if (this.includePastSubject.value) {
      this.filterPastEventsByRange();
      this.filterPastAppointmentsByRange(); 
    } else {
      this.filteredPastEventsSubject.next({});
      this._filteredPastAppointmentsSubject.next({}); 
    }
  }

  // ----------------------
  // Specialized Filtering Logic
  // ----------------------

  private filterAppointmentsByRange(): void {
    const now = this.normalizeDate(new Date());
    const end = new Date(now);
    end.setDate(end.getDate() + this.daysRange);
    
    const grouped = this.groupedAppointmentsSubject.value;
  
    const filtered = Object.entries(grouped).reduce(
      (acc, [dateStr, appointments]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const appointmentDate = this.normalizeDate(new Date(year, month - 1, day));
    
        if (appointmentDate >= now && appointmentDate <= end && appointments.length > 0) {
          acc[dateStr] = appointments;
        }
  
        return acc;
      },
      {} as { [date: string]: Appointment[] }
    );
  
    this.filteredAppointmentsSubject.next(filtered);
  }
  
  private filterEventsByRange(): void {
    const now = this.normalizeDate(new Date());
    const end = new Date(now);
    end.setDate(end.getDate() + this.daysRange);
    
    const grouped = this.groupedEventsSubject.value;
  
    const filtered = Object.entries(grouped).reduce(
      (acc, [dateStr, events]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const eventDate = this.normalizeDate(new Date(year, month - 1, day));
    
        if (eventDate >= now && eventDate <= end && events.length > 0) {
          acc[dateStr] = events;
        }
  
        return acc;
      },
      {} as { [date: string]: Event[] }
    );
  
    this.filteredEventsSubject.next(filtered);
  }

  private filterPastAppointmentsByRange(): void {
    const filters = this._filters.getValue();
    const groupedPast = this.groupedPastAppointmentsSubject.value;

    const filteredPast = Object.entries(groupedPast).reduce(
      (acc, [dateStr, appointments]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const appointmentDate = this.normalizeDate(new Date(year, month - 1, day));

        if (
          filters.dateRange &&
          appointmentDate >= this.normalizeDate(filters.dateRange.start) &&
          appointmentDate <= this.normalizeDate(filters.dateRange.end)
        ) {
          acc[dateStr] = appointments;
        }

        return acc;
      },
      {} as { [date: string]: Appointment[] }
    );

    this._filteredPastAppointmentsSubject.next(filteredPast);
  }


  private filterPastEventsByRange(): void {
    const filters = this._filters.getValue();
    const groupedPast = this.groupedPastEventsSubject.value;

    const filteredPast = Object.entries(groupedPast).reduce(
      (acc, [dateStr, events]) => {
        const [year, month, day] = dateStr.split('-').map(Number);
        const eventDate = this.normalizeDate(new Date(year, month - 1, day));

        if (
          filters.dateRange &&
          eventDate >= this.normalizeDate(filters.dateRange.start) &&
          eventDate <= this.normalizeDate(filters.dateRange.end)
        ) {
          acc[dateStr] = events;
        }

        return acc;
      },
      {} as { [date: string]: Event[] }
    );

    this.filteredPastEventsSubject.next(filteredPast);
  }


  // ----------------------
  // Utilities
  // ----------------------

  public groupItemsByDate<T>(items: T[], dateKey: keyof T): { [date: string]: T[] } {
    return items.reduce((grouped, item) => {
      const rawDate = item[dateKey];
      if (!rawDate) return grouped;

      const parsed = new Date(rawDate as any);
      if (isNaN(parsed.getTime())) return grouped;

      const normalized = this.normalizeDate(parsed);

      const date = normalized.getFullYear() + '-' +
        String(normalized.getMonth() + 1).padStart(2, '0') + '-' +
        String(normalized.getDate()).padStart(2, '0');

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(item);

      return grouped;
    }, {} as { [date: string]: T[] });
  }
  
  getSortedKeys(obj: { [key: string]: any }): string[] {
    return Object.keys(obj).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  getUnifiedSortedKeys(groupedAppointments: Record<string, any[]>, groupedEvents: Record<string, any[]>): string[] {
    const appointmentDates = Object.keys(groupedAppointments || {});
    const eventDates = Object.keys(groupedEvents || {});
    const allDates = new Set([...appointmentDates, ...eventDates]);
    return Array.from(allDates).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }

  getUnifiedSortedPastKeys(
    appointmentsGrouped: { [date: string]: any[] },
    eventsGrouped: { [date: string]: any[] }
  ): string[] {
    const keys = new Set<string>();
  
    // Collect all unique date keys from both groups
    Object.keys(appointmentsGrouped).forEach(key => keys.add(key));
    Object.keys(eventsGrouped).forEach(key => keys.add(key));
  
    // Convert Set to Array and sort descending by date
    return Array.from(keys).sort((a, b) => {
      const dateA = new Date(a);
      const dateB = new Date(b);
  
      // If either date is invalid, keep original order (or push invalid last)
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
  
      return dateB.getTime() - dateA.getTime(); // descending order (newest past dates first)
    });
  }
  
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }
}

export interface FilterCriteria {
  dateRange?: { start: Date; end: Date };
}