import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Router } from '@angular/router';

import { AuthService } from 'src/app/services/authentication/auth.service';
import { UserService } from 'src/app/services/authentication/user.service';
import { AuthenticateComponent } from './authenticate.component';

import { UserCredential } from 'firebase/auth';

let matDialogRefMock: jasmine.SpyObj<MatDialogRef<any>>;

describe('AuthenticateComponent', () => {
  let component: AuthenticateComponent;
  let fixture: ComponentFixture<AuthenticateComponent>;

  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;

  function setup(authStep: 'Login' | 'Sign up') {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['loginWithGoogle', 'signUpWithEmail', 'loginWithEmail', 'sendPasswordResetEmail']);
    userServiceSpy = jasmine.createSpyObj('UserService', ['getUserRole']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [AuthenticateComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialogRef, useValue: matDialogRefMock },
        { provide: MAT_DIALOG_DATA, useValue: { authStep } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthenticateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create login form without confirmPassword control', () => {
    setup('Login');
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('password')).toBeTrue();
    expect(component.form.contains('confirmPassword')).toBeFalse();
  });

  it('should create signup form with confirmPassword control', () => {
    setup('Sign up');
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('password')).toBeTrue();
    expect(component.form.contains('confirmPassword')).toBeTrue();
  });

  it('should submit and call signUpWithEmail and getUserRole on signup', fakeAsync(() => {
    setup('Sign up');

    component.form.setValue({
      email: 'test@example.com',
      password: 'Password123!',
      confirmPassword: 'Password123!',
    });

    const mockUserCredential = {
      user: {
        uid: 'google-user-123',
        email: 'test@example.com',
      },
    } as UserCredential;

    authServiceSpy.signUpWithEmail.and.returnValue(Promise.resolve(mockUserCredential));
    userServiceSpy.getUserRole.and.returnValue(Promise.resolve('admin'));

    component.onSubmit();
    tick();
    tick();

    expect(authServiceSpy.signUpWithEmail).toHaveBeenCalledWith('test@example.com', 'Password123!');
    expect(userServiceSpy.getUserRole).toHaveBeenCalledWith('google-user-123');
    expect(matDialogRefMock.close).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin-panel']);
  }));


  it('should submit and call loginWithEmail and close dialog on login', fakeAsync(() => {
    setup('Login');

    component.form.setValue({
      email: 'login@example.com',
      password: 'Password123!',
    });

    authServiceSpy.loginWithEmail.and.returnValue(Promise.resolve({ user: { uid: 'loginUid' } } as any));

    component.onSubmit();
    tick();

    expect(authServiceSpy.loginWithEmail).toHaveBeenCalledWith('login@example.com', 'Password123!');
    expect(matDialogRefMock.close).toHaveBeenCalled();
  }));

  it('should call loginWithGoogle and close the dialog', fakeAsync(() => {
    setup('Login');

    const mockUserCredential = {
          user: {
            uid: 'google-user-123',
            email: 'test@example.com',
          },
        } as UserCredential;

    authServiceSpy.loginWithGoogle.and.returnValue(Promise.resolve(mockUserCredential));

    component.googleLogin();
    tick();
    fixture.detectChanges();
    tick();

    expect(authServiceSpy.loginWithGoogle).toHaveBeenCalled();
    expect(matDialogRefMock.close).toHaveBeenCalled();
  }));
});
