import { Component, inject } from '@angular/core';
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

    constructor (public bookService: BookService) {}


    openReadingForm() {
        const dialogRef = this.dialog.open(ReadingFormComponent, {
            minWidth: '500px',
            data: {serviceDetails: this.bookService.data$},
        });

        dialogRef.afterClosed().subscribe(result => {
            this.bookService.data$ = result;
        });
    }

    showButtonClicked() {
        console.log("clicked");
    }
}

    
