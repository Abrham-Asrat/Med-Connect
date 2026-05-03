import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    // Initiate a charge (e.g., via Chapa)
    charge(chargeData: {
        amount: string;
        currency: string;
        phoneNumber: string;
        paymentProvider: string;
        paymentMethod: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        txRef?: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/payments/charge`, chargeData);
    }

    // Transfer balance between users
    transfer(transferData: {
        receiverId: string;
        amount: number;
        reason?: string;
    }): Observable<any> {
        return this.http.post(`${this.apiUrl}/payments/transfer`, transferData);
    }

    // Verification of transaction if needed (frontend typically waits for webhook or polls)
    verifyTransaction(txRef: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/payments/verify/${txRef}`);
    }
}
