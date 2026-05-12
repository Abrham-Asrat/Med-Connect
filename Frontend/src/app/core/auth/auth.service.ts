import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, LoginRequest, LoginResponse, RegisterRequest } from '../models/user.model';
import { UserRole } from '../enums/user-role.enum';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = environment.apiUrl;

  // State with Signals
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

  // Computed values
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly token = computed(() => this.tokenSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());
  readonly userRole = computed(() => this.currentUserSignal()?.role ?? null);

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        this.currentUserSignal.set(JSON.parse(userStr));
      } catch {
        this.logout();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(tap(response => {
        if (response.success) this.setSession(response, credentials.email);
      }));
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  /** Validates the email verification token from the link the user clicked. */
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-email`, { params: { token } });
  }

  /** Resends the verification email for an unverified account. */
  resendVerification(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/resend-verification`, { email });
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp });
  }

  resendOTP(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/reset-password`, { token, newPassword });
  }

  private setSession(response: LoginResponse, email: string): void {
    const token = response.data.accessToken;
    const profile = response.data.profile;

    localStorage.setItem('token', token);
    this.tokenSignal.set(token);

    const userData: Partial<User> = {
      userId: profile.userId,
      email: email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      role: profile.role,
    };
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUserSignal.set(userData as User);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  hasRole(roles: UserRole[]): boolean {
    const role = this.userRole();
    return role ? roles.includes(role) : false;
  }

  navigateByRole(): void {
    switch (this.userRole()) {
      case UserRole.Patient: this.router.navigate(['/patient/dashboard']); break;
      case UserRole.Doctor: this.router.navigate(['/doctor/dashboard']); break;
      case UserRole.Admin: this.router.navigate(['/admin/dashboard']); break;
      default: this.router.navigate(['/auth/login']);
    }
  }
}