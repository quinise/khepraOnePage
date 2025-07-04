import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-password-reset',
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatDialogModule],
  templateUrl: './password-reset.component.html',
  styleUrl: './password-reset.component.css'
})
export class PasswordResetComponent {
  emailControl = new FormControl('', [Validators.required, Validators.email]);

  constructor(public dialogRef: MatDialogRef<PasswordResetComponent>) {}

  onSubmit(): void {
    if (this.emailControl.invalid) return;
    this.dialogRef.close(this.emailControl.value); // send email back to parent
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
