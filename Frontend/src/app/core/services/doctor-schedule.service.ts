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
}