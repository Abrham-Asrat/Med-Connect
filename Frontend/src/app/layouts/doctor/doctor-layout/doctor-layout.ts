import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
  selector: 'app-doctor-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent, ThemeToggleComponent],
  template: `
    <div class="d-flex min-vh-100">
      <!-- Desktop Sidebar -->
      <aside class="sidebar bg-primary d-none d-lg-flex flex-column" [class.sidebar-collapsed]="desktopSidebarCollapsed()">
        <div class="p-3 d-flex align-items-center border-bottom border-white border-opacity-25" 
             [class.justify-content-between]="!desktopSidebarCollapsed()" 
             [class.flex-column]="desktopSidebarCollapsed()" 
             [class.gap-3]="desktopSidebarCollapsed()">
          
          <span class="h5 text-white mb-0 brand-text fw-bold text-truncate">
            <i class="bi bi-heart-pulse me-2"></i>Med-Connect
          </span>
          <i class="bi bi-heart-pulse text-white fs-3 d-none" [class.d-block]="desktopSidebarCollapsed()"></i>
          
          <button (click)="toggleDesktopSidebar()" class="btn btn-sm text-white d-none d-lg-flex align-items-center justify-content-center rounded-circle transition-all hover-lift-sm" style="background: rgba(255,255,255,0.15); width: 30px; height: 30px;">
            <i class="bi" [class.bi-chevron-left]="!desktopSidebarCollapsed()" [class.bi-chevron-right]="desktopSidebarCollapsed()" style="margin: 0 !important; font-size: 1rem;"></i>
          </button>
        </div>
        <div class="p-3 text-white text-center border-bottom border-white border-opacity-25">
          <div class="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
               style="width:56px;height:56px;font-size:20px;font-weight:700">
            {{ user()?.firstName?.charAt(0) || 'D' }}
          </div>
          <h6 class="mb-0 profile-name">{{ user()?.firstName || 'Doctor' }}</h6>
          <small class="text-warning profile-role"><i class="bi bi-shield-check me-1"></i>Verified</small>
        </div>
        <nav class="nav flex-column p-3 flex-grow-1">
          <a routerLink="/doctor/dashboard" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-house-door me-2"></i><span class="nav-text">Dashboard</span></a>
          <a routerLink="/doctor/schedule" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-calendar-week me-2"></i><span class="nav-text">Schedule</span></a>
          <a routerLink="/doctor/chat" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-chat-dots me-2"></i><span class="nav-text">Messages</span></a>
          <a routerLink="/doctor/earnings" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-wallet2 me-2"></i><span class="nav-text">Earnings</span></a>
          <div class="nav-divider my-2 border-bottom border-white border-opacity-10"></div>
          
          <a routerLink="/doctor/blog" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-pencil-square me-2"></i><span class="nav-text">My Blogs</span></a>
          <a routerLink="/doctor/health-blogs" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-journal-text me-2"></i><span class="nav-text">Public Blogs</span></a>

          <div class="nav-divider my-2 border-bottom border-white border-opacity-10"></div>
          <a routerLink="/doctor/settings" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-gear me-2"></i><span class="nav-text">Settings</span></a>
          <a routerLink="/doctor/about" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-info-circle me-2"></i><span class="nav-text">About Med-Connect</span></a>
          <a routerLink="/doctor/contact" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-headset me-2"></i><span class="nav-text">Help & Support</span></a>
        </nav>
        <div class="p-3 border-top border-white border-opacity-25">
          <button (click)="logout()" class="btn btn-outline-light btn-sm w-100 btn-logout d-flex justify-content-center align-items-center"><i class="bi bi-box-arrow-right me-2"></i><span>Logout</span></button>
        </div>
      </aside>

      <div class="main-content flex-grow-1 d-flex flex-column" [class.sidebar-collapsed]="desktopSidebarCollapsed()">
        <nav class="navbar navbar-light sticky-top bg-white shadow-sm px-3 py-2" style="z-index: 1030;">
          <div class="d-flex align-items-center w-100">
            <button (click)="toggleSidebar()" class="btn btn-link text-primary d-lg-none p-0 me-2"><i class="bi fs-4" [class.bi-list]="!sidebarOpen()" [class.bi-x-lg]="sidebarOpen()"></i></button>
            <span class="h5 text-primary mb-0 d-lg-none">Med-Connect</span>
            <div class="ms-auto d-flex align-items-center gap-3">
              <a routerLink="/doctor/chat" class="btn btn-link position-relative p-0 text-decoration-none">
                <i class="bi bi-chat-dots fs-5 text-primary"></i>
                <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-light" style="font-size: 0.55rem; padding: 0.25rem 0.4rem;">5</span>
              </a>
              <a routerLink="/doctor/settings" class="btn btn-link p-0 text-primary" title="Settings">
                <i class="bi bi-gear fs-5"></i>
              </a>
              <app-theme-toggle></app-theme-toggle>
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
      <div class="p-3 text-center border-bottom border-white border-opacity-25 d-flex justify-content-between align-items-center">
        <span class="h5 text-white mb-0"><i class="bi bi-heart-pulse me-2"></i>Med-Connect</span>
        <button class="btn btn-link text-white p-0" (click)="toggleSidebar()"><i class="bi bi-x-lg fs-5"></i></button>
      </div>
      <nav class="nav flex-column p-3 flex-grow-1">
        <a routerLink="/doctor/dashboard" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-house-door me-2"></i>Dashboard</a>
        <a routerLink="/doctor/schedule" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-calendar-week me-2"></i>Schedule</a>
        <a routerLink="/doctor/chat" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-chat-dots me-2"></i>Messages</a>
        <a routerLink="/doctor/earnings" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-wallet2 me-2"></i>Earnings</a>
        
        <div class="nav-divider my-2 border-bottom border-white border-opacity-10"></div>
        <a routerLink="/doctor/blog" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-pencil-square me-2"></i>My Blogs</a>
        <a routerLink="/doctor/health-blogs" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-journal-text me-2"></i>Public Blogs</a>

        <div class="nav-divider my-2 border-bottom border-white border-opacity-10"></div>
        <a routerLink="/doctor/settings" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-gear me-2"></i>Settings</a>
        <a routerLink="/doctor/about" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-info-circle me-2"></i>About Us</a>
        <a routerLink="/doctor/contact" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-headset me-2"></i>Contact Support</a>
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
  desktopSidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  toggleDesktopSidebar(): void { this.desktopSidebarCollapsed.update(v => !v); }
  logout(): void { this.authService.logout(true); }
}