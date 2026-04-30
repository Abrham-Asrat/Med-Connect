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

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(localStorage.getItem('token'));

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
      try { this.currentUserSignal.set(JSON.parse(userStr)); }
      catch { this.logout(); }
    }
  }

  // ✅ POST /api/User/login
 login(credentials: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/login`, credentials)
      .pipe(tap(response => {
        console.log('Raw login response:', JSON.stringify(response, null, 2));
        if (response) {
          this.setSession(response);
        }
      }));
  }

  // ✅ POST /api/User/Register
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/Register`, data);
  }

  // ✅ POST /api/verify-otp
  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-otp`, { email, otp: Number(otp) });
  }

  // ✅ POST /api/send-otp
  resendOTP(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  // ✅ GET /api/User/profile/me
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/profile/me`);
  }

  // ✅ PUT /api/User/profile
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/profile`, data);
  }

  // ✅ POST /api/User/change-password
  changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/change-password`, data);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/send-otp`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/change-password`, { token, newPassword, confirmPassword: newPassword });
  }

 private setSession(response: any): void {
    console.log('Setting session from:', response);
    
    // Handle different response structures
     const data = response.data;
   const token = data.accessToken; 
    const profile = data.profile; 
    
    if (token) {
      localStorage.setItem('token', token);
      this.tokenSignal.set(token);
    }

    const userData: Partial<User> = {
      userId: profile.userId || '',
      email: profile.email || '',
      firstName: profile.firstName || '',
      lastName: profile.lastName || '',
      role: profile.role || '',
      phone: profile.phone || '',
      gender: profile.gender || '',
      dateOfBirth: profile.dateOfBirth || '',
    };
    
    
    localStorage.setItem('user', JSON.stringify(userData));
    this.currentUserSignal.set(userData as User);
    
    console.log('Session set. User:', userData);
    
    // Navigate based on role
    this.navigateByRole();
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null { return this.tokenSignal(); }

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