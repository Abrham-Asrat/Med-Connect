import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // POST /api/appointments/book
  bookAppointment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/appointments/book`, data);
  }

  // GET /api/appointments/patient/{patientId}
  getPatientAppointments(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/patient/${patientId}`);
  }

  getAllAppointments(): Observable<any> {
  return this.http.get(`${this.apiUrl}/appointments/all`);
}

  // GET /api/appointments/doctor/{doctorId}
  getDoctorAppointments(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/doctor/${doctorId}`);
  }

  // PATCH /api/appointments/{appointmentId}
  updateAppointment(appointmentId: string, data: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/appointments/${appointmentId}`, data);
  }

  // DELETE /api/appointments/{appointmentId}
  deleteAppointment(appointmentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/appointments/${appointmentId}`);
  }
}