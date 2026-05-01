import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { UserRole } from '../enums/user-role.enum';

export const pendingDoctorGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  if (authService.userRole() !== UserRole.Doctor) return true;
  if (authService.currentUser()?.status === 'Pending') { router.navigate(['/doctor/pending']); return false; }
  return true;
};