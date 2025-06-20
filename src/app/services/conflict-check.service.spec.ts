import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ConflictCheckService } from './conflict-check.service';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { EventsApiService } from './apis/events-api.service';

describe('ConflictCheckService', () => {
  let service: ConflictCheckService;

  const mockAppointments = [
    {
      date: new Date('2025-06-16T10:00:00Z'),
      type: 'READING',
      isVirtual: true,
      city: null
    }
  ];

  const mockEvents = [
    {
      startDate: new Date('2025-06-16T12:00:00Z'),
      eventType: 'WORKSHOP',
      isVirtual: false,
      city: 'Seattle'
    }
  ];

  const mockAppointmentApi = {
    getAllAppointments: jasmine.createSpy().and.returnValue(of(mockAppointments))
  };

  const mockEventApi = {
    getAllEvents: jasmine.createSpy().and.returnValue(of(mockEvents))
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ConflictCheckService,
        { provide: AppointmentApiService, useValue: mockAppointmentApi },
        { provide: EventsApiService, useValue: mockEventApi }
      ]
    });
    service = TestBed.inject(ConflictCheckService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return true for a conflicting virtual appointment (within 15 min buffer)', async () => {
    const conflict = await service.checkForConflicts(
      new Date('2025-06-16T10:10:00Z'),
      'READING',
      true
    );
    expect(conflict).toBeTrue();
  });

  it('should return true for an in-person event conflict in Seattle (within 45 min buffer)', async () => {
    const conflict = await service.checkForConflicts(
      new Date('2025-06-16T11:20:00Z'),
      'READING',
      false,
      'Seattle'
    );
    expect(conflict).toBeTrue();
  });

  it('should return false when there is no conflict', async () => {
    const conflict = await service.checkForConflicts(
      new Date('2025-06-16T15:00:00Z'),
      'READING',
      true
    );
    expect(conflict).toBeFalse();
  });
});