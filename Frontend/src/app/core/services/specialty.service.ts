import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SpecialtyService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    getAllSpecialties(): Observable<any> {
        return this.http.get(`${this.apiUrl}/specialties`);
    }
}
