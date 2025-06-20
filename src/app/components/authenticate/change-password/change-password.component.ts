import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle
} from '@angular/material/card';
import {
  MatFormField,
  MatHint,
  MatLabel
} from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { User } from 'firebase/auth';

import { FirebaseAuthHelper } from 'src/app/services/authentication/firebase-auth-helpers';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';

interface AccountForm {
  currentPassword: FormControl<string>;
  newEmail: FormControl<string>;
  newPassword: FormControl<string>;
  confirmNewPassword: FormControl<string>;
}

@Component({
  selector: 'app-change-password',
  imports: [
    NgIf,
    MatFormField,
    MatInput,
    MatLabel,
    MatCard,
    MatCardTitle,
    MatCardHeader,
    MatCardContent,
    MatHint,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  user: User | null;

  protected accountForm = new FormGroup<AccountForm>(
    {
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
        validators: [
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/
          )
        ]
      }),
      confirmNewPassword: new FormControl<string>('', {
        nonNullable: true
      })
    },
    {
      validators: [
        requireAtLeastOne('newEmail', 'newPassword'),
        passwordMatchValidator
      ]
    }
  );

  constructor(private authWrapper: AuthWrapperService) {
    this.user = this.authWrapper.getCurrentUser();
  }

  public get form() {
    return this.accountForm;
  }

  async onSubmit(): Promise<void> {
    if (this.accountForm.valid) {
      const currentPassword = this.accountForm.get('currentPassword')?.value;
      const newEmail = this.accountForm.get('newEmail')?.value;
      const newPassword = this.accountForm.get('newPassword')?.value;

      if (newPassword) {
        await this.changePassword(currentPassword!, newPassword);  // ← await this
      } else if (newEmail) {
        await this.changeEmail(currentPassword!, newEmail);        // ← await this
      }
    } else {
      console.log('TESTING: Form is invalid');
    }
  }


  isEmailPasswordUser(): boolean {
    if (this.user) {
      const providerIds = this.user.providerData.map(
        provider => provider.providerId
      );
      return providerIds.includes('password');
    }
    return false;
  }

  async reauthenticateUser(currentPassword: string): Promise<void> {
    if (this.user && this.user.email) {
      await FirebaseAuthHelper.reauthenticateWithPassword(this.user, currentPassword);
    } else {
      throw new Error('No authenticated user found.');
    }
  }

  async changeEmail(currentPassword: string, newEmail: string): Promise<void> {
    await this.reauthenticateUser(currentPassword);
    if (this.user) {
      await FirebaseAuthHelper.verifyBeforeUpdateEmail(this.user, newEmail);
      console.log('TODO: Verification email sent to the new address.');
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.reauthenticateUser(currentPassword);
    if (this.user) {
      await FirebaseAuthHelper.updatePassword(this.user, newPassword);
      console.log('Password updated successfully.');
    }
  }
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('newPassword')?.value;
  const confirm = control.get('confirmNewPassword')?.value;
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