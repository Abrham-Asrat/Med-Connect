import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showBanner()) {
      <div class="position-fixed bottom-0 start-0 w-100 p-3" style="z-index: 9999;">
        <div class="container">
          <div class="bg-white shadow-lg rounded-3 p-4 border border-primary border-2">
            <div class="row align-items-center">
              <div class="col-lg-8">
                <div class="d-flex align-items-start gap-3">
                  <i class="bi bi-shield-check text-primary fs-4 mt-1"></i>
                  <div>
                    <h6 class="text-primary mb-1">We value your privacy 🍪</h6>
                    <p class="text-medium mb-0" style="font-size:14px">
                      We use cookies to enhance your experience. By continuing, you agree to our use of cookies for analytics and personalized content.
                      <a href="#" class="text-primary">Privacy Policy</a>
                    </p>
                  </div>
                </div>
              </div>
              <div class="col-lg-4 d-flex gap-2 justify-content-lg-end mt-3 mt-lg-0">
                <button class="btn btn-outline-primary btn-sm" (click)="customize()">Customize</button>
                <button class="btn btn-primary btn-sm" (click)="acceptAll()">Accept All</button>
                <button class="btn btn-link text-medium btn-sm" (click)="rejectAll()">Reject Non-Essential</button>
              </div>
            </div>

            <!-- Customize Panel -->
            @if (showCustomize()) {
              <div class="mt-3 pt-3 border-top">
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" checked disabled>
                  <label class="form-check-label text-medium"><strong>Essential Cookies</strong> - Required for the website to function</label>
                </div>
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" checked>
                  <label class="form-check-label text-medium"><strong>Analytics Cookies</strong> - Help us improve our services</label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox">
                  <label class="form-check-label text-medium"><strong>Marketing Cookies</strong> - Personalize your experience</label>
                </div>
                <button class="btn btn-primary btn-sm" (click)="savePreferences()">Save Preferences</button>
              </div>
            )}
          </div>
        </div>
      </div>
    }
  `
})
export class CookieConsentComponent {
  showBanner = signal(true);
  showCustomize = signal(false);

  acceptAll(): void {
    localStorage.setItem('cookieConsent', 'accepted');
    this.showBanner.set(false);
  }

  rejectAll(): void {
    localStorage.setItem('cookieConsent', 'rejected');
    this.showBanner.set(false);
  }

  customize(): void {
    this.showCustomize.update(v => !v);
  }

  savePreferences(): void {
    localStorage.setItem('cookieConsent', 'customized');
    this.showBanner.set(false);
  }
}