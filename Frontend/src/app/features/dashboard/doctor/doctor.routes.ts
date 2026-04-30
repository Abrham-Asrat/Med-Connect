import { Routes } from '@angular/router';

export const DOCTOR_ROUTES: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./doctor-dashboard/doctor-dashboard')
      .then(m => m.DoctorDashboardComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];