import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./pages/login.component').then((m) => m.LoginComponent) },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent) },
      { path: 'requests', loadComponent: () => import('./pages/request-list.component').then((m) => m.RequestListComponent) },
      { path: 'requests/new', loadComponent: () => import('./pages/request-form.component').then((m) => m.RequestFormComponent) },
      { path: 'routes', loadComponent: () => import('./pages/route-list.component').then((m) => m.RouteListComponent) },
      { path: 'routes/:id', loadComponent: () => import('./pages/route-detail.component').then((m) => m.RouteDetailComponent) },
      { path: 'driver', loadComponent: () => import('./pages/driver.component').then((m) => m.DriverComponent) },
      { path: 'reports', loadComponent: () => import('./pages/reports.component').then((m) => m.ReportsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
