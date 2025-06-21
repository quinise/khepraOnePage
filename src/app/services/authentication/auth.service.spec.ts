import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { FirebaseAuthHelper } from './firebase-auth-helpers';
import { Firestore } from '@angular/fire/firestore';
import { Auth, GoogleAuthProvider, UserCredential, User, UserMetadata } from 'firebase/auth';
import { of } from 'rxjs';
import { AppUser } from 'src/app/interfaces/appUser';
import { AuthWrapperService, GET_AUTH_TOKEN } from './auth-wrapper.service';

const mockUser: User = {
  uid: 'test123',
  email: 'test@example.com',
  displayName: 'Test User',
  emailVerified: true,
  isAnonymous: false,
  providerData: [],
  phoneNumber: null,
  photoURL: null,
  metadata: {} as UserMetadata,
  tenantId: null,
  providerId: 'firebase',
  reload: jasmine.createSpy(),
  delete: jasmine.createSpy(),
  refreshToken: '',
  getIdToken: jasmine.createSpy().and.returnValue(Promise.resolve('fake-token')),
  getIdTokenResult: jasmine.createSpy().and.returnValue(Promise.resolve({ token: 'fake-token' } as any)),
  toJSON: () => ({})
};

describe('AuthService', () => {
  let service: AuthService;
  let mockFirestore: jasmine.SpyObj<Firestore>;
  let mockAuth: jasmine.SpyObj<Auth>;

  beforeEach(() => {
    mockAuth = jasmine.createSpyObj<Auth>('Auth', ['signOut'], {
      currentUser: mockUser
    });

    mockFirestore = {} as jasmine.SpyObj<Firestore>;

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Firestore, useValue: mockFirestore },
        { provide: GET_AUTH_TOKEN, useValue: () => mockAuth }, // 👈 Provide GET_AUTH_TOKEN
        {
          provide: AuthWrapperService,
          useFactory: (getAuthFn: () => Auth) => new AuthWrapperService(getAuthFn),
          deps: [GET_AUTH_TOKEN]
        }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#signUpWithEmail', () => {
    it('should create a user and store them in Firestore', async () => {
      const mockUser = {
        uid: 'abc123',
        email: 'test@example.com',
        displayName: 'Test User'
      } as User;

      const mockCredential = { user: mockUser } as UserCredential;

      spyOn(FirebaseAuthHelper, 'createUserWithEmailAndPassword')
        .and.returnValue(Promise.resolve(mockCredential));
      spyOn(FirebaseAuthHelper, 'doc').and.returnValue({} as any);
      const setDocSpy = spyOn(FirebaseAuthHelper, 'setDoc').and.returnValue(Promise.resolve());

      await service.signUpWithEmail('test@example.com', 'password123');

      expect(FirebaseAuthHelper.createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'test@example.com', 'password123');
      expect(setDocSpy).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
        uid: 'abc123',
        email: 'test@example.com',
        role: 'user'
      }));
    });
  });

  describe('#loginWithEmail', () => {
    it('should sign in with email and password', async () => {
      const mockCredential = { user: {} as User } as UserCredential;

      spyOn(FirebaseAuthHelper, 'signInWithEmailAndPassword')
        .and.returnValue(Promise.resolve(mockCredential));

      const result = await service.loginWithEmail('user@example.com', 'securepassword');

      expect(FirebaseAuthHelper.signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuth, 'user@example.com', 'securepassword');
      expect(result).toBe(mockCredential);
    });
  });

  describe('#loginWithGoogle', () => {
    it('should sign in with Google and store new user in Firestore if not exists', async () => {
      const mockUser = {
        uid: 'google123',
        email: 'google@example.com',
        displayName: 'Google User',
        photoURL: 'https://photo.url'
      } as User;

      const mockCredential = { user: mockUser } as UserCredential;

      spyOn(FirebaseAuthHelper, 'signInWithPopup').and.returnValue(Promise.resolve(mockCredential));
      spyOn(FirebaseAuthHelper, 'doc').and.returnValue({} as any);
      spyOn(FirebaseAuthHelper, 'getDoc').and.returnValue(Promise.resolve({ exists: () => false } as any));
      const setDocSpy = spyOn(FirebaseAuthHelper, 'setDoc').and.returnValue(Promise.resolve());

      const result = await service.loginWithGoogle();

      expect(FirebaseAuthHelper.signInWithPopup).toHaveBeenCalledWith(mockAuth, jasmine.any(GoogleAuthProvider));
      expect(FirebaseAuthHelper.getDoc).toHaveBeenCalled();
      expect(setDocSpy).toHaveBeenCalledWith(jasmine.anything(), jasmine.objectContaining({
        uid: 'google123',
        email: 'google@example.com',
        displayName: 'Google User',
        photoURL: 'https://photo.url'
      }), { merge: true });
      expect(result).toBe(mockCredential);
    });
  });

  describe('#logout', () => {
    it('should sign out the current user', async () => {
      const signOutSpy = spyOn(FirebaseAuthHelper, 'signOut').and.returnValue(Promise.resolve());

      await service.logout();

      expect(signOutSpy).toHaveBeenCalledWith(mockAuth);
    });
  });

  describe('#sendPasswordResetEmail', () => {
    it('should send a password reset email', async () => {
      const resetSpy = spyOn(FirebaseAuthHelper, 'sendPasswordResetEmail').and.returnValue(Promise.resolve());

      await service.sendPasswordResetEmail('reset@example.com');

      expect(resetSpy).toHaveBeenCalledWith(mockAuth, 'reset@example.com');
    });
  });

  describe('#getAppUser', () => {
    it('should resolve with the current user emitted by user$', async () => {
      const mockAppUser = {
        uid: 'user123',
        email: 'user@example.com',
        displayName: 'Mock User'
      } as AppUser;

      (service as any).user$ = of(mockAppUser);

      const result = await service.getAppUser();

      expect(result).toEqual(mockAppUser);
    });

    it('should resolve with null if user$ emits null', async () => {
      (service as any).user$ = of(null);

      const result = await service.getAppUser();

      expect(result).toBeNull();
    });
  });
});
