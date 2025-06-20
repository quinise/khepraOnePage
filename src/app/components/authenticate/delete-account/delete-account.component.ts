import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {
  EmailAuthProvider,
  GoogleAuthProvider,
} from 'firebase/auth';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { FirebaseAuthHelper } from 'src/app/services/authentication/firebase-auth-helpers';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css'],
})
export class DeleteAccountComponent {
  constructor(public authService: AuthService, public authWrapper: AuthWrapperService, private router: Router) {}

  async deleteAccount(): Promise<void> {
    const auth = this.authWrapper.getAuth();
    const provider = new GoogleAuthProvider();
    const user = auth.currentUser;

    if (user) {
      const providerIds = user.providerData.map((provider) => provider.providerId);

      if (providerIds.includes('google.com')) {
        FirebaseAuthHelper.reauthenticateWithPopup(user, provider)
          .then(() => {
            this.authService.logout();
            this.router.navigate(['']);
          })
          .catch((error) => {
            console.log('Error re-authenticating with Google:', error);
          });

      } else if (providerIds.includes('password')) {
        const email = prompt('Please enter your email:');
        const password = prompt('Please enter your password:');

        if (!email || !password) {
          alert('Email and password are required for re-authentication.');
          return;
        }

        const credential = EmailAuthProvider.credential(email, password);
        try {
          await FirebaseAuthHelper.reauthenticateWithCredential(user, credential);
          await FirebaseAuthHelper.deleteUser(user);

          this.authService.logout();
          this.router.navigate(['']);
        } catch (error: any) {
          // error handling...
        }
      } else {
        console.log('User signed in with another provider:', providerIds);
      }
    } else {
      console.log('No user is currently signed in.');
    }
  }

  confirmDeleteAccount(): void {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (confirmed) {
      this.deleteAccount();
    }
  }
}