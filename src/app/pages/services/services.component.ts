import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentFormComponent } from 'src/app/components/book-appointment-form/book-appointment-form/book-appointment-form.component';
import { BookAppointment } from 'src/app/services/bookAppointment.service';
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

    constructor (public bookAppointment: BookAppointment) {}

    openServiceForm(buttonId: string) {
        if (buttonId == 'readingButton') {
            this.selectedServiceType = "Reading";
        } else if (buttonId == 'cleansingButton') {
            this.selectedServiceType = "Cleansing";
        } else if (buttonId == 'initiationButton') {
            this.selectedServiceType = "Initiation";
        } else if (buttonId == 'workshopButton') {
            this.selectedServiceType = "Workshop";
        }

        const dialogRef = this.dialog.open(AppointmentFormComponent, {
            minWidth: '500px',
            data: {serviceType: this.selectedServiceType},
        });

        dialogRef.afterClosed().subscribe(result => {
            
        });
    }
}

    
