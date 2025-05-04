import { Component } from '@angular/core';
import { take } from 'rxjs';
import { DeleteAccountComponent } from 'src/app/components/authenticate/delete-account/delete-account.component';
import { AuthService } from 'src/app/services/authentication/auth.service';
@Component({
  selector: 'app-dashboard',
  imports: [DeleteAccountComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  isUser: boolean = false;

  constructor(private authService: AuthService) {}
  
    ngOnInit(): void {
      this.authService.user$.pipe(take(1)).subscribe(user => {
        this.isUser = user?.role === 'user';
      });
    }
}
