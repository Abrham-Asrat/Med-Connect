import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
    selector: 'app-theme-toggle',
    standalone: true,
    imports: [CommonModule],
    template: `
    <button 
       class="btn btn-dark shadow-sm rounded-circle d-flex align-items-center justify-content-center p-0 ms-3 transition-all" 
       [class.btn-light]="!themeService.isDarkTheme()" 
       [class.text-dark]="!themeService.isDarkTheme()"
       [class.btn-dark]="themeService.isDarkTheme()"
       style="width: 40px; height: 40px; border: 1px solid rgba(0,0,0,0.1);" 
       (click)="themeService.toggleTheme()"
       title="Toggle Dark Mode">
       
       <i class="bi fs-5 transition-all" 
          [class.bi-moon-stars-fill]="!themeService.isDarkTheme()" 
          [class.bi-sun-fill]="themeService.isDarkTheme()"
          [class.text-primary]="!themeService.isDarkTheme()"
          [class.text-warning]="themeService.isDarkTheme()">
       </i>
    </button>
  `,
    styles: [`
    button {
       transition: transform 0.2s ease-in-out, background-color 0.3s ease;
    }
    button:hover {
       transform: rotate(15deg) scale(1.1);
    }
  `]
})
export class ThemeToggleComponent {
    themeService = inject(ThemeService);
}
