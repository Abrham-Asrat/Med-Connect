import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  template: `
    <div class="d-flex min-vh-100">
      <!-- Desktop Sidebar -->
      <aside class="sidebar bg-primary d-none d-lg-flex flex-column">
        <div class="p-3 text-center border-bottom border-white border-opacity-25">
          <span class="h5 text-white mb-0"><i class="bi bi-heart-pulse me-2"></i>Med-Connect</span>
        </div>
        <div class="p-3 text-white text-center border-bottom border-white border-opacity-25">
          <div class="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
               style="width:56px;height:56px;font-size:20px;font-weight:700">
            {{ user()?.firstName?.charAt(0) || 'D' }}
          </div>
          <h6 class="mb-0">{{ user()?.firstName || 'Doctor' }}</h6>
          <small class="text-warning"><i class="bi bi-shield-check me-1"></i>Verified</small>
        </div>
        <nav class="nav flex-column p-3 flex-grow-1">
          <a routerLink="/doctor/dashboard" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3"><i class="bi bi-house-door me-2"></i>Dashboard</a>
          <a routerLink="/doctor/schedule" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3"><i class="bi bi-calendar-week me-2"></i>Schedule</a>
          <a routerLink="/doctor/blog" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3"><i class="bi bi-pencil-square me-2"></i>Blog</a>
          <a routerLink="/doctor/chat" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3"><i class="bi bi-chat-dots me-2"></i>Messages</a>
          <a routerLink="/doctor/earnings" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mt-auto px-3"><i class="bi bi-wallet2 me-2"></i>Earnings</a>
        </nav>
        <div class="p-3 border-top border-white border-opacity-25">
          <button (click)="logout()" class="btn btn-outline-light btn-sm w-100"><i class="bi bi-box-arrow-right me-2"></i>Logout</button>
        </div>
      </aside>

      <div class="main-content flex-grow-1 d-flex flex-column">
        <nav class="navbar navbar-light bg-white shadow-sm px-3 py-2">
          <div class="d-flex align-items-center w-100">
            <button (click)="toggleSidebar()" class="btn btn-link text-primary d-lg-none p-0 me-2"><i class="bi bi-list fs-4"></i></button>
            <span class="h5 text-primary mb-0 d-lg-none">Med-Connect</span>
            <div class="ms-auto d-flex align-items-center gap-3">
              <app-notification-bell [count]="3"></app-notification-bell>
            </div>
          </div>
        </nav>
        <main class="flex-grow-1 bg-light"><router-outlet></router-outlet></main>
      </div>
    </div>

    @if (sidebarOpen()) {
      <div class="sidebar-overlay d-lg-none" (click)="toggleSidebar()">
        <aside class="sidebar bg-primary d-flex flex-column show" (click)="$event.stopPropagation()">
          <div class="p-3 text-center border-bottom border-white border-opacity-25">
            <span class="h5 text-white"><i class="bi bi-heart-pulse me-2"></i>Med-Connect</span>
          </div>
          <nav class="nav flex-column p-3 flex-grow-1">
            <a routerLink="/doctor/dashboard" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-house-door me-2"></i>Dashboard</a>
            <a routerLink="/doctor/schedule" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-calendar-week me-2"></i>Schedule</a>
            <a routerLink="/doctor/blog" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-pencil-square me-2"></i>Blog</a>
          </nav>
          <div class="p-3 border-top border-white border-opacity-25">
            <button (click)="logout()" class="btn btn-outline-light btn-sm w-100">Logout</button>
          </div>
        </aside>
      </div>
    }
  `
})
export class DoctorLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
  sidebarOpen = signal(false);
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  logout(): void { this.authService.logout(); }
}