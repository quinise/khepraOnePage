import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';
import { Service } from 'src/app/interfaces/service';
import { BookService } from 'src/app/services/book.service';
@Component({
    selector: 'app-events',
    imports: [FullCalendarModule, CommonModule],
    standalone: true,
    templateUrl: './events.component.html',
    styleUrls: ['./events.component.css'],
    providers: [BookService]
})

export class EventsComponent {
  service: Service = {} as Service

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    this.bookService.getServiceDetails().subscribe({
      // Question: How can I change this from any to Service?
      next: (service: any) => {
        console.log(`in events asking for service ${service.name}`)
        this.service = service;
      },
      error: (error) => {
        console.log(error);
      },
    });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin]
  };
}
