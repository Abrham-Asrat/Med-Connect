import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/admin/stats
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/stats`);
  }

  // GET /api/admin/doctors/pending
  getPendingDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/doctors/pending`);
  }

  // GET /api/admin/doctors/verified
  getVerifiedDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/doctors/verified`);
  }

  // POST /api/admin/doctors/approve
  approveDoctor(doctorId: string, adminNotes?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/doctors/approve`, { doctorId, adminNotes });
  }

  // POST /api/admin/doctors/reject
  rejectDoctor(doctorId: string, reason: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/doctors/reject`, { doctorId, reason });
  }

  // PATCH /api/admin/doctors/{doctorId}/status
  updateDoctorStatus(doctorId: string, status: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/doctors/${doctorId}/status`, null, {
      params: { status: status.toString() }
    });
  }

  // GET /api/admin/users/all
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users/all`);
  }

  // GET /api/Patient/all
  getAllPatients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Patient/all`);
  }

  // GET /api/doctors/all
  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/all`);
  }

  deactivateUser(userId: string): Observable<any> {
  return this.http.patch(`${this.apiUrl}/admin/users/${userId}/deactivate`, {});
}
}