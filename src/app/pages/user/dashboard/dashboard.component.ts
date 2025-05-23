import { AsyncPipe, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser } from 'src/app/interfaces/appUser';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AppointmentHistoryComponent } from '../appointment-history/appointment-history.component';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf, AsyncPipe, AppointmentHistoryComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  user$: Observable<AppUser | null>;

  constructor(private authService: AuthService) {
    this.user$ = this.authService.user$;
  }
}