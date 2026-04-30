import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn btn-link text-dark position-relative p-1" (click)="onClick()">
      <i class="bi bi-bell fs-5"></i>
      @if (count > 0) {
        <span 
          class="position-absolute top-0 start-100 translate-middle badge rounded-pill"
          [class.bg-warning]="!urgent"
          [class.bg-danger]="urgent"
          [class.pulse-yellow]="!urgent"
          [class.pulse-red]="urgent"
        >
          {{ count > 99 ? '99+' : count }}
          <span class="visually-hidden">unread notifications</span>
        </span>
      }
    </button>
  `,
  styles: [`
    .badge {
      font-size: 0.65rem;
      padding: 0.25em 0.5em;
    }
  `]
})
export class NotificationBellComponent {
  @Input() count: number = 0;
  @Input() urgent: boolean = false;
  @Output() clicked = new EventEmitter<void>();

  onClick(): void {
    this.clicked.emit();
  }
}