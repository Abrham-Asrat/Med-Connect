import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="text-center py-5">
      <div class="mb-3">
        <i [class]="'bi ' + icon + ' text-primary'" style="font-size: 64px; opacity: 0.5;"></i>
      </div>
      <h5 class="text-dark mb-2">{{ title }}</h5>
      <p class="text-medium mb-3">{{ description }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary" (click)="onAction()">
          {{ actionLabel }}
        </button>
      }
    </div>
  `
})
export class EmptyStateComponent {
  @Input() icon: string = 'bi-inbox';
  @Input() title: string = 'Nothing here yet';
  @Input() description: string = '';
  @Input() actionLabel: string = '';

  onAction(): void {
    // Emit action
  }
}