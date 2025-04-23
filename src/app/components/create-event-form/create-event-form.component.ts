import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCardContent, MatCardActions } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Router } from '@angular/router';

interface EventForm {
  name: FormControl<string>;
  clientName: FormControl<string | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  startTime: FormControl<Date | null>;
  endTime: FormControl<Date | null>;
  streetAddress: FormControl<string | null>;
  city: FormControl<string | null>;
  state: FormControl<string | null>;
  zipCode: FormControl<number | null>;
  description: FormControl<string | null>;
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
  
  protected eventForm = new FormGroup<EventForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      clientName: new FormControl<string>('', {
        nonNullable: true,
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

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {serviceType: string}, private router: Router) {}

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
      // Handle form submission
      this._matDialog.closeAll();
    } else {
      // Handle form errors
    }
  }
}