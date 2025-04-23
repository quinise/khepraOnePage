import { Component, Inject } from '@angular/core';
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
import { MatCard, MatCardTitle, MatCardContent, MatCardActions } from '@angular/material/card';
import { Router } from '@angular/router';

interface EventForm {
  name: FormControl<string>;
  clientName: FormControl<string | null>;
  startDate: FormControl<Date | null>;
  endDate: FormControl<Date | null>;
  startTime: FormControl<Date | null>;
  endTime: FormControl<Date | null>;
  location: FormControl<string | null>;
  description: FormControl<string | null>;
  isVirtual: FormControl<boolean>;
}

@Component({
  selector: 'app-create-event-form',
  providers: [provideNativeDateAdapter()],
  standalone: true,
  imports: [MatButtonModule,
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
    MatCard,
    MatCardTitle,
    MatCardActions,
    MatCardContent
  ],
  templateUrl: './create-event-form.component.html',
  styleUrl: './create-event-form.component.css'
})

export class CreateEventFormComponent {
  protected eventForm = new FormGroup<EventForm>({
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      clientName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
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
      location: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      description: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.pattern(/[a-zA-Z ]/), Validators.required]
      }),
      isVirtual: new FormControl<boolean>(false, {
        nonNullable: true,
      }),
    });

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {serviceType: string}, private router: Router) {}

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