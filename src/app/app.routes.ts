import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user-guard.guard';
import { EventsComponent } from './pages/events/events.component';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';

export const routes: Routes = [
  {path:"", component: HomeComponent},
  {path:"services", component: ServicesComponent},
  {path:"events", component: EventsComponent},
  {
    path: 'admin-panel',
    loadComponent: () => import('./pages/admin/panel/panel.component').then(m => m.PanelComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'event-management',
    loadComponent: () => import('./pages/admin/events-management/events-management.component').then(m => m.EventsManagementComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'user-dashboard',
    loadComponent: () => import('./pages/user/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [userGuard],
  },
];