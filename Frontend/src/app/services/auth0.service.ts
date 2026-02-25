import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { Observable } from 'rxjs';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root'
})
export class Auth0Service {
  constructor(
    private auth: AuthService,
    private errorHandler: ErrorHandlerService
  ) {}

  login(): void {
    console.log('[Auth0 Service] Initiating login with redirect');
    console.log('[Auth0 Service] Redirect URI:', 'http://localhost:4200/register/step2');
    
    this.auth.loginWithRedirect({
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/register/step2',
        audience: 'https://api.medconnect.com',
        scope: 'openid profile email'
      }
    });
    
    console.log('[Auth0 Service] Login redirect initiated');
  }

  logout(): void {
    this.auth.logout({
      openUrl: () => window.location.assign(window.location.origin)
    });
  }

  isAuthenticated$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  user$(): Observable<any> {
    return this.auth.user$;
  }

  getAccessToken(): Observable<string | null> {
    console.log('[Auth0 Service] Requesting access token');
    return new Observable(observer => {
      this.auth.getAccessTokenSilently().subscribe({
        next: (token) => {
          console.log('[Auth0 Service] Access token received successfully');
          observer.next(token);
          observer.complete();
        },
        error: (error) => {
          console.error('[Auth0 Service] Error getting access token:', error);
          this.errorHandler.handleHttpError(error, 'Auth0 Access Token');
          observer.error(error);
        }
      });
    });
  }
}