import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { UserService } from 'src/app/services/authentication/user.service';
import { PasswordResetComponent } from './password-reset/password-reset.component';

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

  submitted = false;

  protected authForm: FormGroup = new FormGroup({});

  constructor(
    private router: Router,
    private dialogRef: MatDialogRef<AuthenticateComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { authStep: string },
    private authService: AuthService,
    private userService: UserService
  ) {
    this.errorMessage = "";
    this.successMessage = "";

    this.authForm.addControl(
      'email', new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      })
    );

    this.authForm.addControl(
      'password', new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/
          ),
        ],
      })
    );

    if (this.data.authStep === "Sign up") {
      this.authForm.addControl(
        'confirmPassword', new FormControl<string>('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
      this.authForm.setValidators(passwordMatchValidator);
    }
  }

  showError(ctrlName: string): boolean {
    const c = this.authForm.get(ctrlName);
    return !!c && c.invalid && (c.touched || c.dirty || this.submitted);
  }


  googleLogin() {
    this.submitted = false;

    this.authService.loginWithGoogle()
      .then(res => {
        this.dialogRef.close();
      })
      .catch(err => {
        console.error('[googleLogin] loginWithGoogle rejected:', err);
      });
  }

  public get form() {
    return this.authForm;
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.authForm.value;

    if (this.data.authStep === "Sign up") {
      this.authService.signUpWithEmail(email!, password!)
        .then(async res => {
          this.successMessage = 'Account created successfully!';
          this.errorMessage = '';

          this.dialogRef.close();

          const role = await this.userService.getUserRole(res.user.uid);

          if (role === 'admin') {
            this.router.navigate(['/admin-panel']);
          } else {
            this.router.navigate(['/']);
          }
        })
        .catch(err => {
          this.errorMessage = err.message;
          this.successMessage = '';
        });
    } else if (this.data.authStep === "Login") {
      this.authService.loginWithEmail(email!, password!)
        .then(res => {
          this.successMessage = 'Login successful!';
          this.errorMessage = '';
          this.dialogRef.close();
        })
        .catch(err => {
          this.successMessage = '';

          switch (err.code) {
            case 'auth/user-not-found':
              this.errorMessage = 'No account found with that email.';
              break;
            case 'auth/wrong-password':
              this.errorMessage = 'Incorrect password.';
              break;
            case 'auth/invalid-email':
              this.errorMessage = 'Please enter a valid email address.';
              break;
            case 'auth/too-many-requests':
              this.errorMessage = 'Too many failed login attempts. Try again later.';
              break;
            default:
              this.errorMessage = 'Login failed. Please try again.';
              break;
          }
        });
    }
  }

  resetPassword(): void {
    const dialogRef = this.dialogRef;

    const passwordDialog = dialogRef as unknown as { open: (component: any) => { afterClosed: () => any } };
    const result = passwordDialog.open(PasswordResetComponent);

    result.afterClosed().subscribe((email: string | undefined) => {
      if (email) {
        this.authService.sendPasswordResetEmail(email)
          .then(() => {
            this.successMessage = 'Password reset email sent!';
            this.errorMessage = '';
          })
          .catch(err => {
            this.errorMessage = err.message;
            this.successMessage = '';
          });
      }
    });
  }
}

export const passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return password === confirm ? null : { passwordMismatch: true };
};