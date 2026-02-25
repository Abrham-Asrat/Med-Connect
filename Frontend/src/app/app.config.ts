import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAuth0 } from '@auth0/auth0-angular';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAuth0({
      domain: 'dev-p13y76xt7x8vya75.us.auth0.com',
      clientId: 'VZB2i6E7jZoep3iGv8p8ZC1Q1YirzTFI',
      authorizationParams: {
        redirect_uri: 'http://localhost:4200/register/step2',
        // audience: 'https://api.medconnect.com', // Commented out until properly configured
        scope: 'openid profile email'
      },
      httpInterceptor: {
        allowedList: [
          'http://localhost:5000/api/*'
        ]
      }
    })
  ]
};
