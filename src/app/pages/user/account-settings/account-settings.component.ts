import { Component } from '@angular/core';
import { take } from 'rxjs';
import { ChangePasswordComponent } from 'src/app/components/authenticate/change-password/change-password.component';
import { DeleteAccountComponent } from 'src/app/components/authenticate/delete-account/delete-account.component';
import { AuthService } from 'src/app/services/authentication/auth.service';

@Component({
  selector: 'app-account-settings',
  imports: [DeleteAccountComponent, ChangePasswordComponent],
  templateUrl: './account-settings.component.html',
  styleUrl: './account-settings.component.css'
})
export class AccountSettingsComponent {
isUser: boolean = false;

  constructor(private authService: AuthService) {}
  
    ngOnInit(): void {
      this.authService.user$.pipe(take(1)).subscribe(user => {
        this.isUser = user?.role === 'user';
      });
    }
}
