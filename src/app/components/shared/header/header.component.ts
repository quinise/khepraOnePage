import { AsyncPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AppUser } from 'src/app/interfaces/appUser';
import { AuthService } from 'src/app/services/authentication/auth.service';
import { AuthenticateComponent } from '../../authenticate/authenticate.component';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    imports: [
        RouterModule,
        MatDialogModule,
        NgIf,
        AsyncPipe
    ],
    standalone: true
})
export class HeaderComponent {
    user$: Observable<AppUser | null>;
    dialog = inject(MatDialog);
    authStep = '';

    constructor(public authService: AuthService) {
        this.user$ = authService.user$;
    }
    
    logout() {
        this.authService.logout(); //TODO: Make sure logout() is defined in your AuthService
    }

    openAuthForm(buttonType: string) {
        if (buttonType == 'loginButton') {
            this.authStep = 'Login'
        } else if (buttonType == 'signupButton') {
            this.authStep = 'Sign up'
        }

        const dialogRef = this.dialog.open(AuthenticateComponent, {
            minWidth: '500px',
            data: {authStep: this.authStep},
        });
    }
}