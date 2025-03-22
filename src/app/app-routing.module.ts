import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EventsComponent } from './sections/events/events.component';
import { HomeComponent } from './sections/home/home.component';
import { ServicesComponent } from './sections/services/services.component';

const routes: Routes = [
  {path:"", component: HomeComponent},
  {path:"services", component: ServicesComponent},
  {path:"events", component: EventsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
