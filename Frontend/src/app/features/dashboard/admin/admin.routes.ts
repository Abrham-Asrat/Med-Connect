import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard')
      .then(m => m.AdminDashboardComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];