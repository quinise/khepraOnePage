import { CommonModule } from '@angular/common';
import { Component, OnInit, Inject, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { Service } from 'src/app/interfaces/service';
import { BookService } from 'src/app/services/book.service';
import { ReadingFormComponent } from 'src/app/components/reading-form/reading-form/reading-form.component';
// import { Router } from '@angular/router';
@Component({
    selector: 'app-events',
    imports: [FullCalendarModule, CommonModule],
    standalone: true,
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    providers: [BookService]
})

export class EventsComponent {
  protected servicesList: Service[] = [];
  // bookService: BookService = inject(BookService);
  readingForm: ReadingFormComponent | undefined;

  constructor(private bookService: BookService) {
    
  }

  ngOnInit(): void {
    // this.servicesList = this.bookService.getAllServicesDetails();
    // console.log(this.servicesList);

    const data = this.bookService.service;
    console.log(data);

    // const navigation = this.router.getCurrentNavigation();
    // const appointment = navigation?.extras?.state?.['services'];

    // console.log('State:', navigation?.extras?.state);
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
