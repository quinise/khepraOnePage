import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, map  } from 'rxjs/operators';
import { Appointment } from 'src/app/interfaces/appointment';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';

@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.css'
})
export class AppointmentHistoryComponent implements OnInit {
  pastAppointments$: Observable<Appointment[]> = of([]);
  upcomingAppointments$: Observable<Appointment[]> = of([]);
  
  constructor(
    private authService: AuthService,
    private appointmentApiService: AppointmentApiService
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
        this.upcomingAppointments$ = this.appointmentApiService.getAppointmentsByUserId(user.uid, 'upcoming');
        this.pastAppointments$ = this.appointmentApiService.getAppointmentsByUserId(user.uid, 'past');
      }
    });
  }
  
}