import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIf } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AuthService } from 'src/app/services/auth.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';

interface AuthForm {
  password: FormControl<string>;
  email: FormControl<string>;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    MatInputModule,
    FormsModule,
    NgIf,
    MatIconModule,
    MatFormField,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDialogModule,
  ],
  templateUrl: './authenticate.component.html',
  styleUrl: './authenticate.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class AuthenticateComponent {
  errorMessage: string;
  successMessage: string;

  constructor(private _matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {authStep: string}, public authService: AuthService) {
    this.errorMessage = "";
    this.successMessage = "";
  }

  protected authForm = new FormGroup<AuthForm>({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      // ToDo: Password RegEx
      validators: [Validators.required]
    }),
  });

  onSubmit(): void {
    if (this.authForm.invalid) return;

    const { email, password } = this.authForm.value;

    this.authService.signUpWithEmail(email!, password!)
      .then(res => {
        this.successMessage = 'Account created successfully!';
        this.errorMessage = '';
      })
      .catch(err => {
        this.errorMessage = err.message;
        this.successMessage = '';
      });
  }
}
