import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { EventsApiService } from './events-api.service';
import { Event } from '../../interfaces/event';

describe('EventsApiService', () => {
  let service: EventsApiService;
  let httpMock: HttpTestingController;

  const mockEvent: Event = {
    id: 1,
    eventName: 'Sample Workshop',
    eventType: 'WORKSHOP',
    description: 'A test workshop event',
    startDate: new Date(),
    startTime: new Date(),
    endDate: new Date(),
    endTime: new Date(),
    isVirtual: false,
    city: 'Seattle'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventsApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(EventsApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch all events', () => {
    service.getAllEvents().subscribe(events => {
      expect(events.length).toBe(1);
      expect(events[0]).toEqual(mockEvent);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    expect(req.request.method).toBe('GET');
    req.flush([mockEvent]);
  });

  it('should fetch a single event by ID', () => {
    service.getEventById(1).subscribe(event => {
      expect(event).toEqual(mockEvent);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockEvent);
  });

  it('should create a new event', () => {
    service.createEvent(mockEvent).subscribe(event => {
      expect(event).toEqual(mockEvent);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockEvent);
    req.flush(mockEvent);
  });

  it('should update an event', () => {
    service.updateEvent(1, mockEvent).subscribe(event => {
      expect(event).toEqual(mockEvent);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockEvent);
    req.flush(mockEvent);
  });

  it('should delete an event', () => {
    service.deleteEvent(1).subscribe(response => {
      expect(response).toBeFalsy();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/events/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});