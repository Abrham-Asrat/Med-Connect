import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    // Shown right after registration — "check your inbox"
    path: 'email-sent',
    loadComponent: () => import('./pages/email-sent/email-sent.component')
      .then(m => m.EmailSentComponent)
  },
  {
    // User lands here after clicking the link in the email (/verify-email?token=XYZ)
    path: 'verify-email',
    loadComponent: () => import('./pages/email-verified/email-verified.component')
      .then(m => m.EmailVerifiedComponent)
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./pages/otp-verification/otp-verification.component')
      .then(m => m.OtpVerificationComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
