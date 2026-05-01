import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PatientService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/Patient/all
  getAllPatients(): Observable<any> {
    return this.http.get(`${this.apiUrl}/Patient/all`);
  }

  // GET /api/appointments/patient/{patientId}
  getMyAppointments(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/patient/${patientId}`);
  }

  // GET /api/appointments/all
  getAllAppointments(): Observable<any> {
    return this.http.get(`${this.apiUrl}/appointments/all`);
  }
}