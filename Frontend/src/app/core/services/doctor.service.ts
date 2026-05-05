import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/all`);
  }

  getDoctorById(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/${doctorId}`);
  }

  getDoctorAvailabilities(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/availabilities/${doctorId}`);
  }
}