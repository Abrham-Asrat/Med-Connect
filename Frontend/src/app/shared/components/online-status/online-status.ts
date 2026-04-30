import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-online-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="d-inline-flex align-items-center gap-1">
      <span class="rounded-circle d-inline-block"
            [style.width]="'8px'"
            [style.height]="'8px'"
            [class.bg-primary]="online"
            [class.bg-warning]="!online && away"
            [class.bg-secondary]="!online && !away">
      </span>
      <small [class.text-primary]="online"
             [class.text-warning-dark]="!online && away"
             [class.text-medium]="!online && !away">
        {{ online ? 'Online' : (away ? 'Away' : 'Offline') }}
      </small>
    </span>
  `
})
export class OnlineStatusComponent {
  @Input() online: boolean = false;
  @Input() away: boolean = false;
}