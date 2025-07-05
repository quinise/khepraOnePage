import { NgIf } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { catchError, map } from 'rxjs/operators';
import { Availability } from 'src/app/interfaces/availability';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { AvailabilityService } from 'src/app/services/availability.service';

interface AvailabilityForm {
  selectedDate: FormControl<Date>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
}

@Component({
  selector: 'app-availability-module',
  providers: [provideNativeDateAdapter(), AvailabilityService],
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTimepickerModule,
  ],
  templateUrl: './availabilityModule.component.html',
  styleUrl: './availabilityModule.component.css'
})
export class AvailabilityModuleComponent {
  availability: Availability = {
    selectedDate: new Date(),
    startTime: new Date(),
    endTime: new Date()
  };

  isScheduler: boolean = false;

  protected availabilityForm = new FormGroup<AvailabilityForm>({
    selectedDate: new FormControl<Date>( new Date(), {
      nonNullable: true,
      validators: [Validators.required, this.futureDateValidator()]
    }),

    startTime: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),

    endTime: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  }, { validators: this.timeValidator() });

  @Output() availabilityUpdated = new EventEmitter<any>();

  constructor(
    private availabilityService: AvailabilityService,
    private authWrapper: AuthWrapperService
  ) {}
  
  ngOnInit(): void {
    this.isScheduler = this.authWrapper.isScheduler();
  }

  public get form() {
    return this.availabilityForm;
  }

  onSubmit(): void {
    const form = this.form.getRawValue();

    if (this.availabilityForm.valid) {
      const availability = {
        date: form.selectedDate,
        startTime: form.startTime,
        endTime: form.endTime,
      };

      this.availabilityUpdated.emit(availability);

      console.log('Form submitted:', availability);
    } else {
      console.error('Form is invalid');
    }
  }

  timeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const startTime = control.get('startTime')?.value;
      const endTime = control.get('endTime')?.value;

      if (startTime && endTime) {
        const start = new Date('1970-01-01T' + startTime); // Use a fixed date
        const end = new Date('1970-01-01T' + endTime);

        // Check if start time is after end time
        if (start >= end) {
          return { timeInvalid: 'Start time cannot be after end time.' };
        }
      }

      return null;
    };
  }

  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = control.value;

      if (selectedDate) {
        const currentDate = new Date();
        const inputDate = new Date(selectedDate);

        // Check if the selected date is in the future
        if (inputDate <= currentDate) {
          return { dateInPast: 'The date must be in the future.' };
        }
      }

      return null;
    };
  }

  onUpdateAvailability(id: number): void {
    if (this.availability.selectedDate && this.availability.startTime && this.availability.endTime) {
      // Check for conflicts first
      this.availabilityService.checkForConflicts(this.availability)
        .pipe(
          map(isConflicting => {
            if (isConflicting) {
              console.error('Time slot conflicts with an existing appointment!');
              alert('Time slot conflicts with an existing appointment!');
              throw new Error('Conflict found');
            } else {
              return this.availabilityService.updateAvailability(id, this.availability);
            }
          }),
          catchError(error => {
            console.error('Error checking for conflicts:', error);
            return []; // Return an empty observable to continue the flow if there is a conflict or other error
          })
        )
        .subscribe({
          next: (response) => {
            console.log('Availability updated:', response);
          },
          error: (error) => {
            console.error('Error updating availability:', error);
          }
        });
    } else {
      console.error('Availability data is missing!');
    }
  }
}
