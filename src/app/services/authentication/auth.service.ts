import { Inject, Injectable } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  UserCredential,
  authState
} from '@angular/fire/auth';
import { Firestore, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AppUser } from '../../interfaces/appUser';
import { FirebaseAuthHelper } from './firebase-auth-helpers';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth;
  user$: Observable<AppUser | null>;

  constructor(private firestore: Firestore, @Inject('auth') auth: Auth) {
    this.auth = auth;

    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of(null);
        const ref = FirebaseAuthHelper.doc(this.firestore, 'users', user.uid);
        return docData(ref) as Observable<AppUser>;
      })
    );
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    const userCredential = await FirebaseAuthHelper.createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;

    const userRef = FirebaseAuthHelper.doc(this.firestore, 'users', user.uid);
    await FirebaseAuthHelper.setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      role: 'user',
      createdAt: new Date(),
    });

    return userCredential;
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return FirebaseAuthHelper.signInWithEmailAndPassword(this.auth, email, password);
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const result = await FirebaseAuthHelper.signInWithPopup(this.auth, provider);
    const user = result.user;

    const userRef = FirebaseAuthHelper.doc(this.firestore, 'users', user.uid);
    const docSnap = await FirebaseAuthHelper.getDoc(userRef);

    if (!docSnap.exists()) {
      await FirebaseAuthHelper.setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        role: 'user',
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date()
      }, { merge: true });
    }

    return result;
  }

  logout(): Promise<void> {
    return FirebaseAuthHelper.signOut(this.auth);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return FirebaseAuthHelper.sendPasswordResetEmail(this.auth, email);
  }

  getAppUser(): Promise<AppUser | null> {
    return new Promise((resolve) => {
      this.user$.subscribe(user => resolve(user));
    });
  }
}