import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AiFloatingButtonComponent } from './shared/components/ai-floating-button/ai-floating-button.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
// import { GlobalSpinnerComponent } from './shared/components/global-spinner/global-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  // imports: [RouterOutlet, GlobalSpinnerComponent, CookieConsentComponent, AiFloatingButtonComponent],
  imports: [RouterOutlet, AiFloatingButtonComponent],
  template: `
  <router-outlet></router-outlet>
  <app-ai-floating-button></app-ai-floating-button>

  `
  // imports: [RouterOutlet],
  // template: `
  // <app-global-spinner></app-global-spinner>

  //  <app-cookie-consent></app-cookie-consent>
  //   <router-outlet></router-outlet>

  // `
})
export class AppComponent { }
