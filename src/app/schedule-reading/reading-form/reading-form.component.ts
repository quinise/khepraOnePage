import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Reading } from '../reading';
interface ReadingForm {
  id: FormControl<string>;
  name: FormControl<string>;
  email: FormControl<string>;
  phone_number: FormControl<string>;
  date: FormControl<string>;
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
    ReactiveFormsModule
    ],
  templateUrl: './reading-form.component.html',
  styleUrl: './reading-form.component.css'
})
export class ReadingFormComponent {
  reading:Reading= {
    id:0,
    name:'',
    email:'',
    phone_number:'',
    date:'',
    isVirtual:false
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
    phone_number: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    date: new FormControl<string>('', {
      nonNullable: true,
      validators: Validators.required
    }),
    isVirtual: new FormControl<boolean>(false, {
      nonNullable: true,
    }),
  })

  onSubmit(): void {
    this.readingForm.value.name = this.reading.name,
    this.readingForm.value.email = this.reading.email,
    this.readingForm.value.phone_number = this.reading.phone_number,
    this.readingForm.value.date = this.reading.date,
    this.readingForm.value.isVirtual = this.reading.isVirtual
  }
}
