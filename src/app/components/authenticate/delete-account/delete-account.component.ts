import { Component } from '@angular/core';
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from 'firebase/auth';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete-account',
  templateUrl: './delete-account.component.html',
  styleUrls: ['./delete-account.component.css'],
})
export class DeleteAccountComponent {
  constructor(public authService: AuthService, private router: Router) {}

  async deleteAccount(): Promise<void> {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    const user = auth.currentUser;

    if (user) {
      const providerIds = user.providerData.map((provider) => provider.providerId);
    
      if (providerIds.includes('google.com')) {

        reauthenticateWithPopup(auth.currentUser, provider)
          .then(() => {
            this.authService.logout();
            this.router.navigate(['']);
          })
          .catch((error) => {
            console.log('TESTING: Error re-authenticating with Google:', error);
          });
      } else if (providerIds.includes('password')) {
        try {
          // TODO: Create a form to get the email and password from the user
          const email = prompt('Please enter your email:');
          const password = prompt('Please enter your password:');
    
          if (!email || !password) {
            alert('Email and password are required for re-authentication.');
            return;
          }
    
          // Create credentials using the provided email and password
          const credential = EmailAuthProvider.credential(email, password);
    
          // Re-authenticate the user
          await reauthenticateWithCredential(user, credential);
    
          // Delete the user account
          await deleteUser(user);
    
          this.authService.logout();
          this.router.navigate(['']);
        } catch (error: any) {
          if (error.code === 'auth/wrong-password') {
            alert('Incorrect password. Please try again.');
          } else if (error.code === 'auth/user-mismatch') {
            alert('The provided credentials do not match the current user.');
          } else if (error.code === 'auth/too-many-requests') {
            alert('Too many attempts. Please try again later.');
          } else {
            alert('An error occurred during account deletion. Please try again.');
          }
        }
      } else {
        console.log('TESTING: User signed in with another provider:', providerIds);
      }
    } else {
      console.log('TESTING: No user is currently signed in.');
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