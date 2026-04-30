import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [ngClass]="badgeClass">
      <i [class]="iconClass + ' me-1'"></i>
      {{ label }}
    </span>
  `,
  styles: [`
    .badge { font-size: 0.75rem; padding: 0.4em 0.8em; }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClass(): string {
    const classes: Record<string, string> = {
      'confirmed': 'bg-primary-light text-primary',
      'completed': 'bg-primary-light text-primary',
      'approved': 'bg-primary-light text-primary',
      'pending': 'bg-warning-light text-warning-dark',
      'cancelled': 'bg-danger-light text-danger',
      'rejected': 'bg-danger-light text-danger',
      'in-progress': 'bg-secondary-light text-secondary',
      'scheduled': 'bg-primary-light text-primary',
    };
    return classes[this.status] || 'bg-light text-dark';
  }

  get iconClass(): string {
    const icons: Record<string, string> = {
      'confirmed': 'bi bi-check-circle',
      'completed': 'bi bi-check-circle-fill',
      'approved': 'bi bi-check-circle',
      'pending': 'bi bi-clock',
      'cancelled': 'bi bi-x-circle',
      'rejected': 'bi bi-x-circle',
      'in-progress': 'bi bi-arrow-repeat',
      'scheduled': 'bi bi-calendar-check',
    };
    return icons[this.status] || 'bi bi-info-circle';
  }

  get label(): string {
    return this.status.charAt(0).toUpperCase() + this.status.slice(1).replace('-', ' ');
  }
}