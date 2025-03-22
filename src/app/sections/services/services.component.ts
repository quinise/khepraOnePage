import { Component } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ReadingFormComponent } from 'src/app/schedule-reading/reading-form/reading-form.component';
import { MatButtonModule } from '@angular/material/button';
@Component({
    selector: 'app-services',
    standalone: true,
    imports: [MatButtonModule, MatDialogModule],
    templateUrl: './services.component.html',
    styleUrls: ['./services.component.css'],
})
export class ServicesComponent {

    constructor(private _matDialog:MatDialog) {}
    openReadingForm() {
        this._matDialog.open(ReadingFormComponent, {width:'400px', height:'475px'});
    }
}
