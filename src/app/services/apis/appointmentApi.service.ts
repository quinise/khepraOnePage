import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from '../../interfaces/appointment';

@Injectable({
  providedIn: 'root'
})
export class AppointmentApiService {
  appointments: Appointment[] = [];
  appointment: Appointment | {} = {};

  private baseUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl);
  }

  // TODO: Switch to this method for getting appointments (instead of getAllAppointments)
  getAppointments(userId: string, filter: 'past' | 'upcoming' | null) {
    const params = new HttpParams()
    .set('userId', userId)
    .set('filter', filter ?? '');

  return this.http.get<Appointment[]>('/api/appointments', { params });
}


  // Get one appointment by its ID
  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/${id}`);
  }

  getAppointmentsByUserId(userId: string, filter?: 'past' | 'upcoming'): Observable<Appointment[]> {
    let params = new HttpParams().set('userId', userId);
    if (filter) {
      params = params.set('filter', filter);
    }
    return this.http.get<Appointment[]>(`/api/appointments`, { params });
  }
  

  // Create new appointment
  createAppointment(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  // Update appointment by ID
  updateAppointment(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/${id}`, appointment);
  }

  // Delete appointment by ID
  deleteAppointment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
