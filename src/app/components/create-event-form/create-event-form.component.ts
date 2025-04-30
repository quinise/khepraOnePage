import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions, MatCardContent } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Router } from '@angular/router';
import { Event } from 'src/app/interfaces/event';
import { EventsApiService } from 'src/app/services/events-api.service';
interface EventForm {
  eventName: FormControl<string>;
  eventType: FormControl<string>;
  clientName: FormControl<string | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  startTime: FormControl<Date | null>;
  endTime: FormControl<Date | null>;
  streetAddress: FormControl<string | null>;
  city: FormControl<string | null>;
  state: FormControl<string | null>;
  zipCode: FormControl<number | null>;
  description: FormControl<string>;
  isVirtual: FormControl<boolean>;
}

@Component({
  selector: 'app-create-event-form',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormField,
    MatCheckboxModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatTimepickerModule,
    MatCardActions,
    MatCardContent,
    MatSelectModule,
  ],
  templateUrl: './create-event-form.component.html',
  styleUrl: './create-event-form.component.css'
})

export class CreateEventFormComponent {
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

  eventTypes = [
    { name: 'Workshop', value: 'workshop' },
    { name: 'Bembe', value: 'bembe' },
    { name: 'Lecture', value: 'lecture' },
    { name: 'Community Egungun', value: 'egungun' },
    { name: 'Priest Training', value: 'priestTraining' },
  ];
  
  successMessage = '';
  errorMessage = '';

  protected eventForm = new FormGroup<EventForm>({
      eventName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      eventType: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      clientName: new FormControl<string | null>('', {
        nonNullable: false,
        validators: [Validators.pattern(/[a-zA-Z ]/)]
      }),
      startDate: new FormControl<Date | null>(null, {
        nonNullable: false,
        validators: Validators.required
      }),
      endDate: new FormControl<Date | null>(null, {
        nonNullable: false,
        validators: Validators.required
      }),
      startTime: new FormControl<Date | null>(null, {
        nonNullable: false,
        validators: Validators.required
      }),
      endTime: new FormControl<Date | null>(null, {
        nonNullable: false,
        validators: Validators.required
      }),
      streetAddress: new FormControl<string>('', {
        nonNullable: false,
        validators: [Validators.pattern(/[a-zA-Z ]/)]
      }),
      city: new FormControl<string>('', {
        nonNullable: false,
        validators: [Validators.pattern(/[a-zA-Z ]/)]
      }),
      state: new FormControl<string | null>('', {
        nonNullable: false,
        // validators: []
      }),
      zipCode: new FormControl<number | null>(null, {
        nonNullable: false,
        validators: [Validators.pattern(/[0-9]/)]
      }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/^[A-Za-z0-9 .,!?'"()\-:;\n\r]*$/), Validators.required]
      }),
      isVirtual: new FormControl<boolean>(false, {
        nonNullable: true,
      }),
    });

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {eventType: string}, public eventsService: EventsApiService, private router: Router) {}

ngOnInit(): void {
    this.eventForm.get('isVirtual')?.valueChanges.subscribe((isVirtual) => {
      const streetAddress = this.eventForm.get('streetAddress');
      const city = this.eventForm.get('city');
      const state = this.eventForm.get('state');
      const zipCode = this.eventForm.get('zipCode');

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
  }

  onCancel() {
    this._matDialog.closeAll();
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      const formValues = this.eventForm.value;
      let combinedStartDateTime: Date | null = null;
      let combinedEndDateTime: Date | null = null;

      const startDate = formValues.startDate;
      const startTime = formValues.startTime;
  
      if (startDate && startTime) {
        combinedStartDateTime = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate(),
          startTime.getHours(),
          startTime.getMinutes(),
          startTime.getSeconds()
        );
      }

        const endDate = formValues.endDate;
        const endTime = formValues.endTime;
    
        if (endDate && endTime) {
          combinedEndDateTime = new Date(
            endDate.getFullYear(),
            endDate.getMonth(),
            endDate.getDate(),
            endTime.getHours(),
            endTime.getMinutes(),
            endTime.getSeconds()
          );
        }

        const event: Event = {
          eventName: formValues.eventName!,
          eventType: formValues.eventType!,
          clientName: formValues.clientName,
          startDate: combinedStartDateTime!,
          endDate: combinedEndDateTime!,
          streetAddress: formValues.streetAddress,
          city: formValues.city,
          state: formValues.state,
          zipCode: formValues.zipCode,
          description: formValues.description!,
          isVirtual: formValues.isVirtual!
        }

        console.log("TESTING: formValues.eventName, formValues.evenType, formValues.clientName, formValues.clientName, formValues.startDate, formValues.endDate, formValues.streetAddress, formValues.city, formValues.state, formValues.zipCode, formValues.isVirtual, formValues.description", formValues.eventName, formValues.eventType, formValues.endTime, formValues.clientName, formValues.clientName, formValues.startDate, formValues.endDate, formValues.streetAddress, formValues.city, formValues.state, formValues.zipCode, formValues.isVirtual, formValues.description)

        this.eventsService.createEvent(event).subscribe({
          next: (res) => {
            this.successMessage = 'Event successfully scheduled!';
            this.errorMessage = '';
            this.eventForm.reset();
          },
          error: (err) => {
            this.successMessage = '';
            this.errorMessage = 'Failed to schedule event. Please try again.';
            console.error(err);
          }
        })

      this._matDialog.closeAll();
    } else {
      // Handle form errors
    }
  }
}