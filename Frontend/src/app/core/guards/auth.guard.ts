import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('AuthGuard checking path:', state.url, 'Authenticated:', authService.isAuthenticated());

  if (authService.isAuthenticated()) return true;

  console.warn('Access denied to:', state.url, '- Redirecting to landing page');
  router.navigate(['/']);
  return false;
};
