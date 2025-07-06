import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { EventsService } from './events.service';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { EventsApiService } from './apis/events-api.service';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';

const mockAdminUser = {
  uid: 'admin-123',
  email: 'admin@example.com',
  displayName: 'Admin User',
  role: 'admin'
};

const mockNonAdminUser = {
  uid: 'user-456',
  email: 'user@example.com',
  displayName: 'Regular User',
  role: 'user'
};

function createMockAuthWrapper(user: any): Partial<AuthWrapperService> {
  return {
    getCurrentUser: () => user
  };
}

const mockAppointments: Appointment[] = [
  {
    id: 1,
    userId: 'user123',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '555-555-5555',
    type: 'READING',
    date: new Date('2025-07-01'),
    startTime: new Date('2025-07-01T10:00:00'),
    endTime: new Date('2025-07-01T10:30:00'),
    isVirtual: true,
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101,
    streetAddress: '123 Main St',
    createdByAdmin: true
  }
];

const mockEvents: Event[] = [
  {
    id: 1,
    eventName: 'Workshop 1',
    eventType: 'WORKSHOP',
    description: 'A test workshop event',
    startDate: new Date('2025-07-10'),
    startTime: new Date('2025-07-10T09:00:00'),
    endDate: new Date('2025-07-10'),
    endTime: new Date('2025-07-10T11:00:00'),
    isVirtual: false,
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101,
    streetAddress: '456 Event Blvd'
  }
];

describe('EventsService', () => {
  let service: EventsService;

  describe('as admin user', () => {
    let mockAppointmentApiService: jasmine.SpyObj<AppointmentApiService>;
    let mockEventsApiService: jasmine.SpyObj<EventsApiService>;

    beforeEach(() => {
      mockAppointmentApiService = jasmine.createSpyObj('AppointmentApiService', ['getAppointmentsByUserId']);
      mockEventsApiService = jasmine.createSpyObj('EventsApiService', ['getAllEvents']);

      mockAppointmentApiService.getAppointmentsByUserId.and.returnValue(of(mockAppointments));
      mockEventsApiService.getAllEvents.and.returnValue(of(mockEvents));

      TestBed.configureTestingModule({
        providers: [
          EventsService,
          { provide: AppointmentApiService, useValue: mockAppointmentApiService },
          { provide: EventsApiService, useValue: mockEventsApiService },
          { provide: AuthWrapperService, useValue: createMockAuthWrapper(mockAdminUser) }
        ]
      });

      service = TestBed.inject(EventsService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should fetch appointments and events for admin', (done) => {
      service.fetchAppointmentsAndEvents(true, mockAdminUser.uid, null).subscribe(([appointments, events]) => {
        expect(appointments.length).toBe(1);
        expect(events.length).toBe(1);
        expect(mockAppointmentApiService.getAppointmentsByUserId).toHaveBeenCalledWith(mockAdminUser.uid, null);
        expect(mockEventsApiService.getAllEvents).toHaveBeenCalled();
        done();
      });
    });

    it('should transform appointments for FullCalendar', () => {
      const result = service.transformAppointmentsForFullCalendar(mockAppointments);
      expect(result.length).toBe(1);
      expect(result[0].title).toContain('Test User - READING');
      expect(result[0].extendedProps.appointmentCity).toBe('Seattle');
    });

    it('should transform events for FullCalendar', () => {
      const result = service.transformEventsForFullCalendar(mockEvents);
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Workshop 1');
      expect(result[0].extendedProps.eventCity).toBe('Seattle');
    });
  });

  describe('as non-admin user', () => {
    let mockAppointmentApiService: jasmine.SpyObj<AppointmentApiService>;
    let mockEventsApiService: jasmine.SpyObj<EventsApiService>;

    beforeEach(() => {
      mockAppointmentApiService = jasmine.createSpyObj('AppointmentApiService', ['getAppointmentsByUserId']);
      mockEventsApiService = jasmine.createSpyObj('EventsApiService', ['getAllEvents']);

      mockAppointmentApiService.getAppointmentsByUserId.and.returnValue(of(mockAppointments));
      mockEventsApiService.getAllEvents.and.returnValue(of(mockEvents));

      TestBed.configureTestingModule({
        providers: [
          EventsService,
          { provide: AppointmentApiService, useValue: mockAppointmentApiService },
          { provide: EventsApiService, useValue: mockEventsApiService },
          { provide: AuthWrapperService, useValue: createMockAuthWrapper(mockNonAdminUser) }
        ]
      });

      service = TestBed.inject(EventsService);
    });

    it('should fetch only events for non-admin', (done) => {
      service.fetchAppointmentsAndEvents(false, mockNonAdminUser.uid, null).subscribe(([appointments, events]) => {
        expect(appointments.length).toBe(0);
        expect(events.length).toBe(1);
        expect(mockAppointmentApiService.getAppointmentsByUserId).not.toHaveBeenCalled();
        expect(mockEventsApiService.getAllEvents).toHaveBeenCalled();
        done();
      });
    });
  });
});