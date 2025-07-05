import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { EventClickArg } from '@fullcalendar/core';
import { of } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { Event } from 'src/app/interfaces/event';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { EventsService } from 'src/app/services/events.service';
import { CalendarViewComponent } from './calendar-view.component';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';

describe('CalendarViewComponent – loadData and updateCalendar', () => {
  let component: CalendarViewComponent;
  let fixture: ComponentFixture<CalendarViewComponent>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let mockAppointmentApiService: jasmine.SpyObj<AppointmentApiService>;
  let mockEventsApiService: jasmine.SpyObj<EventsApiService>;

  const mockAppointments: Appointment[] = [{
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '1234567890',
    date: new Date(),
    startTime: new Date(),
    endTime: new Date(),
    type: 'READING',
    isVirtual: true,
    streetAddress: '',
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101,
    userId: '1',
    createdByAdmin: true
  }];

  const mockEvents: Event[] = [{
    id: 1,
    eventName: 'Test Event',
    eventType: 'LECTURE',
    description: 'Test Description',
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    isVirtual: false,
    streetAddress: '',
    city: 'Seattle',
    state: 'WA',
    zipCode: 98101
  }];

  const mockAdminUser = { role: 'admin', uid: 'admin-123' };
  const mockRegularUser = { role: 'user', uid: 'user-456' };

  const mockAuthService = {
    user$: of(mockAdminUser)
  };

  const mockAuthWrapperService = {
    getCurrentUser: () => mockAdminUser
  };

  const mockEventsService = {
    fetchAppointmentsAndEvents: jasmine.createSpy().and.returnValue(of([mockAppointments, mockEvents])),
    transformAppointmentsForFullCalendar: jasmine.createSpy().and.returnValue([]),
    transformEventsForFullCalendar: jasmine.createSpy().and.returnValue([])
  };

  const mockFilterService = {
    updateAppointments: jasmine.createSpy(),
    updateEvents: jasmine.createSpy(),
    setRange: jasmine.createSpy(),
    filteredAppointments$: of({}),
    filteredPastAppointments$: of({}),
    filteredEvents$: of({}),
    filteredPastEvents$: of({}),
    includePast$: of(false),
    groupItemsByDate: jasmine.createSpy().and.callFake((items: any[]) => {
      if (!items.length) return {};
      return { [new Date(items[0].date || items[0].startDate).toDateString()]: items };
    }),
    daysRange: 30
  };

  const mockDeleteService = {
    deleteEvent: jasmine.createSpy('deleteEvent').and.callFake((_id, _list, onSuccess, onComplete) => {
      onSuccess();
      onComplete();
    }),
    deleteAppointment: jasmine.createSpy('deleteAppointment').and.callFake((_id, _list, onSuccess, onComplete) => {
      onSuccess();
      onComplete();
    })
  };

  beforeEach(async () => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    mockAppointmentApiService = jasmine.createSpyObj('AppointmentApiService', ['getAllAppointments']);
    mockEventsApiService = jasmine.createSpyObj('EventsApiService', ['getAllEvents']);

    await TestBed.configureTestingModule({
      imports: [CalendarViewComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AuthWrapperService, useValue: mockAuthWrapperService },
        { provide: EventsService, useValue: mockEventsService },
        { provide: EventFilterService, useValue: mockFilterService },
        { provide: DeleteEventService, useValue: mockDeleteService },
        { provide: AppointmentApiService, useValue: mockAppointmentApiService },
        { provide: EventsApiService, useValue: mockEventsApiService },
        { provide: EventStoreService, useValue: {} },
        { provide: MatDialog, useValue: matDialogSpy },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CalendarViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call fetchAppointmentsAndEvents, updateAppointments, updateEvents, and setRange in loadData()', () => {
    component.loadData();

    expect(mockEventsService.fetchAppointmentsAndEvents).toHaveBeenCalled();
    expect(mockFilterService.updateAppointments).toHaveBeenCalledWith(mockAppointments);
    expect(mockFilterService.updateEvents).toHaveBeenCalledWith(mockEvents);
    expect(mockFilterService.setRange).toHaveBeenCalledWith(mockFilterService.daysRange);
  });

  it('should call transform methods and update calendarOptions.events in updateCalendar()', () => {
    component.filteredAppointmentsGrouped = { '2024-01-01': mockAppointments };
    component.filteredEventsGrouped = { '2024-01-01': mockEvents };
    component.pastAppointmentsGrouped = { '2024-01-01': mockAppointments };
    component.pastEventsGrouped = { '2024-01-01': mockEvents };
    component.includePast = true;

    component.updateCalendar();

    expect(mockEventsService.transformAppointmentsForFullCalendar).toHaveBeenCalledWith(jasmine.any(Array));
    expect(mockEventsService.transformEventsForFullCalendar).toHaveBeenCalledWith(jasmine.any(Array));
    expect(Array.isArray(component.calendarOptions.events)).toBeTrue();
  });

  it('should return true for a valid event object in isValidEvent()', () => {
    const validEvent = { id: 1, title: 'Test', startDate: new Date() };
    expect(component.isValidEvent(validEvent)).toBeTrue();
  });

  it('should return false for an invalid event object in isValidEvent()', () => {
    const invalidEvent = { name: 'Invalid' };
    expect(component.isValidEvent(invalidEvent)).toBeFalse();
  });

  it('should open edit dialog for valid event in handleEventClick()', () => {
    component['isAdmin'] = true;

    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 60);

    const mockEventData = { id: 1, title: 'Test', startDate: futureDate };

    const mockClickInfo: EventClickArg = {
      event: {
        id: '1',
        title: 'Test Event',
        start: futureDate,
        extendedProps: {
          event: mockEventData
        }
      }
    } as any;

    spyOn(component, 'isFuture').and.returnValue(true);
    spyOn(component, 'isValidEvent').and.returnValue(true);
    spyOn(component, 'openEditEventDialog');

    component.handleEventClick(mockClickInfo);

    expect(component.selectedEvent).toEqual(mockClickInfo.event);
    expect(component.showPanel).toBeTrue();
    expect(component.openEditEventDialog).toHaveBeenCalledWith(mockClickInfo.event.extendedProps['event']);
  });

  it('should close the event details panel in closeEventDetails()', () => {
    component.showPanel = true;
    component.selectedEvent = {} as any;

    component.closeEventDetails();

    expect(component.showPanel).toBeFalse();
    expect(component.selectedEvent).toBeNull();
  });

  it('should return true if date is in the future', () => {
    const futureDate = new Date(Date.now() + 1000000);
    expect(component.isFuture(futureDate)).toBeTrue();
  });

  it('should return false if date is in the past', () => {
    const pastDate = new Date(Date.now() - 1000000);
    expect(component.isFuture(pastDate)).toBeFalse();
  });

  it('should return false if input is undefined or null', () => {
    expect(component.isFuture(undefined)).toBeFalse();
    expect(component.isFuture(null)).toBeFalse();
  });

  it('should delete an event and update calendar', () => {
    const mockId = 1;
    const mockEvent = {
      id: mockId,
      extendedProps: {
        event: {}
      }
    };

    (component as any).filteredEventsGrouped = { '2024-01-01': [{ id: mockId.toString(), startDate: new Date() } as any] };
    (component as any).pastEventsGrouped = { '2023-01-01': [{ id: 99, startDate: new Date() } as any] };

    component.selectedEvent = mockEvent as any;

    const updateSpy = spyOn(component, 'updateCalendar');
    const closeSpy = spyOn(component, 'closeEventDetails');

    component.deleteEvent();

    expect(mockDeleteService.deleteEvent).toHaveBeenCalledWith(
      mockId,
      jasmine.any(Array),
      jasmine.any(Function),
      jasmine.any(Function)
    );
    expect(updateSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should delete an appointment and update calendar', () => {
    const mockId = 123;
    const mockAppointment = {
      id: mockId,
      extendedProps: {
        appointment: {}
      }
    };

    (component as any).filteredAppointmentsGrouped = {
      '2024-01-01': [{ id: mockId, date: new Date() } as any]
    };
    (component as any).pastAppointmentsGrouped = {
      '2023-01-01': [{ id: 456, date: new Date() } as any]
    };

    component.selectedEvent = mockAppointment as any;

    const updateSpy = spyOn(component, 'updateCalendar');
    const closeSpy = spyOn(component, 'closeEventDetails');

    component.deleteAppointment();

    expect(mockDeleteService.deleteAppointment).toHaveBeenCalledWith(
      mockId,
      jasmine.any(Array),
      jasmine.any(Function),
      jasmine.any(Function)
    );
    expect(updateSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should strip time from date and return date at midnight', () => {
    const date = new Date('2025-06-15T15:45:00');
    const stripped = component.stripTime(date);
    expect(stripped.getHours()).toBe(0);
    expect(stripped.getMinutes()).toBe(0);
    expect(stripped.getSeconds()).toBe(0);
  });

  it('should open dialog and listen for eventSaved when openEditEventDialog is called', () => {
    const mockEvent = { id: 1, title: 'Test', startDate: new Date() };

    const eventSavedSpy = jasmine.createSpyObj('eventSaved', ['subscribe']);
    const dialogRefSpy = {
      componentInstance: { eventSaved: eventSavedSpy }
    };

    const dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    dialog.open.and.returnValue(dialogRefSpy as any);

    component.openEditEventDialog(mockEvent as any);

    expect(dialog.open).toHaveBeenCalled();
    expect(eventSavedSpy.subscribe).toHaveBeenCalled();
  });

  it('should return true if user is admin and appointment was created by admin', () => {
    component['isAdmin'] = true;

    const futureDate = new Date();
    futureDate.setMinutes(futureDate.getMinutes() + 30); // 30 minutes in the future

    const appointment = {
      createdByAdmin: true,
      startTime: futureDate
    } as any;

    expect(component.canEditAppointment(appointment)).toBeTrue();
  });


  it('should return false if appointment is in the past', () => {
    component['isAdmin'] = true;

    const pastDate = new Date();
    pastDate.setMinutes(pastDate.getMinutes() - 30); // 30 minutes ago

    const appointment = {
      createdByAdmin: true,
      startTime: pastDate
    } as any;

    expect(component.canEditAppointment(appointment)).toBeFalse();
  });

  it('should return false if user is not admin', () => {
    component['isAdmin'] = false;
    const appointment = { createdByAdmin: true } as any;
    expect(component.canEditAppointment(appointment)).toBeFalse();
  });

  it('should return false if appointment was not created by admin', () => {
    component['isAdmin'] = true;
    const appointment = { createdByAdmin: false } as any;
    expect(component.canEditAppointment(appointment)).toBeFalse();
  });

  it('should open appointment dialog and refresh appointments on close', () => {
    const mockAppointment = {
      id: 1,
      type: 'READING'
    } as any;

    const afterClosedSpy = jasmine.createSpyObj('afterClosed$', ['subscribe']);
    const dialogRefSpy = { afterClosed: () => afterClosedSpy };

    matDialogSpy.open.and.returnValue(dialogRefSpy as any);

    const updatedAppointments = [mockAppointment];
    mockAppointmentApiService.getAllAppointments.and.returnValue(of(updatedAppointments));

    afterClosedSpy.subscribe.and.callFake((fn: any) => fn(mockAppointment));

    component.editAppointment(mockAppointment);

    expect(mockFilterService.updateAppointments).toHaveBeenCalledWith(updatedAppointments);
  });

  it('should open event dialog and refresh events on close', () => {
    const mockEvent = { id: 1 } as any;

    const afterClosedSpy = jasmine.createSpyObj('afterClosed$', ['subscribe']);
    const dialogRefSpy = { afterClosed: () => afterClosedSpy };

    matDialogSpy.open.and.returnValue(dialogRefSpy as any);

    const updatedEvents = [mockEvent];
    mockEventsApiService.getAllEvents.and.returnValue(of(updatedEvents));

    afterClosedSpy.subscribe.and.callFake((fn: any) => fn(mockEvent));

    component.editEvent(mockEvent);

    expect(mockFilterService.updateEvents).toHaveBeenCalledWith(updatedEvents);
  });
});