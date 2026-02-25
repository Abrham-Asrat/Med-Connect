import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterUserDto, ApiResponse, ProfileDto } from '../models/user.model';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:5000/api/user';

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {}

  initializeProfile(userData: RegisterUserDto): Observable<ApiResponse<ProfileDto>> {
    console.log('[User Service] Initializing profile with data:', userData);
    console.log('[User Service] API URL:', `${this.apiUrl}/initialize`);
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    console.log('[User Service] Sending POST request to backend');
    
    return new Observable(observer => {
      this.http.post<ApiResponse<ProfileDto>>(
        `${this.apiUrl}/initialize`,
        userData,
        { headers }
      ).subscribe({
        next: (response) => {
          console.log('[User Service] Profile initialization successful:', response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[User Service] Profile initialization failed:', error);
          this.errorHandler.handleHttpError(error, 'Profile Initialization');
          observer.error(error);
        }
      });
    });
  }

  getProfile(): Observable<ApiResponse<ProfileDto>> {
    console.log('[User Service] Getting user profile');
    console.log('[User Service] API URL:', `${this.apiUrl}/profile`);
    
    return new Observable(observer => {
      this.http.get<ApiResponse<ProfileDto>>(`${this.apiUrl}/profile`).subscribe({
        next: (response) => {
          console.log('[User Service] Profile retrieval successful:', response);
          observer.next(response);
          observer.complete();
        },
        error: (error) => {
          console.error('[User Service] Profile retrieval failed:', error);
          this.errorHandler.handleHttpError(error, 'Profile Retrieval');
          observer.error(error);
        }
      });
    });
  }
}