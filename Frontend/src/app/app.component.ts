import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiFloatingButtonComponent } from './shared/components/ai-floating-button/ai-floating-button.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { GlobalSpinnerComponent } from './shared/components/global-spinner/global-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalSpinnerComponent],
  template: `
     <app-global-spinner></app-global-spinner>
    <router-outlet></router-outlet>
    
  `
})
export class AppComponent {}
