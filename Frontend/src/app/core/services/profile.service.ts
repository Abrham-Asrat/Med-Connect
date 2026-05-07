import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/User/profile/me
  getProfile(): Observable<any> {
    return this.http.get(`${this.apiUrl}/User/profile/me`);
  }

  // PUT /api/User/profile
  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/User/profile`, data);
  }

  // POST /api/User/change-password
  changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/User/change-password`, data);
  }

  // POST /api/User/profile-picture
  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/User/profile-picture`, formData);
  }

  deleteAccount(userId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/User/${userId}`);
  }
}