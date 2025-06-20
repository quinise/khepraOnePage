import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardActions, MatCardContent } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { debounceTime, distinctUntilChanged, take } from 'rxjs';
import { Event } from 'src/app/interfaces/event';
import { EventsApiService } from 'src/app/services/apis/events-api.service';
import { ConflictCheckService } from 'src/app/services/conflict-check.service';
import { mergeDateAndTime } from 'src/app/utils/date-time.utils';
interface EventForm {
  eventName: FormControl<string>;
  eventType: FormControl<string>;
  clientName: FormControl<string | null>;
  startDate: FormControl<Date>;
  endDate: FormControl<Date>;
  startTime: FormControl<Date>;
  endTime: FormControl<Date>;
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
  styleUrl: './create-event-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
  conflictWarning = '';

  existingEvents: Event[] = [];
  hasConflict = false
  
  eventForm : FormGroup;

  @Output() eventSaved = new EventEmitter<Event>();
    constructor(
      private _matDialog: MatDialog,
      @Inject(MAT_DIALOG_DATA) public data: { eventType?: string; eventToEdit?: Event },
      public eventsService: EventsApiService,
      private dialogRef: MatDialogRef<CreateEventFormComponent>,
      private conflictCheckService: ConflictCheckService,
    ) {
        this.eventForm = new FormGroup<EventForm>({
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
        startDate: new FormControl<Date>(new Date(), {
          nonNullable: true,
          validators: Validators.required
        }),
        endDate: new FormControl<Date>(new Date(), {
          nonNullable: true,
          validators: Validators.required
        }),
        startTime: new FormControl<Date>(new Date(), {
          nonNullable: true,
          validators: Validators.required
        }),
        endTime: new FormControl<Date>(new Date(), {
          nonNullable: true,
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
        state: new FormControl<string>('', {
          nonNullable: false,
          // TODO: validators: []
        }),
        // TODO: Change to string
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
      }, { validators: (form) => this.validateStartBeforeEnd(form as FormGroup<EventForm>) }) as FormGroup;
    }
    
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

    const event = this.data.eventToEdit;

    if (event) {
      this.eventForm.patchValue({
        eventName: event.eventName,
        eventType: event.eventType,
        clientName: event.clientName,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
        streetAddress: event.streetAddress,
        city: event.city,
        state: event.state,
        zipCode: event.zipCode,
        description: event.description,
        isVirtual: event.isVirtual,
      });
    }

    this.loadExistingEvents();
  }

  ngAfterViewInit(): void {
    console.log('Form exists?', this.eventForm);
    console.log('Start Date Control:', this.eventForm.get('startDate'));

    // Listen for changes in dates or times
    const controls = ['startDate', 'startTime', 'endDate', 'endTime'] as const;

    for (const key of controls) {
      const control = this.eventForm.get(key);
      if (control && control.valueChanges) {
        control.valueChanges
          .pipe(distinctUntilChanged(), debounceTime(100))
          .subscribe(() => this.checkForConflictsFromForm());
      } else {
        console.warn(`Control ${key} not found in ngAfterViewInit`);
      }
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private loadExistingEvents(): void {
    this.eventsService.getAllEvents().pipe(take(1)).subscribe({
      next: (events) => {
        // Optionally filter out the one you're editing
        const editingId = this.data.eventToEdit?.id;
        this.existingEvents = events.filter(a => a.id !== editingId);
      },
      error: (err) => {
        console.error('Failed to load appointments', err);
        this.existingEvents = [];
      }
    });
  }

  private validateStartBeforeEnd(form: FormGroup<EventForm>) {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;
    const startTime = form.get('startTime')?.value;
    const endTime = form.get('endTime')?.value;

    if (!startDate || !endDate || !startTime || !endTime) return null;

    const start = mergeDateAndTime(startDate, startTime);
    const end = mergeDateAndTime(endDate, endTime);

    return start > end ? { startAfterEnd: true } : null;
  }

  private async checkForConflictsFromForm() {
      const formValue = this.eventForm.value;

      if (!formValue.startDate || !formValue.startTime || !formValue.eventType || formValue.isVirtual == null) return;
      if (!formValue.endDate || !formValue.endTime || !formValue.eventType || formValue.isVirtual == null) return;

      const start = mergeDateAndTime(formValue.startDate, formValue.startTime);
      const end = mergeDateAndTime(formValue.endDate, formValue.endTime);
      const safeCity = formValue.isVirtual ? "virtual" : "Seattle";

      const hasStartConflict = await this.conflictCheckService.checkForConflicts(
        start,
        formValue.eventType,
        formValue.isVirtual,
        safeCity
      );

      const hasEndConflict = await this.conflictCheckService.checkForConflicts(
        end,
        formValue.eventType,
        formValue.isVirtual,
        safeCity
      );

      if (hasStartConflict) {
        this.hasConflict = hasStartConflict;
      } else if (hasEndConflict) {
        this.hasConflict = hasEndConflict;
      }
    }

  public get form() {
    return this.eventForm;
  }

  onSubmit(): void {
    if (this.eventForm.errors?.['startAfterEnd']) {
      this.errorMessage = 'Start time must be before end time.';
      return;
    }

    if (this.eventForm.valid) {
      const formValues = this.eventForm.value;

      const combinedStart = mergeDateAndTime(formValues.startDate!, formValues.startTime!);
      const combinedEnd = mergeDateAndTime(formValues.endDate!, formValues.endTime!);

      const eventPayload: Event = {
        ...this.data.eventToEdit,
        eventName: formValues.eventName!,
        eventType: formValues.eventType!,
        clientName: formValues.clientName,
        startDate: combinedStart,
        startTime: combinedStart,
        endDate: combinedEnd,
        endTime: combinedEnd,
        streetAddress: formValues.streetAddress,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode,
        description: formValues.description!,
        isVirtual: formValues.isVirtual!
      };

      if (this.data.eventToEdit) {
        this.eventsService.updateEvent(this.data.eventToEdit.id!, eventPayload).subscribe({
          next: (updatedEvent) => {
            this.eventSaved.emit(updatedEvent);
            this.dialogRef.close();
          },
          error: () => {
            this.errorMessage = 'Failed to update event.';
          }
        });
      } else {
        this.eventsService.createEvent(eventPayload).subscribe({
          next: (newEvent) => {
            this.eventSaved.emit(newEvent);
            this.dialogRef.close();
          },
          error: () => {
            this.errorMessage = 'Failed to create event.';
          }
        });
      }
    }
  }
}