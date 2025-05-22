import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentFormComponent } from 'src/app/components/forms/book-appointment-form/book-appointment-form.component';
import { CreateEventFormComponent } from 'src/app/components/forms/create-event-form/create-event-form.component';
@Component({
  selector: 'app-events-management',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './events-management.component.html',
  styleUrl: './events-management.component.css'
})
export class EventsManagementComponent {
  dialog = inject(MatDialog);

  openEventForm() {
    const dialogRef = this.dialog.open(CreateEventFormComponent, {
      minWidth: '500px',
      data: {},
    });
  }

  openBookAppointmentForm() {
    // if (buttonType == 'readingButton') {
    //     this.selectedServiceType = "Reading";
    // } else if (buttonType == 'cleansingButton') {
    //     this.selectedServiceType = "Cleansing";
    // } else if (buttonType == 'initiationButton') {
    //     this.selectedServiceType = "Initiation";
    // } else if (buttonType == 'workshopButton') {
    //     this.selectedServiceType = "Workshop";
    // }

    const dialogRef = this.dialog.open(AppointmentFormComponent, {
        minWidth: '500px',
        data: {},
    });
  }
}
