import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import * as firebaseAuthModule from 'firebase/auth';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { FirebaseAuthHelper } from 'src/app/services/authentication/firebase-auth-helpers';
import { DeleteAccountComponent } from './delete-account.component';

describe('DeleteAccountComponent', () => {
  let component: DeleteAccountComponent;
  let fixture: ComponentFixture<DeleteAccountComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let mockAuthWrapperService: jasmine.SpyObj<AuthWrapperService>;

  const mockGetAuth = () =>
    ({
      currentUser: {
        uid: 'mock-user',
        providerData: [{ providerId: 'google.com' }],
      },
    } as unknown as firebaseAuthModule.Auth);


  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['logout']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    mockAuthWrapperService = jasmine.createSpyObj('AuthWrapperService', ['getAuth']);

    await TestBed.configureTestingModule({
      imports: [DeleteAccountComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthWrapperService, useValue: mockAuthWrapperService },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAccountComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reauthenticate with Google and delete account', fakeAsync(() => {
    const mockGoogleUser = {
      uid: 'google-uid',
      providerData: [{ providerId: 'google.com' }],
    } as unknown as firebaseAuthModule.User;

    mockAuthWrapperService.getAuth.and.returnValue({
      currentUser: mockGoogleUser,
    } as any);

    spyOn(FirebaseAuthHelper, 'reauthenticateWithPopup').and.returnValue(Promise.resolve({} as firebaseAuthModule.UserCredential));

    spyOn(console, 'log');

    spyOn(window, 'confirm').and.returnValue(true);

    component.confirmDeleteAccount();
    tick();

    expect(FirebaseAuthHelper.reauthenticateWithPopup).toHaveBeenCalledWith(mockGoogleUser, jasmine.any(firebaseAuthModule.GoogleAuthProvider));
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  }));

  it('should reauthenticate with email/password and delete account', fakeAsync(() => {
    const mockPasswordUser = {
      uid: 'password-uid',
      providerData: [{ providerId: 'password' }],
    } as unknown as firebaseAuthModule.User;

    mockAuthWrapperService.getAuth.and.returnValue({
      currentUser: mockPasswordUser,
    } as any);

    spyOn(FirebaseAuthHelper, 'reauthenticateWithCredential').and.returnValue(Promise.resolve({} as firebaseAuthModule.UserCredential));

    spyOn(FirebaseAuthHelper, 'deleteUser').and.returnValue(Promise.resolve());

    spyOn(window, 'prompt').and.callFake((msg?: string) => {
      if (msg?.includes('email')) return 'test@example.com';
      if (msg?.includes('password')) return 'password123';
      return '';
    });

    spyOn(window, 'alert');

    spyOn(console, 'log');

    spyOn(window, 'confirm').and.returnValue(true);

    component.confirmDeleteAccount();
    tick();

    expect(FirebaseAuthHelper.reauthenticateWithCredential).toHaveBeenCalled();
    expect(FirebaseAuthHelper.deleteUser).toHaveBeenCalledWith(mockPasswordUser);
    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['']);
  }));

  it('should alert and not proceed if email or password prompt is cancelled', fakeAsync(() => {
    const mockPasswordUser = {
      uid: 'password-uid',
      providerData: [{ providerId: 'password' }],
    } as unknown as firebaseAuthModule.User;

    mockAuthWrapperService.getAuth.and.returnValue({
      currentUser: mockPasswordUser,
    } as any);

    spyOn(window, 'prompt').and.returnValue(null); // simulate cancel
    spyOn(window, 'alert');
    spyOn(window, 'confirm').and.returnValue(true);

    component.confirmDeleteAccount();
    tick();

    expect(window.alert).toHaveBeenCalledWith('Email and password are required for re-authentication.');
    expect(authServiceSpy.logout).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  }));
});