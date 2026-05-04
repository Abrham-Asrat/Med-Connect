import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupportService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // POST /api/Contact
    submitContact(data: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/Contact`, data);
    }

    // GET /api/Contact/info
    getSupportInfo(): Observable<any> {
        return this.http.get(`${this.apiUrl}/Contact/info`);
    }
}
