import { TestBed } from '@angular/core/testing';
import {
  Auth,
  AuthCredential,
  AuthProvider,
  User,
} from 'firebase/auth';
import { AuthWrapperService, GET_AUTH_TOKEN } from './auth-wrapper.service';
import { FirebaseAuthHelper } from './firebase-auth-helpers';

describe('AuthWrapperService', () => {
  let service: AuthWrapperService;
  let mockAuth: Auth;
  let mockUser: User;

  beforeEach(() => {
    mockUser = {
      uid: 'test-user',
      email: 'test@example.com',
      displayName: 'Test User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      phoneNumber: null,
      photoURL: null,
      providerData: [],
      providerId: 'Google',
      refreshToken: '',
      tenantId: null,
      delete: jasmine.createSpy(),
      getIdToken: jasmine.createSpy(),
      getIdTokenResult: jasmine.createSpy(),
      reload: jasmine.createSpy(),
      toJSON: jasmine.createSpy(),
    };

    mockAuth = {
      currentUser: mockUser,
    } as unknown as Auth;

    TestBed.configureTestingModule({
      providers: [
        AuthWrapperService,
        { provide: GET_AUTH_TOKEN, useValue: () => mockAuth },
      ],
    });

    service = TestBed.inject(AuthWrapperService);
  });

  it('should call reauthenticateWithPopup with the current user and provider', async () => {
    const provider = {} as AuthProvider;
    const spy = spyOn(FirebaseAuthHelper, 'reauthenticateWithPopup').and.returnValue(Promise.resolve({} as any));

    await service.reauthenticateWithPopup(provider);

    expect(spy).toHaveBeenCalledWith(mockUser, provider);
  });

  it('should call reauthenticateWithCredential with the current user and credential', async () => {
    const credential = {} as AuthCredential;
    const spy = spyOn(FirebaseAuthHelper, 'reauthenticateWithCredential').and.returnValue(Promise.resolve({} as any));

    await service.reauthenticateWithCredential(credential);

    expect(spy).toHaveBeenCalledWith(mockUser, credential);
  });

  it('should throw error if no user when calling reauthenticateWithPopup', async () => {
    Object.defineProperty(mockAuth, 'currentUser', {
      value: null,
    });

    await expectAsync(service.reauthenticateWithPopup({} as AuthProvider))
      .toBeRejectedWithError('No user is currently signed in.');
  });

  it('should throw error if no user when calling reauthenticateWithCredential', async () => {
    Object.defineProperty(mockAuth, 'currentUser', {
      value: null,
    });

    await expectAsync(service.reauthenticateWithCredential({} as AuthCredential))
      .toBeRejectedWithError('No user is currently signed in.');
  });
});