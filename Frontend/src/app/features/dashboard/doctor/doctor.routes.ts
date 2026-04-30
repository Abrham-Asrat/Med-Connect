import { Routes } from '@angular/router';
import { DoctorLayoutComponent } from '../../../layouts/doctor/doctor-layout/doctor-layout';

export const DOCTOR_ROUTES: Routes = [
  {
    path: '',
    component: DoctorLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./doctor-dashboard/doctor-dashboard').then(m => m.DoctorDashboardComponent) },
      { path: 'schedule', loadComponent: () => import('../../doctor-schedule/pages/schedule-management/schedule-management.component').then(m => m.ScheduleManagementComponent) },
      { path: 'blog', loadComponent: () => import('../../blog/pages/blog-management/blog-management.component').then(m => m.BlogManagementComponent) },
      {
       path: 'chat', 
        loadComponent: () => import('../../chat/pages/chat/doctor-chat/doctor-chat.component').then(m => m.DoctorChatComponent) 
      },
      { 
        path: 'earnings', 
        loadComponent: () => import('../../payments/pages/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent) 
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];