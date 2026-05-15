import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, RegisterRequest } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));
  private patientIdSignal = signal<string | null>(localStorage.getItem('patientId'));
  private doctorIdSignal = signal<string | null>(localStorage.getItem('doctorId'));

  readonly currentUser = computed(() => this.currentUserSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => {
    const token = this.tokenSignal();
    return !!token && token !== 'null' && token !== 'undefined';
  });

  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);
  readonly patientId = computed(() => this.patientIdSignal());
  readonly doctorId = computed(() => this.doctorIdSignal());

  constructor() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);

        // Repair missing ids for existing sessions
        if (!localStorage.getItem('userId')) localStorage.setItem('userId', user.userId);
        if (user.role === 'Patient' && !localStorage.getItem('patientId')) {
          const id = user.patientId || user.userId;
          localStorage.setItem('patientId', id);
          this.patientIdSignal.set(id);
        } else if (user.role === 'Doctor' && !localStorage.getItem('doctorId')) {
          const id = user.doctorId || user.userId;
          localStorage.setItem('doctorId', id);
          this.doctorIdSignal.set(id);
        }
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/login`, credentials)
      .pipe(tap((r: any) => { if (r?.success) this.setSession(r); }));
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/Register`, data);
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp: Number(otp) });
  }

  checkEmailVerified(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/email/${email}`);
  }

  resendVerificationEmail(email: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verify/resend/${email}`);
  }

  resendOTP(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  changePassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/change-password`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/forgot-password`, { email });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data);
  }

  private setSession(response: any): void {
    const d = response.data;
    const token = d.accessToken;
    const p = d.profile;
    if (token) { localStorage.setItem('token', token); this.tokenSignal.set(token); }
    // Store all profile fields so they survive page refresh and re-login
    const user: any = {
      userId: p?.userId || '',
      email: p?.email || '',
      firstName: p?.firstName || '',
      lastName: p?.lastName || '',
      role: p?.role || '',
      phone: p?.phone || '',
      gender: p?.gender || '',
      dateOfBirth: p?.dateOfBirth || '',
      address: p?.address || '',
      profilePicture: p?.profilePicture || '',
      isVerified: !!p?.isVerified,
      // Patient-specific
      patientId: p?.patientId || '',
      medicalHistory: p?.medicalHistory || '',
      emergencyContactName: p?.emergencyContactName || '',
      emergencyContactPhone: p?.emergencyContactPhone || '',
      // Doctor-specific
      doctorId: p?.doctorId || '',
      biography: p?.biography || '',
      qualifications: p?.qualifications || '',
      specialties: p?.specialties || [],
      doctorStatus: p?.doctorStatus || '',
      isVerifiedDoctor: !!p?.isVerified,
    };
    localStorage.setItem('user', JSON.stringify(user));

    if (user.role === 'Patient') {
      const id = user.patientId || user.userId;
      localStorage.setItem('patientId', id);
      this.patientIdSignal.set(id);
    } else if (user.role === 'Doctor') {
      const id = user.doctorId || user.userId;
      localStorage.setItem('doctorId', id);
      this.doctorIdSignal.set(id);
    }
    localStorage.setItem('userId', user.userId);

    this.currentUserSignal.set(user);
    this.navigateByRole();
  }

  logout(showPrompt: boolean = false): void {
    if (showPrompt) {
      if (!window.confirm('Are you sure you want to logout? / በእርግጥ መውጣት ይፈልጋሉ?')) return;
    }

    // Attempt backend token invalidation connection
    this.http.post(`${this.apiUrl}/User/logout`, {}).subscribe({
      next: () => this.executeLocalLogout(),
      error: () => this.executeLocalLogout() // Perform local logout even if HTTP fails/endpoint missing
    });
  }

  updateUser(userData: Partial<User>): void {
    const current = this.currentUserSignal();
    if (current) {
      const updated = { ...current, ...userData };
      localStorage.setItem('user', JSON.stringify(updated));
      this.currentUserSignal.set(updated as User);

      // Keep role-specific IDs in sync if they come back from the server
      const anyData = userData as any;
      if (anyData.patientId) {
        localStorage.setItem('patientId', anyData.patientId);
        this.patientIdSignal.set(anyData.patientId);
      }
      if (anyData.doctorId) {
        localStorage.setItem('doctorId', anyData.doctorId);
        this.doctorIdSignal.set(anyData.doctorId);
      }
    }
  }

  executeLocalLogout(): void {
    ['token', 'user', 'patientId', 'doctorId', 'userId'].forEach(k => localStorage.removeItem(k));
    this.tokenSignal.set(null); this.currentUserSignal.set(null);
    this.patientIdSignal.set(null); this.doctorIdSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this.tokenSignal(); }
  hasRole(roles: UserRole[]): boolean { const r = this.userRole(); return r ? roles.includes(r) : false; }
  navigateByRole(): void {
    switch (this.userRole()) {
      case UserRole.Patient: this.router.navigate(['/patient/dashboard']); break;
      case UserRole.Doctor: this.router.navigate(['/doctor/dashboard']); break;
      case UserRole.Admin: this.router.navigate(['/admin/dashboard']); break;
      default: this.router.navigate(['/auth/login']);
    }
  }
}