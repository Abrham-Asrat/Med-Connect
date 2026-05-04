import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../../layouts/admin/admin-layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'verification', loadComponent: () => import('../../admin/verification/pages/doctor-verification/doctor-verification.component').then(m => m.DoctorVerificationComponent) },
      { path: 'doctors', loadComponent: () => import('../../admin/doctors/pages/doctors-list/doctors-list.component').then(m => m.DoctorsListComponent) },
      { path: 'patients', loadComponent: () => import('../../admin/patients/pages/patients-list/patients-list.component').then(m => m.PatientsListComponent) },
      { path: 'moderation', loadComponent: () => import('../../admin/moderation/pages/content-moderation/content-moderation.component').then(m => m.ContentModerationComponent) },
      { path: 'scheduling', loadComponent: () => import('../../admin/scheduling/admin-scheduling.component').then(m => m.AdminSchedulingComponent) },
      { path: 'finance', loadComponent: () => import('../../admin/finance/pages/financial-analytics/financial-analytics.component').then(m => m.FinancialAnalyticsComponent) },

      { path: 'users', loadComponent: () => import('../../admin/users/pages/users-list/users-list.component').then(m => m.UsersListComponent) },
      { path: 'settings', loadComponent: () => import('../../admin/settings/pages/admin-settings/admin-settings.component').then(m => m.AdminSettingsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];