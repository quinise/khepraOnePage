import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SignupComponent } from '../signup/signup.component';
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
    imports: [
        RouterModule,
        MatDialogModule,
    ],
    standalone: true
})
export class HeaderComponent {
    dialog = inject(MatDialog);
    authStep = '';

    openAuthForm(buttonType: string) {
        if (buttonType == 'loginButton') {
            this.authStep = 'Login'
        } else if (buttonType == 'signupButton') {
            this.authStep = 'Sign up'
        }

        const dialogRef = this.dialog.open(SignupComponent, {
            minWidth: '500px',
            data: {authStep: this.authStep},
        });
    }
}
