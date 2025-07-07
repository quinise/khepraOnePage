import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarViewComponent } from 'src/app/components/shared/calendar-view/calendar-view.component';
import { AuthWrapperService } from 'src/app/services/authentication/auth-wrapper.service';
@Component({
  selector: 'app-events',
  imports: [NgClass, CalendarViewComponent],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css'],
})
export class EventsComponent {
  constructor(private authWrapperService: AuthWrapperService) {}

  userId: string = this.authWrapperService.getCurrentUser()?.uid || '';;
  
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
  };
}