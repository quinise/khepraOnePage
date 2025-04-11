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
import { Router } from '@angular/router';
import { ApiService } from 'src/app/services/api.service';

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
  serviceIdNumber: number;

  _todaysDate = new Date();
  minDate = new Date();
  maxDate = new Date();

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {serviceType: string}, public apiService: ApiService, private router: Router) {
    this.serviceIdNumber = this.generateIdNumber();

    this.minDate.setDate(this._todaysDate.getDate() + 2);
    this.maxDate.setMonth(this._todaysDate.getMonth() + 2);
  }

  generateIdNumber(): number {
    const min = 10000000;
    const max = 99999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
  })

  onSubmit(form: any): void {
    const combinedDateTime = new Date(
      form.value.date.getFullYear(),
      form.value.date.getMonth(),
      form.value.date.getDate(),
      form.value.time.getHours(),
      form.value.time.getMinutes(),
      form.value.time.getSeconds(),
    )

    this.apiService.appointment = {
      id: this.serviceIdNumber,
      type: this.data.serviceType,
      name: form.value.name,
      email: form.value.email,
      phone_number: form.value.phone_number,
      date: combinedDateTime,
      isVirtual: form.value.isVirtual
    };
  }
}
