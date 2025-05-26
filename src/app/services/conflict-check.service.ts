import { Injectable } from '@angular/core';
import { EventsApiService } from './apis/events-api.service';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { take, firstValueFrom } from 'rxjs';

interface ConflictItem {
  start: Date;
  type: string;
  isVirtual: boolean;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConflictCheckService {
  // Duration lookup in minutes
  private readonly durations: Record<string, number> = {
    // Appointments
    READING: 30,
    CLEANSING: 45,
    INITIATION: 60,
    WORKSHOP: 90,
    // Events
    BEMBE: 120,
    LECTURE: 90,
    EGUNGUN: 60,
    TRAINING: 120
  };

  constructor(private appointmentApi: AppointmentApiService, private eventApi: EventsApiService) {}

  async checkForConflicts(startTime: Date, type: string, isVirtual: boolean, location?: string): Promise<boolean> {
    const [appointments, events] = await Promise.all([
      firstValueFrom(this.appointmentApi.getAllAppointments().pipe(take(1))),
      firstValueFrom(this.eventApi.getAllEvents().pipe(take(1)))
    ]);

    const allItems: ConflictItem[] = [
      ...(appointments ?? []).map(appt => ({
        start: new Date(appt.date),
        type: appt.type,
        isVirtual: appt.isVirtual,
        location: appt.city ?? undefined
      })),
      ...(events ?? []).map(evt => ({
        start: new Date(evt.startDate),
        type: evt.eventType,
        isVirtual: evt.isVirtual,
        location: evt.city ?? undefined
      }))
    ];

    const duration = this.durations[type] || 0;
    const buffer = this.getBufferMinutes(isVirtual, location);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    return allItems.some(item => {
      const otherDuration = this.durations[item.type] || 0;
      const otherBuffer = this.getBufferMinutes(item.isVirtual, item.location);
      const otherStart = new Date(item.start.getTime() - otherBuffer * 60 * 1000);
      const otherEnd = new Date(item.start.getTime() + otherDuration * 60 * 1000 + otherBuffer * 60 * 1000);

      return startTime < otherEnd && endTime > otherStart;
    });
  }

  private getBufferMinutes(isVirtual: boolean, location?: string): number {
    if (isVirtual) return 15;
    if (location?.toLowerCase().includes('bremerton')) return 150; // 2.5 hrs
    if (location?.toLowerCase().includes('seattle')) return 45;
    return 0;
  }
}
