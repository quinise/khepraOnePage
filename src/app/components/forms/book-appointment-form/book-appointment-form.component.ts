import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { firstValueFrom, Observable } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppUser } from 'src/app/interfaces/appUser';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';

interface AppointmentForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  date: FormControl<Date>;
  time: FormControl<Date>;
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
export class AppointmentFormComponent implements OnInit{
  successMessage = '';
  errorMessage = '';

  _todaysDate = new Date();
  minDate = new Date();
  maxDate = new Date();

  user$: Observable<AppUser | null>;

  @Output() appointmentSaved = new EventEmitter<Appointment>();

  protected appointmentForm = new FormGroup<AppointmentForm>({
    name: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^[a-zA-Z ]+$/), Validators.required]
    }),
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phoneNumber: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^(\+1\s?)?(\(?\d{3}\)?[\s.-]?)?\d{3}[\s.-]?\d{4}$/)]
    }),
    date: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: Validators.required
    }),
    time: new FormControl<Date>(new Date(), {
      nonNullable: true,
      validators: Validators.required
    }),
    isVirtual: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  });
  

  constructor (
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { serviceType: string, appointmentToEdit?: Appointment },
    private cdr: ChangeDetectorRef,
    public appointmentApiService: AppointmentApiService,
    public authService: AuthService
  ) {
    this.user$ = authService.user$;
  
    this.minDate.setDate(this._todaysDate.getDate() + 2);
    this.maxDate.setMonth(this._todaysDate.getMonth() + 2);
  }

  ngOnInit(): void {
    if (this.data.appointmentToEdit) {
      const existing = this.data.appointmentToEdit;
      const date = new Date(existing.date);
      const time = new Date(existing.date);
      time.setHours(date.getHours(), date.getMinutes(), date.getSeconds());
  
      this.appointmentForm.patchValue({
        name: existing.name,
        email: existing.email,
        phoneNumber: existing.phoneNumber?.toString(),
        date: date,
        time: date,
        isVirtual: existing.isVirtual
      });
  
      // ✅ Dynamically extend the min/max to include existing date
      this.minDate = new Date(Math.min(this.minDate.getTime(), date.getTime()));
      this.maxDate = new Date(Math.max(this.maxDate.getTime(), date.getTime()));
  
      // ✅ Attach the custom validator to the 'date' field
      const dateControl = this.appointmentForm.get('date');
      dateControl?.addValidators(this.dateValidator(date, this.minDate, this.maxDate));
      dateControl?.updateValueAndValidity();
    }
  
    this.cdr.markForCheck();
  }
  
  async onSubmit(form: any): Promise<void> {
    const combinedDateTime = new Date(
      form.value.date.getFullYear(),
      form.value.date.getMonth(),
      form.value.date.getDate(),
      form.value.time.getHours(),
      form.value.time.getMinutes(),
      form.value.time.getSeconds(),
    );
  
    const user = await firstValueFrom(this.user$);
  
    const appointment: Appointment = {
      type: this.data.serviceType,
      userId: user?.uid ?? '',
      name: form.value.name,
      email: form.value.email,
      phoneNumber: form.value.phoneNumber,
      date: combinedDateTime,
      isVirtual: form.value.isVirtual,
      id: this.data.appointmentToEdit?.id
    };
  
    const appointmentOperation$ = this.data.appointmentToEdit
      ? this.appointmentApiService.updateAppointment(this.data.appointmentToEdit.id!, appointment)
      : this.appointmentApiService.createAppointment(appointment);
  
    appointmentOperation$.subscribe({
      next: (savedAppointment) => {
        this.successMessage = this.data.appointmentToEdit
          ? 'Appointment updated successfully!'
          : 'Appointment successfully booked!';
        this.errorMessage = '';
        this.appointmentForm.reset();
        this.appointmentSaved.emit(savedAppointment);
        this._matDialog.closeAll();
      },
      error: (err) => {
        this.successMessage = '';
        this.errorMessage = 'Failed to save appointment. Please try again.';
        console.error(err);
      }
    });
  }

  dateValidator(originalDate: Date, min: Date, max: Date): ValidatorFn {
    return (control: AbstractControl) => {
      const selected = new Date(control.value);
  
      // If it's the same as original, skip validation
      if (selected.toDateString() === new Date(originalDate).toDateString()) {
        return null;
      }
  
      if (selected < min) return { dateTooEarly: true };
      if (selected > max) return { dateTooLate: true };
  
      return null;
    };
  }
}