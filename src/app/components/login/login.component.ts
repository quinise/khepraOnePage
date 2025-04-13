import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService) {}

  loginEmail() {
    this.auth.loginWithEmail(this.email, this.password).then(res => {
      console.log('Logged in with email:', res.user);
    }).catch(console.error);
  }

  googleLogin() {
    this.auth.loginWithGoogle().then(res => {
      console.log('Logged in with Google:', res.user);
    }).catch(console.error);
  }
}
