import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex align-items-center justify-content-between mb-4">
      <div>
        @if (backLink) {
          <a [routerLink]="backLink" class="btn btn-link text-primary p-0 me-2">
            <i class="bi bi-arrow-left"></i>
          </a>
        }
        <h4 class="d-inline text-primary mb-0">{{ title }}</h4>
        @if (subtitle) {
          <p class="text-medium mb-0 mt-1">{{ subtitle }}</p>
        }
      </div>
      <ng-content></ng-content>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() backLink: string = '';
}