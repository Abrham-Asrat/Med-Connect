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
      { path: 'health-blogs', loadComponent: () => import('../../blog/pages/blog-list/blog-list.component').then(m => m.BlogListComponent) },
      { path: 'health-blogs/:id', loadComponent: () => import('../../blog/pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },

      {
        path: 'chat',
        loadComponent: () => import('../../chat/pages/chat/chat.component').then(m => m.ChatComponent)
      },
      {
        path: 'earnings',
        loadComponent: () => import('../../payments/pages/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('../../settings/pages/doctor-settings/doctor-settings.component').then(m => m.DoctorSettingsComponent)
      },

      { path: 'contact', loadComponent: () => import('../../support/pages/contact-us/contact-us.component').then(m => m.ContactUsComponent) },
      { path: 'notifications', loadComponent: () => import('../../notifications/pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

    ]
  }
];