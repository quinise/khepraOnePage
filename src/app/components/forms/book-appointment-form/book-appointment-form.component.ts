import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { debounceTime, distinctUntilChanged, firstValueFrom, Observable, take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppUser } from 'src/app/interfaces/appUser';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { ConflictCheckService } from 'src/app/services/conflict-check.service';
import { combineDateAndTime } from 'src/app/utils/date-time.utils';

interface AppointmentForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  date: FormControl<Date>;
  time: FormControl<Date>;
  isVirtual: FormControl<boolean>;
  type: FormControl<string>;
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
    MatSelectModule
    ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './book-appointment-form.component.html',
  styleUrl: './book-appointment-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent implements OnInit{
  private appointmentDurations: Record<string, number> = {
      READING: 30,
      CLEANSING: 45,
      INITIATION: 60,
      WORKSHOP: 90,
    };

  isAdmin = false;

  successMessage = '';
  errorMessage = '';
  
  _todaysDate = new Date();
  minDate = new Date();
  maxDate = new Date();

  user$: Observable<AppUser | null>;

  existingAppointments: Appointment[] = [];
  hasConflict = false;

  @Input() appointmentToEdit?: Appointment;
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
    type: new FormControl<string>('', {
      nonNullable: true,
      validators: this.isAdmin ? [Validators.required] : []
    })
  });

  constructor (
    private _matDialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { serviceType: string, appointmentToEdit?: Appointment },
    private cdr: ChangeDetectorRef,
    public appointmentApiService: AppointmentApiService,
    public authService: AuthService,
    private conflictCheckService: ConflictCheckService,
  ) {
    this.user$ = authService.user$;
  
    this.minDate.setDate(this._todaysDate.getDate() + 2);
    this.maxDate.setMonth(this._todaysDate.getMonth() + 2);
  }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe(user => {
      this.isAdmin = user?.role === 'admin';

      // Now that isAdmin is available, apply validator to type
      if (this.isAdmin) {
        this.appointmentForm.get('type')?.addValidators(Validators.required);
        this.appointmentForm.get('type')?.updateValueAndValidity();
      }

      this.patchIfEditing();
      this.loadExistingAppointments();
      this.cdr.markForCheck();
    });

    // Listen for changes in date or time
    this.appointmentForm.get('date')?.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(100))
      .subscribe(() => this.checkForConflictsFromForm());

    this.appointmentForm.get('time')?.valueChanges
      .pipe(distinctUntilChanged(), debounceTime(100))
      .subscribe(() => this.checkForConflictsFromForm());
  }

  private loadExistingAppointments(): void {
    this.appointmentApiService.getAllAppointments().pipe(take(1)).subscribe({
      next: (appointments) => {
        // Optionally filter out the one you're editing
        const editingId = this.data.appointmentToEdit?.id;
        this.existingAppointments = appointments.filter(a => a.id !== editingId);
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
        this.existingAppointments = [];
      }
    });
  }

  private async checkForConflictsFromForm() {
    const formValue = this.appointmentForm.value;

    if (!formValue.date || !formValue.time || !formValue.type || formValue.isVirtual == null) return;

    const start = combineDateAndTime(formValue.date, formValue.time);
    // TODO: City is hardcoded for now, should be dynamic based on user input
    const hardCodedCity = formValue.isVirtual ? "virtual" : "Seattle";

    const hasConflict = await this.conflictCheckService.checkForConflicts(
      start,
      formValue.type,
      formValue.isVirtual,
      hardCodedCity
    );

    this.hasConflict = hasConflict;
  }

  async onSubmit(form: any): Promise<void> {
    const combinedDateTime = combineDateAndTime(form.value.date, form.value.time);
  
    const user = await firstValueFrom(this.user$);

    const durationMinutes = this.appointmentDurations[form.value.type] ?? 30;
    const endTime = new Date(combinedDateTime.getTime() + durationMinutes * 60000);

    const appointment: Appointment = {
      type: this.isAdmin ? form.value.type : this.data.serviceType,
      userId: user?.uid ?? '',
      name: form.value.name,
      email: form.value.email,
      phoneNumber: form.value.phoneNumber,
      date: combinedDateTime,
      startTime: combinedDateTime,
      endTime: endTime,
      isVirtual: form.value.isVirtual,
      id: this.data.appointmentToEdit?.id,
      createdByAdmin: this.isAdmin ? true : false,
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

  private patchIfEditing() {
    if (this.data.appointmentToEdit) {
      const existing = this.data.appointmentToEdit;
      const date = new Date(existing.date);
      const time = new Date(existing.date);

      this.appointmentForm.patchValue({
        name: existing.name,
        email: existing.email,
        phoneNumber: existing.phoneNumber?.toString(),
        date: date,
        time: time,
        isVirtual: existing.isVirtual,
        type: existing.type ?? ''
      });

      this.minDate = new Date(Math.min(this.minDate.getTime(), date.getTime()));
      this.maxDate = new Date(Math.max(this.maxDate.getTime(), date.getTime()));

      const dateControl = this.appointmentForm.get('date');
      dateControl?.addValidators(this.dateValidator(date, this.minDate, this.maxDate));
      dateControl?.updateValueAndValidity();
    }
  }
}