import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loadingService.isLoading()) {
      <div class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
           style="background: rgba(255,255,255,0.6); z-index: 10000;">
        <div class="text-center">
          <div class="spinner-border text-primary mb-2" style="width: 48px; height: 48px;" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-primary fw-medium">Loading...</p>
        </div>
      </div>
    }
  `
})
export class GlobalSpinnerComponent {
  loadingService = inject(LoadingService);
}