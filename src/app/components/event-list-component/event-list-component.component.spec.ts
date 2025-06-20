import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
import { EventFilterService } from 'src/app/services/event-filter.service';
import { EventStoreService } from 'src/app/services/event-store.service';
import { createMockAppointment } from 'src/app/testing/mocks';
import { EventListComponent } from './event-list-component.component';

describe('EventListComponent', () => {
  let component: EventListComponent;
  let fixture: ComponentFixture<EventListComponent>;

  const mockAuthService = {
    user$: of({ role: 'admin', email: 'admin@example.com' })
  };

  const mockFilterService = {
    filteredAppointments$: of({}),
    filteredPastAppointments$: of({}),
    filteredEvents$: of({}),
    filteredPastEvents$: of({}),
    includePast$: of(false),
    updateAppointments: jasmine.createSpy(),
    updateEvents: jasmine.createSpy(),
    getUnifiedSortedPastKeys: jasmine.createSpy().and.returnValue([]),
    getSortedKeys: jasmine.createSpy().and.returnValue([]),
    getUnifiedSortedKeys: jasmine.createSpy().and.returnValue([]),
    groupItemsByDate: jasmine.createSpy().and.returnValue({})
  };

  const mockDeleteService = {
    deleteAppointment: jasmine.createSpy(),
    deleteEvent: jasmine.createSpy()
  };

  const mockAppointmentApiService = {
    getAllAppointments: jasmine.createSpy().and.returnValue(of([]))
  };

  const mockEventsApiService = {
    getAllEvents: jasmine.createSpy().and.returnValue(of([]))
  };

  const mockEventStoreService = {
    upsertEvent: jasmine.createSpy()
  };

  const matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventListComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: EventFilterService, useValue: mockFilterService },
        { provide: DeleteEventService, useValue: mockDeleteService },
        { provide: AppointmentApiService, useValue: mockAppointmentApiService },
        { provide: EventsApiService, useValue: mockEventsApiService },
        { provide: EventStoreService, useValue: mockEventStoreService },
        { provide: MatDialog, useValue: matDialogSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EventListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call updateAppointments when appointments input is set', () => {
    const mockAppointments: Appointment[] = [{
      id: 1,
      userId: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      phoneNumber: '555-555-5555',
      type: 'READING',
      date: new Date(),
      startTime: new Date(),
      endTime: new Date(),
      isVirtual: true,
      streetAddress: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
      createdByAdmin: true
    }];

    component.appointments = mockAppointments;
    expect(mockFilterService.updateAppointments).toHaveBeenCalledWith(mockAppointments);
  });

  it('should call updateEvents when events input is set', () => {
    const mockEvents = [{ id: 1, startDate: new Date() }] as any;
    component.events = mockEvents;
    expect(mockFilterService.updateEvents).toHaveBeenCalledWith(mockEvents);
  });

  it('should call deleteAppointment and updateListView', () => {
    const updateSpy = spyOn(component as any, 'updateListView');

    const mockDeleteFn = mockDeleteService.deleteAppointment as jasmine.Spy;
      mockDeleteFn.and.callFake((_id: any, _list: any, onSuccess: Function, _onComplete: Function) => {
      onSuccess();
    });

    component['appointments'] = [{ id: 1 }] as any;
    component.deleteAppointment(1);

    expect(mockDeleteService.deleteAppointment).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });

  it('should call deleteEvent and updateListView', () => {
    const updateSpy = spyOn(component as any, 'updateListView');

    const mockDeleteFn = mockDeleteService.deleteEvent as jasmine.Spy;
      mockDeleteFn.and.callFake((_id: any, _list: any, onSuccess: Function, _onComplete: Function) => {
      onSuccess();
    });

    component['events'] = [{ id: 1 }] as any;
    component.deleteEvent(1);

    expect(mockDeleteService.deleteEvent).toHaveBeenCalled();
    expect(updateSpy).toHaveBeenCalled();
  });


  it('should return true for hasFutureAppointments if appointments exist', () => {
    component['filteredAppointmentsGrouped'] = {
      '2024-01-01': [createMockAppointment({ date: new Date('2024-01-01') })]
    };
    expect(component.hasFutureAppointments).toBeTrue();
  });

  it('should unsubscribe from subscriptions on destroy', () => {
    const mockSub = { unsubscribe: jasmine.createSpy() };
    component['subscriptions'] = [mockSub as any];
    component['includePastSub'] = mockSub as any;
    component.ngOnDestroy();
    expect(mockSub.unsubscribe).toHaveBeenCalledTimes(2);
  });
});