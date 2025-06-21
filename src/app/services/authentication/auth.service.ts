import { Injectable } from '@angular/core';
import { Firestore, collection, docData, getDocs, query, where } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AppUser } from '../../interfaces/appUser';
import { FirebaseAuthHelper } from './firebase-auth-helpers';
import { AuthWrapperService } from './auth-wrapper.service';
import { GoogleAuthProvider, UserCredential, authState } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user$: Observable<AppUser | null>;

  constructor(
    private firestore: Firestore,
    private authWrapper: AuthWrapperService
  ) {
    this.user$ = authState(this.authWrapper.getAuth()).pipe(
      switchMap(user => {
        if (!user) return of(null);
        const ref = FirebaseAuthHelper.doc(this.firestore, 'users', user.uid);
        return docData(ref) as Observable<AppUser>;
      })
    );
  }

  async signUpWithEmail(email: string, password: string): Promise<UserCredential> {
    const auth = this.authWrapper.getAuth();
    const userCredential = await FirebaseAuthHelper.createUserWithEmailAndPassword(auth, email, password);
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
    return FirebaseAuthHelper.signInWithEmailAndPassword(this.authWrapper.getAuth(), email, password);
  }

  async loginWithGoogle(): Promise<UserCredential> {
    const auth = this.authWrapper.getAuth();
    const provider = new GoogleAuthProvider();
    const result = await FirebaseAuthHelper.signInWithPopup(auth, provider);
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
    return FirebaseAuthHelper.signOut(this.authWrapper.getAuth());
  }

  sendPasswordResetEmail(email: string): Promise<void> {
    return FirebaseAuthHelper.sendPasswordResetEmail(this.authWrapper.getAuth(), email);
  }

  getAppUser(): Promise<AppUser | null> {
    return new Promise((resolve) => {
      this.user$.subscribe(user => resolve(user));
    });
  }

  // Modify the checkEmailExists method to ensure it does not return admin emails
checkEmailExists(email: string): Observable<boolean> {
  const usersRef = collection(this.firestore, 'users');
  const q = query(usersRef, where('email', '==', email));

  return new Observable<boolean>((observer) => {
    getDocs(q)
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          observer.next(false); // Email doesn't exist
        } else {
          // Check if the email belongs to an admin user
          const user = querySnapshot.docs[0].data(); // Assuming only one user with the email
          const isAdmin = user['isAdmin']; // Assume `isAdmin` is a boolean field in user data

          if (isAdmin) {
            observer.next(false);
          } else {
            observer.next(true);
          }
        }
        observer.complete();
      })
      .catch((error) => {
        console.error('Error checking email existence:', error);
        observer.error(false); // Assume email doesn't exist in case of error
      });
  });
}

}