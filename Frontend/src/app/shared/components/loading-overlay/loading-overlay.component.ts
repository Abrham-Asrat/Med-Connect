import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
           style="background: rgba(255,255,255,0.7); z-index: 1050; border-radius: inherit;">
        <div class="text-center">
          <div class="spinner-border text-primary mb-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-primary fw-medium mb-0">{{ message }}</p>
        </div>
      </div>
    }
  `,
  styles: [`:host { position: relative; display: block; }`]
})
export class LoadingOverlayComponent {
  @Input() isLoading: boolean = false;
  @Input() message: string = 'Loading...';
}