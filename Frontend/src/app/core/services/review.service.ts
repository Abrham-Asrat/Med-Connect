import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getReviewsByDoctor(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/doctor/${doctorId}`);
  }

  getReviewStats(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/doctor/${doctorId}/stats`);
  }

  getPatientReviews(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/patient/${patientId}`);
  }

  getPatientReviewHistory(patientId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/patient/${patientId}/history`);
  }

  postReview(reviewData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reviews`, reviewData);
  }

  editReview(reviewData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/reviews`, reviewData);
  }

  deleteReview(reviewId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reviews/${reviewId}`);
  }

  searchReviews(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/search`, { params });
  }

  checkIfPatientReviewedDoctor(patientId: string, doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/check/${patientId}/${doctorId}`);
  }

  getDoctorAverageRating(doctorId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/reviews/doctor/${doctorId}/average-rating`);
  }
}