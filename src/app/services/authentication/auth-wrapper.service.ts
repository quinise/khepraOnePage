// src/app/services/authentication/auth-wrapper.service.ts
import { Inject, Injectable } from '@angular/core';
import {
  Auth,
  AuthCredential,
  AuthProvider,
  User,
} from 'firebase/auth';
import { FirebaseAuthHelper } from './firebase-auth-helpers';

export const GET_AUTH_TOKEN = 'GET_AUTH_TOKEN';

@Injectable({
  providedIn: 'root',
})
export class AuthWrapperService {
  constructor(@Inject(GET_AUTH_TOKEN) private getAuthFn: () => Auth) {}

  getAuth(): Auth {
    return this.getAuthFn();
  }

  getCurrentUser(): User | null {
    return this.getAuthFn().currentUser;
  }

  async reauthenticateWithPopup(provider: AuthProvider): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user is currently signed in.');
    await FirebaseAuthHelper.reauthenticateWithPopup(user, provider);
  }

  async reauthenticateWithCredential(credential: AuthCredential): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('No user is currently signed in.');
    await FirebaseAuthHelper.reauthenticateWithCredential(user, credential);
  }
}