import { NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators, NonNullableFormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { PasswordResetComponent } from '../password-reset/password-reset.component'; // adjust path as needed

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

  protected authForm: FormGroup = new FormGroup({});

  constructor(private router: Router, private _matDialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data: {authStep: string}, private authService: AuthService, private userService: UserService) {
    this.errorMessage = "";
    this.successMessage = "";

    this.authForm.addControl(
      'email',
      new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      })
    );
  
    this.authForm.addControl(
      'password',
      new FormControl<string>('', {
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
        'confirmPassword',
        new FormControl<string>('', {
          nonNullable: true,
          validators: [Validators.required],
        })
      );
      this.authForm.setValidators(passwordMatchValidator);
    }
  }

  googleLogin() {
    this.authService.loginWithGoogle().then(res => {
    }).catch(console.error);
  }

  public onSubmit(): void {
    const { email, password } = this.authForm.value;

    if (this.data.authStep === "Sign up") {
      this.authService.signUpWithEmail(email!, password!)
      .then(async res => {
        this.successMessage = 'Account created successfully!';
        this.errorMessage = '';

        const role = await this.userService.getUserRole(res.user.uid);

        if (role === 'admin') {
          this.router.navigate(['/admin-panel']);
        } else {
          this.router.navigate(['/']);
        }

        this._matDialog.closeAll();
      })
      .catch(err => {
        this.errorMessage = err.message;
        this.successMessage = '';
      });
    } else if (this.data.authStep === "Login") {
      this.authService.loginWithEmail(email!, password!)
      .then(res => {
        console.log("✅ Logged in with Email and Password:", res.user);
        this.successMessage = 'Login successful!';
        this.errorMessage = '';
        this._matDialog.closeAll();
      })
      .catch(err => {
        console.error("🚨 Login error:", err);
        this.successMessage = '';
  
        // Handle specific error codes
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
    const dialogRef = this._matDialog.open(PasswordResetComponent);
  
    dialogRef.afterClosed().subscribe(email => {
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