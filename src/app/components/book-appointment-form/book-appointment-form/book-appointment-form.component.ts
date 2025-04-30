import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Observable } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppUser } from 'src/app/interfaces/appUser';
import { AppointmentApiService } from 'src/app/services/appointmentApi.service';
import { AuthService } from 'src/app/services/auth.service';
import { firstValueFrom } from 'rxjs';

interface AppointmentForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phone_number: FormControl<number | null>;
  date: FormControl<Date | null>;
  time: FormControl<Date | null>;
  isVirtual: FormControl<boolean>;
}
@Component({
  selector: 'app-appointment-form',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormField,
    MatCheckboxModule,
    MatInputModule,
    FormsModule,
    NgIf,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTimepickerModule,
    ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './book-appointment-form.component.html',
  styleUrl: './book-appointment-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent {
  user$: Observable<AppUser | null>;

  successMessage = '';
  errorMessage = '';

  _todaysDate = new Date();
  minDate = new Date();
  maxDate = new Date();

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {serviceType: string}, public appointmentApiService: AppointmentApiService, public authService: AuthService) {
    this.user$ = authService.user$;

    this.minDate.setDate(this._todaysDate.getDate() + 2);
    this.maxDate.setMonth(this._todaysDate.getMonth() + 2);
  }

  protected appointmentForm = new FormGroup<AppointmentForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone_number: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]
    }),
    date: new FormControl<Date | null>(null, {
      nonNullable: false,
      validators: Validators.required
    }),
    time: new FormControl<Date | null>(null, {
      nonNullable: false,
      validators: Validators.required
    }),
    isVirtual: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  });

  async onSubmit(form: any): Promise<void> {
    const combinedDateTime = new Date(
      form.value.date.getFullYear(),
      form.value.date.getMonth(),
      form.value.date.getDate(),
      form.value.time.getHours(),
      form.value.time.getMinutes(),
      form.value.time.getSeconds(),
    )

    const user = await firstValueFrom(this.user$); // ⬅️ safely get user value

    const appointment: Appointment = {
      type: this.data.serviceType,
      userId: user?.uid ?? '',
      name: form.value.name,
      email: form.value.email,
      phone_number: form.value.phone_number,
      date: combinedDateTime,
      isVirtual: form.value.isVirtual
    };

    this.appointmentApiService.createAppointment(appointment).subscribe({
      next: (res) => {
        this.successMessage = 'Appointment successfully booked!';
        this.errorMessage = '';
        this.appointmentForm.reset();
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = 'Failed to book appointment. Please try again.';
        console.error(err);
      }
    })

    this._matDialog.closeAll();
  }
}