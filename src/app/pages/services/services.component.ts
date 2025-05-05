import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { take } from 'rxjs';
import { AppointmentFormComponent } from 'src/app/components/forms/book-appointment-form/book-appointment-form.component';
import { AppointmentApiService } from 'src/app/services/apis/appointmentApi.service';
import { AuthService } from 'src/app/services/authentication/auth.service';
@Component({
    selector: 'app-services',
    standalone: true,
    imports: [NgIf, MatButtonModule, MatDialogModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css'],
})
export class ServicesComponent {
    dialog = inject(MatDialog);
    selectedServiceType = '';

    isUser: boolean = false;

    constructor (public appointmentApiService: AppointmentApiService, private authService: AuthService) {}

    ngOnInit(): void {
        this.authService.user$.pipe(take(1)).subscribe(user => {
            this.isUser = user?.role === 'user';
        });
    }

    openServiceForm(buttonType: string) {
        if (buttonType == 'readingButton') {
            this.selectedServiceType = "Reading";
        } else if (buttonType == 'cleansingButton') {
            this.selectedServiceType = "Cleansing";
        } else if (buttonType == 'initiationButton') {
            this.selectedServiceType = "Initiation";
        } else if (buttonType == 'workshopButton') {
            this.selectedServiceType = "Workshop";
        }

        const dialogRef = this.dialog.open(AppointmentFormComponent, {
            minWidth: '500px',
            data: {serviceType: this.selectedServiceType},
        });
    }
}

    
