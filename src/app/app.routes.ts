import { EventsComponent } from './pages/events/events.component';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { PanelComponent } from './pages/admin/panel/panel.component';
import { Routes } from '@angular/router';

export const routes: Routes = [
  {path:"", component: HomeComponent},
  {path:"services", component: ServicesComponent},
  {path:"events", component: EventsComponent},
  {path:"admin-panel", component: PanelComponent}
];