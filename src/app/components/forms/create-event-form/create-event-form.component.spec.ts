import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { ConflictCheckService } from 'src/app/services/conflict-check.service';
import { CreateEventFormComponent } from './create-event-form.component';

describe('CreateEventFormComponent', () => {
  let component: CreateEventFormComponent;
  let fixture: ComponentFixture<CreateEventFormComponent>;
  let eventsServiceSpy: jasmine.SpyObj<EventsApiService>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CreateEventFormComponent>>;

  beforeEach(async () => {
  const spyEvents = jasmine.createSpyObj('EventsApiService', [
    'createEvent',
    'updateEvent',
    'getAllEvents'
  ]);

  spyEvents.getAllEvents.and.returnValue(of([]));

  const mockConflictCheckService = {
    checkForConflicts: jasmine.createSpy().and.resolveTo(false)
  };

  const spyDialog = jasmine.createSpyObj('MatDialogRef', ['close']);

  await TestBed.configureTestingModule({
    imports: [CreateEventFormComponent, ReactiveFormsModule],
    providers: [
      provideHttpClient(withInterceptorsFromDi()),
      provideHttpClientTesting,
      { provide: EventsApiService, useValue: spyEvents },
      { provide: MatDialogRef, useValue: spyDialog },
      { provide: MAT_DIALOG_DATA, useValue: {} },
      { provide: ConflictCheckService, useValue: mockConflictCheckService },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(CreateEventFormComponent);
  component = fixture.componentInstance;

  eventsServiceSpy = TestBed.inject(EventsApiService) as jasmine.SpyObj<EventsApiService>;
  dialogRefSpy = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<CreateEventFormComponent>>;

  fixture.detectChanges();
});


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog on cancel', () => {
    component.onCancel();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should not call create or update when form is invalid', () => {
    component.onSubmit();
    expect(eventsServiceSpy.createEvent).not.toHaveBeenCalled();
    expect(eventsServiceSpy.updateEvent).not.toHaveBeenCalled();
  });

  it('should call createEvent when form is valid and no eventToEdit', fakeAsync(() => {
    component.form.patchValue({
      eventName: 'Test Event',
      eventType: 'Workshop',
      clientName: 'Client',
      startDate: new Date('2025-06-07'),
      endDate: new Date('2025-06-07'),
      startTime: new Date('2025-06-07T10:00:00'),
      endTime: new Date('2025-06-07T12:00:00'),
      streetAddress: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
      description: 'A test description.',
      isVirtual: false
    });

    fixture.detectChanges();

    eventsServiceSpy.createEvent.and.returnValue(of({
      id: 1,
      eventName: 'Test Event',
      eventType: 'Workshop',
      clientName: 'Client',
      startDate: new Date('2025-06-07'),
      endDate: new Date('2025-06-07'),
      startTime: new Date('2025-06-07T10:00:00'),
      endTime: new Date('2025-06-07T12:00:00'),
      streetAddress: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
      description: 'This is a test description.',
      isVirtual: false,
    }));

    component.onSubmit();
    tick();
    expect(eventsServiceSpy.createEvent).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  }));

  it('should call updateEvent when form is valid and editing an event', fakeAsync(() => {
    const mockEvent = { id: 1 } as any;
    component['data'].eventToEdit = mockEvent;

    component.form.patchValue({
      eventName: 'Test Event',
      eventType: 'Workshop',
      clientName: 'Client',
      startDate: new Date('2025-06-07'),
      endDate: new Date('2025-06-07'),
      startTime: new Date('2025-06-07T10:00:00'),
      endTime: new Date('2025-06-07T12:00:00'),
      streetAddress: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
      description: 'A test description.',
      isVirtual: false
    });

    fixture.detectChanges();

    eventsServiceSpy.updateEvent.and.returnValue(of({
      id: 1,
      eventName: 'Test Event',
      eventType: 'Workshop',
      clientName: 'Client',
      startDate: new Date('2025-06-07'),
      endDate: new Date('2025-06-07'),
      startTime: new Date('2025-06-07T10:00:00'),
      endTime: new Date('2025-06-07T12:00:00'),
      streetAddress: '123 Main St',
      city: 'Seattle',
      state: 'WA',
      zipCode: 98101,
      description: 'This is a test description.',
      isVirtual: false,
    }));

    component.onSubmit();
    tick();
    expect(eventsServiceSpy.updateEvent).toHaveBeenCalled();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  }));
});