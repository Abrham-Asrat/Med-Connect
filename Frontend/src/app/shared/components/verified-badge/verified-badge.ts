import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verified-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge d-inline-flex align-items-center gap-1"
          [class.bg-primary]="verified"
          [class.bg-warning text-dark]="!verified && pending"
          [class.bg-secondary]="!verified && !pending">
      @if (verified) {
        <i class="bi bi-shield-check"></i>
        Verified
      } @else if (pending) {
        <i class="bi bi-clock"></i>
        Pending
      } @else {
        <i class="bi bi-shield"></i>
        Unverified
      }
    </span>
  `
})
export class VerifiedBadgeComponent {
  @Input() verified: boolean = false;
  @Input() pending: boolean = false;
}