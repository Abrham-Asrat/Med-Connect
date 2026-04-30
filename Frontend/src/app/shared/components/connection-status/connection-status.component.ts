import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-connection-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="d-inline-flex align-items-center gap-1 small">
      <span class="rounded-circle" 
            [style.width]="'6px'" 
            [style.height]="'6px'"
            [class.bg-primary]="connected"
            [class.bg-warning]="!connected && reconnecting"
            [class.bg-danger]="!connected && !reconnecting">
      </span>
      {{ connected ? 'Live' : (reconnecting ? 'Reconnecting...' : 'Offline') }}
    </span>
  `
})
export class ConnectionStatusComponent {
  @Input() connected: boolean = true;
  @Input() reconnecting: boolean = false;
}