import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-ai-floating-button',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <a routerLink="/patient/ai-assistant" 
       class="btn btn-danger rounded-circle shadow-lg d-flex align-items-center justify-content-center position-fixed border-0"
       style="width: 60px; height: 60px; bottom: 30px; right: 30px; z-index: 9999; font-size: 24px;"
       title="AI Health Assistant">
      <i class="bi bi-stars text-white"></i>
    </a>
  `
})
export class AiFloatingButtonComponent {}