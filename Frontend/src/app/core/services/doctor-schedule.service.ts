import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorScheduleService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/doctors/availabilities/{doctorId}
  getAvailabilities(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/availabilities/${doctorId}`);
  }

  // GET /api/appointments/doctor/{doctorId}
  getDoctorAppointments(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/doctor/${doctorId}`);
  }

  // GET /api/appointments/doctor/{doctorId}/schedules?timeFrame=30
  getSchedules(doctorId: string, timeFrame: number = 30): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/doctor/${doctorId}/schedules`, {
      params: { timeFrame: timeFrame.toString() }
    });
  }
  // POST /api/doctors/availabilities/{doctorId}
  updateAvailabilities(doctorId: string, availabilities: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/availabilities/${doctorId}`, availabilities);
  }

  // POST /api/doctors/accept-appointments/{doctorId}?accepting=true
  toggleAcceptingAppointments(doctorId: string, accepting: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/doctors/accept-appointments/${doctorId}?accepting=${accepting}`, {});
  }

  // POST /api/doctors/time-off/{doctorId}?start=...&end=...
  blockDates(doctorId: string, start: string, end: string, reason?: string): Observable<any> {
    let url = `${this.apiUrl}/doctors/time-off/${doctorId}?start=${start}&end=${end}`;
    if (reason) url += `&reason=${reason}`;
    return this.http.post(url, {});
  }

  // GET /api/doctors/time-off/{doctorId}
  getTimeOffs(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/time-off/${doctorId}`);
  }
}
