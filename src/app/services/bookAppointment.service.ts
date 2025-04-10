import { Injectable } from '@angular/core';
import { Appointment } from '../interfaces/appointment';

@Injectable({
  providedIn: 'root'
})
export class BookAppointment {
  appointments: Appointment[] = [];
  appointment: Appointment | {} = {};
}
