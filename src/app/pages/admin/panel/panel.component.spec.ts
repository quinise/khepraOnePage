import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { EventsService } from 'src/app/services/events.service';
import { PanelComponent } from './panel.component';
import { AuthWrapperService, GET_AUTH_TOKEN } from 'src/app/services/authentication/auth-wrapper.service';

describe('PanelComponent', () => {
  let component: PanelComponent;
  let fixture: ComponentFixture<PanelComponent>;

  const mockAdminUser = {
    uid: 'admin-123',
    role: 'admin',
    email: 'admin@example.com'
  };

  const mockUser = {
    uid: 'user-456',
    role: 'user',
    email: 'user@example.com'
  };

  const mockAppointments: Appointment[] = [
    {
      id: 1,
      userId: 'user123',
      type: 'READING',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '555-555-5555',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      isVirtual: false,
      streetAddress: '123 Main St',
      city: 'Bremerton, WA',
      state: 'WA',
      zipCode: 98312,
      createdByAdmin: false,
    },
  ];

  const mockEvents: Event[] = [
    {
      id: 2,
      eventName: 'Test Event',
      eventType: 'WORKSHOP',
      startDate: new Date(),
      endDate: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      isVirtual: false,
      description: 'This is a test event',
      streetAddress: '456 Elm St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
    },
  ];

  let eventsServiceStub: any;

  function setupTestBed(authUser: any, fetchAppointmentsEventsResponse: any) {
    const appointmentApiServiceStub = {
      getAppointments: jasmine.createSpy().and.returnValue(of(mockAppointments)),
    };

    const eventsApiServiceStub = {
      getAllEvents: jasmine.createSpy().and.returnValue(of(mockEvents)),
    };

    eventsServiceStub = {
      fetchAppointmentsAndEvents: jasmine.createSpy().and.returnValue(fetchAppointmentsEventsResponse),
    };

    const authServiceStub = {
      user$: of(authUser),
    };

    const authWrapperServiceStub = {
      getCurrentUser: () => authUser
    };

    const eventStoreServiceStub = {
      setEvents: jasmine.createSpy('setEvents'),
    };

    TestBed.configureTestingModule({
      imports: [PanelComponent],
      providers: [
        provideHttpClient(),
        { provide: AppointmentApiService, useValue: appointmentApiServiceStub },
        { provide: EventsApiService, useValue: eventsApiServiceStub },
        { provide: EventsService, useValue: eventsServiceStub },
        { provide: AuthService, useValue: authServiceStub },
        { provide: AuthWrapperService, useValue: authWrapperServiceStub },
        { provide: GET_AUTH_TOKEN, useValue: () => ({}) },
        { provide: EventStoreService, useValue: eventStoreServiceStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', () => {
    setupTestBed(mockAdminUser, of([mockAppointments, mockEvents]));
    expect(component).toBeTruthy();
  });

  it('should toggle the calendar view', () => {
    setupTestBed(mockAdminUser, of([mockAppointments, mockEvents]));
    expect(component.showCalendar).toBeTrue();
    component.toggleView();
    expect(component.showCalendar).toBeFalse();
    component.toggleView();
    expect(component.showCalendar).toBeTrue();
  });

  it('should set isAdmin to true for admin user', () => {
    setupTestBed(mockAdminUser, of([mockAppointments, mockEvents]));
    expect(component.isAdmin).toBeTrue();
  });

  it('should set isAdmin to false for non-admin user', () => {
    setupTestBed(mockUser, of([mockAppointments, mockEvents]));
    expect(component.isAdmin).toBeFalse();
  });

  it('should call fetchAppointmentsAndEvents with correct admin status', () => {
    setupTestBed(mockAdminUser, of([mockAppointments, mockEvents]));
    expect(eventsServiceStub.fetchAppointmentsAndEvents).toHaveBeenCalledWith(true, mockAdminUser.uid, null);
    expect(component.appointments).toEqual(mockAppointments);
    expect(component.events).toEqual(mockEvents);
  });

  it('should call fetchAppointmentsAndEvents with false for non-admin', () => {
    setupTestBed(mockUser, of([mockAppointments, mockEvents]));
    expect(eventsServiceStub.fetchAppointmentsAndEvents).toHaveBeenCalledWith(false, mockUser.uid, null);
    expect(component.appointments).toEqual(mockAppointments);
    expect(component.events).toEqual(mockEvents);
  });

  it('should handle error when fetchAppointmentsAndEvents fails', () => {
    setupTestBed(mockAdminUser, throwError(() => new Error('fetchAppointmentsAndEvents failed')));
    expect(eventsServiceStub.fetchAppointmentsAndEvents).toHaveBeenCalledWith(true, mockAdminUser.uid, null);
    expect(component.appointments).toEqual([]);
    expect(component.events).toEqual([]);
  });
});
