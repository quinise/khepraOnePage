import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePasswordComponent } from './change-password.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { FirebaseAuthHelper } from 'src/app/services/authentication/firebase-auth-helpers';
import * as firebaseAuthModule from 'firebase/auth';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';

const mockUser = {
  email: 'test@example.com',
  providerData: [{ providerId: 'password' }]
} as any;

class MockAuthWrapperService {
  getAuth() {
    return { currentUser: mockUser };
  }

  getCurrentUser() {
    return mockUser;
  }
}

describe('ChangePasswordComponent', () => {
  let component: ChangePasswordComponent;
  let fixture: ComponentFixture<ChangePasswordComponent>;

  beforeEach(async () => {
    spyOn(FirebaseAuthHelper, 'reauthenticateWithPassword').and.returnValue(Promise.resolve({} as firebaseAuthModule.UserCredential));
    spyOn(FirebaseAuthHelper, 'verifyBeforeUpdateEmail').and.returnValue(Promise.resolve());
    spyOn(FirebaseAuthHelper, 'updatePassword').and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [
        ChangePasswordComponent,
        ReactiveFormsModule,
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule
      ],
      providers: [
        { provide: AuthWrapperService, useClass: MockAuthWrapperService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should recognize password-based users', () => {
    expect(component.isEmailPasswordUser()).toBeTrue();
  });

  it('should call updatePassword when changing password', async () => {
    component.form.setValue({
      currentPassword: 'current123!',
      newEmail: null as any,
      newPassword: 'NewPass123!',
      confirmNewPassword: 'NewPass123!',
    });

    await component.onSubmit();
    
    expect(component.form.valid).toBeTrue();
    expect(FirebaseAuthHelper.reauthenticateWithPassword).toHaveBeenCalled();
    expect(FirebaseAuthHelper.updatePassword).toHaveBeenCalled();
    expect(FirebaseAuthHelper.verifyBeforeUpdateEmail).not.toHaveBeenCalled();
  });

  it('should call verifyBeforeUpdateEmail when changing email', async () => {
    component.form.setValue({
      currentPassword: 'current123!',
      newEmail: 'new@example.com',
      newPassword: '',
      confirmNewPassword: '',
    });

    await component.onSubmit();

    expect(FirebaseAuthHelper.reauthenticateWithPassword).toHaveBeenCalled();
    expect(FirebaseAuthHelper.verifyBeforeUpdateEmail).toHaveBeenCalled();
    expect(FirebaseAuthHelper.updatePassword).not.toHaveBeenCalled();
  });
});