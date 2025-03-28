import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { BookService } from 'src/app/services/book.service';

interface ReadingForm {
  id: FormControl<string>;
  name: FormControl<string>;
  email: FormControl<string>;
  phone_number: FormControl<number | null>;
  date: FormControl<Date | null>;
  time: FormControl<Date | null>;
  isVirtual: FormControl<boolean>;
}
@Component({
  selector: 'app-reading-form',
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
  templateUrl: './reading-form.component.html',
  styleUrl: './reading-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingFormComponent {
  _todaysDate = new Date();
  minDate = new Date();
  maxDate = new Date();

  constructor (private _matDialog:MatDialog, @Inject(MAT_DIALOG_DATA) public data: {serviceType: string}, public bookService: BookService) {
    this.minDate.setDate(this._todaysDate.getDate() + 2);
    this.maxDate.setMonth(this._todaysDate.getMonth() + 2);
  }

  protected readingForm = new FormGroup<ReadingForm>({
    id: new FormControl<string>('', {
      nonNullable: true,
    }),
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
    this.bookService.setServiceDetails(this.data.serviceType, form.value.name, form.value.email, form.value.phone_number, combinedDateTime, form.value.time, form.value.isVirtual);
    console.log(`TESTING: Form Values in Form ${form.value}`);
  }
}
