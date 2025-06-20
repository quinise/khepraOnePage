import { TestBed } from '@angular/core/testing';
import { DeleteEventService } from './delete-event.service';
import { of, throwError } from 'rxjs';
import { AppointmentApiService } from './apis/appointmentApi.service';
import { EventsApiService } from './apis/events-api.service';
import { EventStoreService } from './event-store.service';

describe('DeleteEventService', () => {
  let service: DeleteEventService;
  let appointmentApiServiceSpy: jasmine.SpyObj<AppointmentApiService>;
  let eventsApiServiceSpy: jasmine.SpyObj<EventsApiService>;
  let eventStoreSpy: jasmine.SpyObj<EventStoreService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DeleteEventService,
        {
          provide: AppointmentApiService,
          useValue: jasmine.createSpyObj('AppointmentApiService', ['deleteAppointment']),
        },
        {
          provide: EventsApiService,
          useValue: jasmine.createSpyObj('EventsApiService', ['deleteEvent']),
        },
        {
          provide: EventStoreService,
          useValue: jasmine.createSpyObj('EventStoreService', ['removeAppointmentById', 'removeEventById']),
        },
      ]
    });

    service = TestBed.inject(DeleteEventService);
    appointmentApiServiceSpy = TestBed.inject(AppointmentApiService) as jasmine.SpyObj<AppointmentApiService>;
    eventsApiServiceSpy = TestBed.inject(EventsApiService) as jasmine.SpyObj<EventsApiService>;
    eventStoreSpy = TestBed.inject(EventStoreService) as jasmine.SpyObj<EventStoreService>;
  });

  describe('deleteAppointment', () => {
    it('should delete an upcoming appointment', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      const appointment = {
        id: 1,
        name: 'Future Appointment',
        date: new Date(Date.now() + 86400000), // Tomorrow
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      appointmentApiServiceSpy.deleteAppointment.and.returnValue(of(void 0));

      service.deleteAppointment('1', [appointment], onSuccess, onComplete);

      expect(appointmentApiServiceSpy.deleteAppointment).toHaveBeenCalledWith(1);
      expect(eventStoreSpy.removeAppointmentById).toHaveBeenCalledWith('1');
      expect(onSuccess).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should not delete when appointment is not found', () => {
      spyOn(window, 'alert');

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      service.deleteAppointment('99', [], onSuccess, onComplete);

      expect(appointmentApiServiceSpy.deleteAppointment).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Appointment not found');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should not delete appointment with missing id', () => {
      spyOn(console, 'error');
      spyOn(window, 'alert');

      const appointment = {
        name: 'Broken Appointment',
        date: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      service.deleteAppointment('0', [appointment], onSuccess, onComplete);

      expect(window.alert).toHaveBeenCalledWith('Appointment not found');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
    
    it('should not proceed when confirm is canceled', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const appointment = {
        id: 1,
        name: 'Future Appointment',
        date: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      service.deleteAppointment('1', [appointment], onSuccess, onComplete);

      expect(appointmentApiServiceSpy.deleteAppointment).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should handle deleteAppointment API failure gracefully', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      const appointment = {
        id: 1,
        name: 'Future Appointment',
        date: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      appointmentApiServiceSpy.deleteAppointment.and.returnValue(throwError(() => new Error('API error')));

      service.deleteAppointment('1', [appointment], onSuccess, onComplete);

      expect(window.alert).toHaveBeenCalledWith('Failed to delete appointment');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an upcoming event', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      const event = {
        id: 2,
        eventName: 'Future Event',
        startDate: new Date(Date.now() + 86400000), // Tomorrow
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      eventsApiServiceSpy.deleteEvent.and.returnValue(of(void 0));

      service.deleteEvent('2', [event], onSuccess, onComplete);

      expect(eventsApiServiceSpy.deleteEvent).toHaveBeenCalledWith(2);
      expect(eventStoreSpy.removeEventById).toHaveBeenCalledWith('2');
      expect(onSuccess).toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should not delete when event not found', () => {
      spyOn(window, 'alert');

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      service.deleteEvent('42', [], onSuccess, onComplete);

      expect(eventsApiServiceSpy.deleteEvent).not.toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Event not found');
      expect(onComplete).toHaveBeenCalled();
    });

    it('should not delete event with missing id', () => {
      spyOn(console, 'error');

      const event = {
        eventName: 'Broken Event',
        startDate: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      spyOn(window, 'alert');

      service.deleteEvent('0', [event], onSuccess, onComplete);

      expect(window.alert).toHaveBeenCalledWith('Event not found');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });


    it('should not proceed when user cancels confirm dialog', () => {
      spyOn(window, 'confirm').and.returnValue(false);

      const event = {
        id: 3,
        eventName: 'Future Event',
        startDate: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      service.deleteEvent('3', [event], onSuccess, onComplete);

      expect(eventsApiServiceSpy.deleteEvent).not.toHaveBeenCalled();
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });

    it('should handle deleteEvent API failure gracefully', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(window, 'alert');

      const event = {
        id: 4,
        eventName: 'Future Event',
        startDate: new Date(Date.now() + 86400000),
      } as any;

      const onSuccess = jasmine.createSpy('onSuccess');
      const onComplete = jasmine.createSpy('onComplete');

      eventsApiServiceSpy.deleteEvent.and.returnValue(throwError(() => new Error('API failure')));

      service.deleteEvent('4', [event], onSuccess, onComplete);

      expect(window.alert).toHaveBeenCalledWith('Failed to delete event');
      expect(onSuccess).not.toHaveBeenCalled();
      expect(onComplete).toHaveBeenCalled();
    });
  });
});