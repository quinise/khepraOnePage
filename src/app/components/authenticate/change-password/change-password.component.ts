import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardHeader, MatCardTitle } from '@angular/material/card';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { getAuth, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, verifyBeforeUpdateEmail, User } from 'firebase/auth';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { NgIf } from '@angular/common';

interface AccountForm {
  currentPassword: FormControl<string>;
  newEmail: FormControl<string>;
  newPassword: FormControl<string>;
  confirmNewPassword: FormControl<string>;
}

@Component({
  selector: 'app-change-password',
  imports: [NgIf, MatFormField, MatInput, MatLabel, MatCard, MatCardTitle, MatCardHeader, MatCardContent, MatHint, FormsModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  auth = getAuth();
  user: User | null = this.auth.currentUser;

  protected accountForm = new FormGroup<AccountForm>({
    currentPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required]
    }),
    newEmail: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.email]
    }),
    newPassword: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/)]
    }),
    confirmNewPassword: new FormControl<string>('', {
      nonNullable: true
    }),
  }, {
    validators: [requireAtLeastOne('newEmail', 'newPassword'), passwordMatchValidator]
  });

  constructor() {
    this.accountForm.setValidators(passwordMatchValidator);
  }

  onSubmit(): void {
    if (this.accountForm.valid) {
      const currentPassword = this.accountForm.get('currentPassword')?.value;
      const newEmail = this.accountForm.get('newEmail')?.value;
      const newPassword = this.accountForm.get('newPassword')?.value;
  
      if (newPassword) {
        this.changePassword(currentPassword!, newPassword);
      } else if (newEmail) {
        this.changeEmail(currentPassword!, newEmail);
      }
    } else {
      console.log('Form is invalid');
    }
  }
  

  // Method to check if the user signed in with Email/Password
  isEmailPasswordUser(): boolean {
    if (this.user) {
      const providerIds = this.user.providerData.map((provider) => provider.providerId);
      return providerIds.includes('password');
    }
    return false;
  }

  async reauthenticateUser(currentPassword: string): Promise<void> {
    if (this.user && this.user.email) {
      const credential = EmailAuthProvider.credential(this.user.email, currentPassword);
      await reauthenticateWithCredential(this.user, credential);
    } else {
      throw new Error('No authenticated user found.');
    }
  }

  async changeEmail(currentPassword: string, newEmail: string): Promise<void> {
    await this.reauthenticateUser(currentPassword);
    if (this.user) {
      await verifyBeforeUpdateEmail(this.user, newEmail);
      console.log('Verification email sent to the new address. Please verify to complete the update.');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.reauthenticateUser(currentPassword);
    if (this.user) {
      await updatePassword(this.user, newPassword);
      console.log('Password updated successfully.');
    }
  }
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};

export function requireAtLeastOne(...controlNames: string[]): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const hasAtLeastOne = controlNames.some(controlName => {
      const control = formGroup.get(controlName);
      return control && control.value && control.value.trim() !== '';
    });

    return hasAtLeastOne ? null : { requireAtLeastOne: true };
  };
}