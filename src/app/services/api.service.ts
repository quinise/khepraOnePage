import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from '../interfaces/appointment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  appointments: Appointment[] = [];
  appointment: Appointment | {} = {};

  private baseUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) {}

  // Get all appointments
  getAll(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(this.baseUrl);
  }

  // Get one appointment by its ID
  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.baseUrl}/${id}`);
  }

  // Create new appointment
  create(appointment: Appointment): Observable<Appointment> {
    return this.http.post<Appointment>(this.baseUrl, appointment);
  }

  // Update appointment by ID
  update(id: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.baseUrl}/${id}`, appointment);
  }

  // Delete appointment by ID
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
