import { Injectable, inject } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AppUser } from '../interfaces/appUser';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth: Auth;
  user$: Observable<AppUser | null>;

  constructor(private firestore: Firestore, auth: Auth) {
    this.auth = auth;

    this.user$ = authState(this.auth).pipe(
      switchMap(user => {
        if (!user) return of(null);
        const ref = doc(this.firestore, 'users', user.uid);
        return docData(ref) as Observable<AppUser>;
      })
    );
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
    const user = userCredential.user;
    // 👇 Save user to Firestore
    await setDoc(doc(this.firestore, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: 'user',
      createdAt: new Date(),
    });
    return await userCredential;
  }

  async loginWithEmail(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(this.auth, email, password)
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const user = result.user;

    // Check if user already exists in Firestore
    const userRef = doc(this.firestore, 'users', user.uid);
    const docSnap = await getDoc(userRef);

    if (!docSnap.exists()) {
      // Save new user to Firestore
      await setDoc(userRef, {
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
    return signOut(this.auth);
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return sendPasswordResetEmail(this.auth, email);
  }
}