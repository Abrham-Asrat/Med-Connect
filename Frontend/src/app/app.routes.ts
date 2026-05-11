import { Routes } from '@angular/router';

export const routes: Routes = [
  // Public landing page
  {
    path: '',
    loadComponent: () => import('./features/landing/pages/landing-page/landing-page.component/landing-page.component')
      .then(m => m.LandingPageComponent)
  },
  
  // Auth routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes')
      .then(m => m.AUTH_ROUTES)
  },

  // Email verification link target — /verify-email?token=XYZ
  // The backend sends this URL in the verification email.
  // This redirects into the auth feature so the component handles the token.
  {
    path: 'verify-email',
    loadComponent: () => import('./features/auth/pages/email-verified/email-verified.component')
      .then(m => m.EmailVerifiedComponent)
  },
  
  // Patient routes (lazy loaded)
  {
    path: 'patient',
    loadChildren: () => import('./features/dashboard/patient/patient.routes')
      .then(m => m.PATIENT_ROUTES)
  },
  
  // Doctor routes (lazy loaded)
  {
    path: 'doctor',
    loadChildren: () => import('./features/dashboard/doctor/doctor.routes')
      .then(m => m.DOCTOR_ROUTES)
  },
  
  // Admin routes (lazy loaded)
  {
    path: 'admin',
    loadChildren: () => import('./features/dashboard/admin/admin.routes')
      .then(m => m.ADMIN_ROUTES)
  },
  
  // Error pages
  {
    path: '404',
    loadComponent: () => import('./features/errors/pages/not-found/not-found')
      .then(m => m.NotFound)
  },
  {
    path: '500',
    loadComponent: () => import('./features/errors/pages/server-error/server-error')
      .then(m => m.ServerError)
  },
  
  // Redirect unknown paths
  { path: '**', redirectTo: '404' }
];