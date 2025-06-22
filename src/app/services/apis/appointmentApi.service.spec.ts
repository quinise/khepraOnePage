import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Appointment } from '../../interfaces/appointment';
import { AppointmentApiService } from './appointmentApi.service';

describe('AppointmentApiService', () => {
  let service: AppointmentApiService;
  let httpMock: HttpTestingController;

  const mockAppointment: Appointment = {
    id: 1,
    userId: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    phoneNumber: '555-555-5555',
    type: 'READING',
    date: new Date('2025-07-01'),
    startTime: new Date('2025-07-01T10:00:00'),
    endTime: new Date('2025-07-01T10:30:00'),
    isVirtual: true,
    city: 'Seattle',
    createdByAdmin: false
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AppointmentApiService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AppointmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Ensure no outstanding requests
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new appointment', () => {
    service.createAppointment(mockAppointment).subscribe(appointment => {
      expect(appointment).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockAppointment);
    req.flush(mockAppointment);
  });

  it('should update an appointment', () => {
    service.updateAppointment(1, mockAppointment).subscribe(appointment => {
      expect(appointment).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockAppointment);
    req.flush(mockAppointment);
  });

  it('should delete an appointment', () => {
    service.deleteAppointment(1).subscribe(response => {
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

it('should fetch all appointments', () => {
    service.getAllAppointments().subscribe(appointments => {
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments');
    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('should fetch appointment by ID', () => {
    service.getAppointmentById(1).subscribe(appointment => {
      expect(appointment).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/appointments/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAppointment);
  });

  it('should fetch appointments by user ID with filter', () => {
    service.getAppointmentsByUserId('test-user', 'upcoming').subscribe(appointments => {
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne(r =>
      r.url === '/api/appointments' &&
      r.params.get('userId') === 'test-user' &&
      r.params.get('filter') === 'upcoming'
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('should use getAppointments with filter and userId', () => {
    service.getAppointments('abc123', 'past').subscribe(appointments => {
      expect(appointments).toEqual([mockAppointment]);
    });

    const req = httpMock.expectOne(r =>
      r.url === '/api/appointments' &&
      r.params.get('userId') === 'abc123' &&
      r.params.get('filter') === 'past'
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('should fetch appointments by email without filter', () => {
    service.getAppointmentsByEmail('test@example.com').subscribe(appointments => {
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8080/api/appointments' &&
      r.params.get('email') === 'test@example.com' &&
      !r.params.has('filter')
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('should fetch appointments by email with upcoming filter', () => {
    service.getAppointmentsByEmail('test@example.com', 'upcoming').subscribe(appointments => {
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8080/api/appointments' &&
      r.params.get('email') === 'test@example.com' &&
      r.params.get('filter') === 'upcoming'
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });

  it('should fetch appointments by email with past filter', () => {
    service.getAppointmentsByEmail('test@example.com', 'past').subscribe(appointments => {
      expect(appointments.length).toBe(1);
      expect(appointments[0]).toEqual(mockAppointment);
    });

    const req = httpMock.expectOne(r =>
      r.url === 'http://localhost:8080/api/appointments' &&
      r.params.get('email') === 'test@example.com' &&
      r.params.get('filter') === 'past'
    );

    expect(req.request.method).toBe('GET');
    req.flush([mockAppointment]);
  });


});