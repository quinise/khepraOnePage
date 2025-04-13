import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentFormComponent } from 'src/app/components/book-appointment-form/book-appointment-form/book-appointment-form.component';
import { ApiService } from 'src/app/services/api.service';
@Component({
    selector: 'app-services',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css'],
})
export class ServicesComponent {
    dialog = inject(MatDialog);
    selectedServiceType = '';

    constructor (public apiService: ApiService) {}

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

    
