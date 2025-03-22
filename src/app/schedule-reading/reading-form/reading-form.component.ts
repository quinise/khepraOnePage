import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon'
import {MatCheckboxModule} from '@angular/material/checkbox';
import { MatInput, MatInputModule } from '@angular/material/input';
import { Reading } from '../reading';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-reading-form',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatDialogModule, MatFormField, MatCheckboxModule, MatInputModule, FormsModule],
  templateUrl: './reading-form.component.html',
  styleUrl: './reading-form.component.css'
})
export class ReadingFormComponent {
  
  reading:Reading={
    id:0,
    name:'',
    email:'',
    phone_number:'',
    date:'',
    isVirtual:false
  }

  addToCalendar() {
    alert(`submit data to calendar: 
      client: ${this.reading.name}
      id: ${this.reading.id}
      email: ${this.reading.email}
      phone: ${this.reading.phone_number}
      date: ${this.reading.date}
      isVirtual: ${this.reading.isVirtual}`);
  }
}
