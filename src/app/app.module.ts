import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { FullCalendarModule } from '@fullcalendar/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './pieces/header/header.component';
import { EventsComponent } from './sections/events/events.component';
import { HomeComponent } from './sections/home/home.component';
import { ServicesComponent } from './sections/services/services.component';
import { BookDialogComponent } from './pieces/book-dialog/book-dialog.component';
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ServicesComponent,
    HomeComponent,
  ],
  imports: [
    BrowserModule,
    EventsComponent,
    BookDialogComponent,
    FullCalendarModule,

    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
