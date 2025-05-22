import { AsyncPipe, DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { AppointmentFormComponent } from 'src/app/components/forms/book-appointment-form/book-appointment-form.component';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
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
    private dialog: MatDialog,
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
  
  openEditDialog(appointment: Appointment): void {
    const dialogRef = this.dialog.open(AppointmentFormComponent, {
      data: { serviceType: appointment.type, appointmentToEdit: appointment },
    });
  
    dialogRef.componentInstance.appointmentSaved.subscribe((updated: Appointment) => {
      // Update the appointment in the list
      const index = this.upcomingAppointments.findIndex(a => a.id === updated.id);
      if (index !== -1) {
        this.upcomingAppointments[index] = updated;
      }
    });
  }

  editAppointment(appointment: Appointment): void {
    this.dialog.open(AppointmentFormComponent, {
      data: {
        serviceType: appointment.type,
        appointmentToEdit: appointment
      }
    });
  }

  deleteAppointment(id: number): void {
    this.deleteService.deleteAppointment(
      id.toString(),
      this.upcomingAppointments,
      () => {},
      () => {
        // After deletion, update BehaviorSubject so the view refreshes
        this.upcomingAppointments$.next([...this.upcomingAppointments]);
        // TODO: Success action - show a toast
      }
    );
  }
}