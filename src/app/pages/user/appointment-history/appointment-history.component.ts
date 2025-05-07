import { Component, OnInit } from '@angular/core';
import { AsyncPipe, NgFor, NgIf, DatePipe } from '@angular/common';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { DeleteEventService } from 'src/app/services/delete-event.service';
@Component({
  selector: 'app-appointment-history',
  standalone: true,
  imports: [NgIf, NgFor, AsyncPipe, DatePipe],
  templateUrl: './appointment-history.component.html',
  styleUrl: './appointment-history.component.css'
})
export class AppointmentHistoryComponent implements OnInit {
  pastAppointments$: Observable<Appointment[]> = of([]);
  upcomingAppointments$ = new BehaviorSubject<Appointment[]>([]);
  upcomingAppointments: Appointment[] = [];
  
  constructor(
    private authService: AuthService,
    private appointmentApiService: AppointmentApiService,
    private deleteService: DeleteEventService,
  ) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user?.uid) {
        this.appointmentApiService.getAppointmentsByUserId(user.uid, 'upcoming').subscribe(appointments => {
          this.upcomingAppointments = appointments;
          this.upcomingAppointments$.next(this.upcomingAppointments);
        });

        this.pastAppointments$ = this.appointmentApiService.getAppointmentsByUserId(user.uid, 'past');
      }
    });
  }
  
  deleteAppointment(id: number): void {
    this.deleteService.deleteAppointment(
      id,
      this.upcomingAppointments,
      {},
      () => {
        // After deletion, update BehaviorSubject so the view refreshes
        this.upcomingAppointments$.next([...this.upcomingAppointments]);
        // TODO: Success action - show a toast
        console.log('Appointment deleted from history component');
      }
    );
  }
}