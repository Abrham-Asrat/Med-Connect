import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-vh-100 d-flex flex-column bg-light">
      <!-- Auth Header -->
      <header class="bg-primary text-white py-3">
        <div class="container">
          <a routerLink="/" class="text-white text-decoration-none">
            <h5 class="mb-0"><i class="bi bi-heart-pulse me-2"></i>Med-Connect</h5>
          </a>
        </div>
      </header>

      <!-- Auth Content -->
      <main class="flex-grow-1 d-flex align-items-center justify-content-center p-4">
        <router-outlet></router-outlet>
      </main>

      <!-- Auth Footer -->
      <footer class="text-center py-3 text-medium" style="font-size: 13px;">
        <small>&copy; 2026 Med-Connect. All rights reserved.</small>
      </footer>
    </div>
  `
})
export class AuthLayoutComponent {}