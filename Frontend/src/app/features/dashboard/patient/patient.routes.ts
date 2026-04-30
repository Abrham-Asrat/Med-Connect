import { Routes } from '@angular/router';
import { PatientLayoutComponent } from '../../../layouts/patient/patient-layout.component/patient-layout.component';

export const PATIENT_ROUTES: Routes = [
  {
    path: '',
    component: PatientLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./patient-dashboard/patient-dashboard')
          .then(m => m.PatientDashboardComponent)
      },
      {
        path: 'doctors',
        loadComponent: () => import('../../doctors/pages/search/search')
          .then(m => m.DoctorSearchComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];