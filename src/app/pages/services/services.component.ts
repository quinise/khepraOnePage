import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReadingFormComponent } from 'src/app/components/reading-form/reading-form/reading-form.component';
import { BookService } from 'src/app/services/book.service';
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

    constructor (public bookService: BookService) {}

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

        const dialogRef = this.dialog.open(ReadingFormComponent, {
            minWidth: '500px',
            data: {serviceType: this.selectedServiceType},
        });

        dialogRef.afterClosed().subscribe(result => {
            
        });
    }
}

    
