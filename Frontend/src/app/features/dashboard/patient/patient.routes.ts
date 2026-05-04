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
      {
        path: 'doctors/:id',
        loadComponent: () => import('../../doctors/pages/profile/doctor-profile.component')
          .then(m => m.DoctorProfileComponent)
      },

      {
        path: 'book-appointment',
        loadComponent: () => import('../../appointments/pages/book-appointment/book-appointment.component')
          .then(m => m.BookAppointmentComponent)
      },
      {
        path: 'chat',
        loadComponent: () => import('../../chat/pages/chat/chat.component')
          .then(m => m.ChatComponent)
      },

      { path: 'about', loadComponent: () => import('../../support/pages/about-us/about-us.component').then(m => m.AboutUsComponent) },
      { path: 'contact', loadComponent: () => import('../../support/pages/contact-us/contact-us.component').then(m => m.ContactUsComponent) },
      { path: 'medical-records', loadComponent: () => import('../../medical-records/pages/medical-records/medical-records.component').then(m => m.MedicalRecordsComponent) },
      { path: 'reviews', loadComponent: () => import('../../reviews/pages/reviews/reviews.component').then(m => m.ReviewsComponent) },
      { path: 'payments', loadComponent: () => import('../../payments/pages/payment-history/payment-history.component').then(m => m.PaymentHistoryComponent) },
      { path: 'notifications', loadComponent: () => import('../../notifications/pages/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'appointments', loadComponent: () => import('../../appointments/pages/my-appointments/my-appointments.component').then(m => m.MyAppointmentsComponent) },
      { path: 'settings', loadComponent: () => import('../../settings/pages/settings/settings.component').then(m => m.SettingsComponent) },
      { path: 'blog', loadComponent: () => import('../../blog/pages/blog-list/blog-list.component').then(m => m.BlogListComponent) },
      { path: 'blog/:id', loadComponent: () => import('../../blog/pages/blog-detail/blog-detail.component').then(m => m.BlogDetailComponent) },

      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }

    ]
  }
];