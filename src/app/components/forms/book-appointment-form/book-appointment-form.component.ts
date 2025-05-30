import { NgIf, NgForOf } from '@angular/common';
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
import { MatOption } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { debounceTime, distinctUntilChanged, firstValueFrom, Observable, take } from 'rxjs';
import { Appointment } from 'src/app/interfaces/appointment';
import { AppUser } from 'src/app/interfaces/appUser';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { ConflictCheckService } from 'src/app/services/conflict-check.service';
import { mergeDateAndTime } from 'src/app/utils/date-time.utils';

interface AppointmentForm {
  name: FormControl<string>;
  email: FormControl<string>;
  phoneNumber: FormControl<string>;
  streetAddress: FormControl<string | null>;
  city: FormControl<string | null>;
  state: FormControl<string | null>;
  zipCode: FormControl<number | null>;
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
    NgForOf,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatSelectModule,
    MatOption
    ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './book-appointment-form.component.html',
  styleUrl: './book-appointment-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentFormComponent implements OnInit{
  usStates = [
    { name: 'Alabama', abbreviation: 'AL' },
    { name: 'Alaska', abbreviation: 'AK' },
    { name: 'Arizona', abbreviation: 'AZ' },
    { name: 'Arkansas', abbreviation: 'AR' },
    { name: 'California', abbreviation: 'CA' },
    { name: 'Colorado', abbreviation: 'CO' },
    { name: 'Connecticut', abbreviation: 'CT' },
    { name: 'Delaware', abbreviation: 'DE' },
    { name: 'Florida', abbreviation: 'FL' },
    { name: 'Georgia', abbreviation: 'GA' },
    { name: 'Hawaii', abbreviation: 'HI' },
    { name: 'Idaho', abbreviation: 'ID' },
    { name: 'Illinois', abbreviation: 'IL' },
    { name: 'Indiana', abbreviation: 'IN' },
    { name: 'Iowa', abbreviation: 'IA' },
    { name: 'Kansas', abbreviation: 'KS' },
    { name: 'Kentucky', abbreviation: 'KY' },
    { name: 'Louisiana', abbreviation: 'LA' },
    { name: 'Maine', abbreviation: 'ME' },
    { name: 'Maryland', abbreviation: 'MD' },
    { name: 'Massachusetts', abbreviation: 'MA' },
    { name: 'Michigan', abbreviation: 'MI' },
    { name: 'Minnesota', abbreviation: 'MN' },
    { name: 'Mississippi', abbreviation: 'MS' },
    { name: 'Missouri', abbreviation: 'MO' },
    { name: 'Montana', abbreviation: 'MT' },
    { name: 'Nebraska', abbreviation: 'NE' },
    { name: 'Nevada', abbreviation: 'NV' },
    { name: 'New Hampshire', abbreviation: 'NH' },
    { name: 'New Jersey', abbreviation: 'NJ' },
    { name: 'New Mexico', abbreviation: 'NM' },
    { name: 'New York', abbreviation: 'NY' },
    { name: 'North Carolina', abbreviation: 'NC' },
    { name: 'North Dakota', abbreviation: 'ND' },
    { name: 'Ohio', abbreviation: 'OH' },
    { name: 'Oklahoma', abbreviation: 'OK' },
    { name: 'Oregon', abbreviation: 'OR' },
    { name: 'Pennsylvania', abbreviation: 'PA' },
    { name: 'Rhode Island', abbreviation: 'RI' },
    { name: 'South Carolina', abbreviation: 'SC' },
    { name: 'South Dakota', abbreviation: 'SD' },
    { name: 'Tennessee', abbreviation: 'TN' },
    { name: 'Texas', abbreviation: 'TX' },
    { name: 'Utah', abbreviation: 'UT' },
    { name: 'Vermont', abbreviation: 'VT' },
    { name: 'Virginia', abbreviation: 'VA' },
    { name: 'Washington', abbreviation: 'WA' },
    { name: 'West Virginia', abbreviation: 'WV' },
    { name: 'Wisconsin', abbreviation: 'WI' },
    { name: 'Wyoming', abbreviation: 'WY' }
  ];

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
    streetAddress: new FormControl<string>('', {
        nonNullable: false,
        validators: [Validators.pattern(/[a-zA-Z ]/)]
      }),
      city: new FormControl<string>('', {
        nonNullable: false,
        validators: [Validators.pattern(/[a-zA-Z ]/)]
      }),
      state: new FormControl<string>('', {
        nonNullable: false,
        // TODO: validators: []
      }),
      // TODO: Change to string
      zipCode: new FormControl<number | null>(null, {
        nonNullable: false,
        validators: [Validators.pattern(/[0-9]/)]
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

      // if User type is isAdmin, apply validator to type
      if (this.isAdmin) {
        this.appointmentForm.get('type')?.addValidators(Validators.required);
        this.appointmentForm.get('type')?.updateValueAndValidity();
      }

      this.patchIfEditing();
      this.loadExistingAppointments();
      this.cdr.markForCheck();
    });

    this.appointmentForm.get('isVirtual')?.valueChanges.subscribe((isVirtual) => {
      const streetAddress = this.appointmentForm.get('streetAddress');
      const city = this.appointmentForm.get('city');
      const state = this.appointmentForm.get('state');
      const zipCode = this.appointmentForm.get('zipCode');

      if (isVirtual) {
        // Clear validators for address fields
        streetAddress?.clearValidators();
        city?.clearValidators();
        state?.clearValidators();
        zipCode?.clearValidators();
      } else {
        // Set validators for address fields
        streetAddress?.setValidators([Validators.required]);
        city?.setValidators([Validators.required]);
        state?.setValidators([Validators.required]);
        zipCode?.setValidators([Validators.required, Validators.pattern(/^\d{5}(-\d{4})?$/)]);
      }

      // Update validity
      streetAddress?.updateValueAndValidity();
      city?.updateValueAndValidity();
      state?.updateValueAndValidity();
      zipCode?.updateValueAndValidity();
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
        // Filter out the appointment to edit
        const editingId = this.data.appointmentToEdit?.id;
        console.log('Updating appointment with ID in loadExistingAppointments:', this.data.appointmentToEdit?.id);

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

    const start = mergeDateAndTime(formValue.date, formValue.time);
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
    const mergedDateTime = mergeDateAndTime(form.value.date, form.value.time);
  
    const user = await firstValueFrom(this.user$);

    const durationMinutes = this.appointmentDurations[form.value.type] ?? 30;
    const endTime = new Date(mergedDateTime.getTime() + durationMinutes * 60000);

    const appointment: Appointment = {
      type: this.isAdmin ? form.value.type : this.data.serviceType,
      userId: user?.uid ?? '',
      name: form.value.name,
      email: form.value.email,
      phoneNumber: form.value.phoneNumber,
      streetAddress: form.value.streetAddress || null,
      city: form.value.city || null,
      state: form.value.state || null,
      zipCode: form.value.zipCode || null,
      date: mergedDateTime,
      startTime: mergedDateTime,
      endTime: endTime,
      isVirtual: form.value.isVirtual,
      id: this.data.appointmentToEdit?.id,
      createdByAdmin: this.isAdmin ? true : false,
    };
  
    console.log('Updating appointment with ID in onSubmit:', this.data.appointmentToEdit?.id);


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
    console.log('Updating appointment with ID in patchIfEditing:', this.data.appointmentToEdit?.id);

      const existing = this.data.appointmentToEdit;
      const date = new Date(existing.date);
      const time = new Date(existing.date);

      this.appointmentForm.patchValue({
        name: existing.name,
        email: existing.email,
        phoneNumber: existing.phoneNumber?.toString(),
        streetAddress: existing.streetAddress,
        city: existing.city,
        state: existing.state,
        zipCode: existing.zipCode,
        date: existing.date,
        time: existing.startTime,
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