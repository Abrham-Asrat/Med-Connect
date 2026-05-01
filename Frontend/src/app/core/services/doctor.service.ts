import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DoctorService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ✅ GET /api/doctors/all
  getAllDoctors(): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/all`);
  }

  // ✅ GET /api/doctors/specialty/{specialtyName}
  getBySpecialty(specialty: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/specialty/${specialty}`);
  }

  // ✅ GET /api/doctors/name/{doctorName}
  searchByName(name: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/name/${name}`);
  }

  // ✅ GET /api/doctors/availabilities/{doctorId}
  getAvailabilities(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/doctors/availabilities/${doctorId}`);
  }
}