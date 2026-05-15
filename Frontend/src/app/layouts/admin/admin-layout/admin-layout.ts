import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationBellComponent],
  template: `
    <div class="d-flex min-vh-100">
      <aside class="sidebar bg-primary d-none d-lg-flex flex-column" [class.sidebar-collapsed]="desktopSidebarCollapsed()">
        <div class="p-3 d-flex align-items-center border-bottom border-white border-opacity-25" 
             [class.justify-content-between]="!desktopSidebarCollapsed()" 
             [class.flex-column]="desktopSidebarCollapsed()" 
             [class.gap-3]="desktopSidebarCollapsed()">
          
          <span class="h5 text-white mb-0 brand-text fw-bold text-truncate">
            <img src="favicon.png" alt="Logo" class="me-2 rounded-circle" style="width: 28px; height: 28px; object-fit: contain;">Admin
          </span>
          <img src="favicon.png" alt="Logo" class="text-white d-none rounded-circle" [class.d-block]="desktopSidebarCollapsed()" style="width: 32px; height: 32px; object-fit: contain;">
          
          <button (click)="toggleDesktopSidebar()" class="btn btn-sm text-white d-none d-lg-flex align-items-center justify-content-center rounded-circle transition-all hover-lift-sm" style="background: rgba(255,255,255,0.15); width: 30px; height: 30px;">
            <i class="bi" [class.bi-chevron-left]="!desktopSidebarCollapsed()" [class.bi-chevron-right]="desktopSidebarCollapsed()" style="margin: 0 !important; font-size: 1rem;"></i>
          </button>
        </div>
        <div class="p-3 text-white text-center border-bottom border-white border-opacity-25">
          @if (user()?.profilePicture) {
            <img [src]="getProfilePicUrl(user()?.profilePicture)" alt="Profile" 
                 class="rounded-circle mb-2 object-fit-cover shadow-sm border border-2 border-white border-opacity-25"
                 style="width:56px;height:56px;">
          } @else {
            <div class="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
                 style="width:56px;height:56px;font-size:20px;font-weight:700">
              {{ user()?.firstName?.charAt(0) || 'A' }}{{ user()?.lastName?.charAt(0) || 'D' }}
            </div>
          }
          <h6 class="mb-0 profile-name">{{ user()?.firstName || 'Admin' }}</h6>
          <small class="text-warning profile-role">Super Admin</small>
        </div>
        <nav class="nav flex-column p-3 flex-grow-1">
          <a routerLink="/admin/dashboard" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-speedometer2 me-2"></i><span class="nav-text">Dashboard</span></a>
          <a routerLink="/admin/verification" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-person-check me-2"></i><span class="nav-text">Approvals</span></a>
          <a routerLink="/admin/doctors" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-people me-2"></i><span class="nav-text">Doctors</span></a>
          <a routerLink="/admin/patients" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-people-fill me-2"></i><span class="nav-text">Patients</span></a>
          <a routerLink="/admin/finance" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-graph-up me-2"></i><span class="nav-text">Finance</span></a>
          <a routerLink="/admin/moderation" routerLinkActive="bg-warning text-dark" class="nav-link text-white rounded mb-1 px-3 d-flex align-items-center"><i class="bi bi-shield me-2"></i><span class="nav-text">Moderation</span></a>
        </nav>
        <div class="p-3 border-top border-white border-opacity-25">
          <button (click)="logout()" class="btn btn-outline-light btn-sm w-100 btn-logout d-flex justify-content-center align-items-center"><i class="bi bi-box-arrow-right me-2"></i><span>Logout</span></button>
        </div>
      </aside>

      <div class="main-content flex-grow-1 d-flex flex-column" [class.sidebar-collapsed]="desktopSidebarCollapsed()">
        <nav class="navbar navbar-light sticky-top bg-white shadow-sm px-3 py-2" style="z-index: 1030;">
          <div class="d-flex align-items-center w-100">
            <button (click)="toggleSidebar()" class="btn btn-link text-primary d-lg-none p-0 me-2"><i class="bi fs-4" [class.bi-list]="!sidebarOpen()" [class.bi-x-lg]="sidebarOpen()"></i></button>
            <span class="h5 text-primary mb-0 d-lg-none">
              <img src="favicon.png" alt="Logo" class="me-2 rounded-circle" style="width: 24px; height: 24px;">Admin Panel
            </span>
            <div class="ms-auto d-flex align-items-center gap-3">
              <a routerLink="/admin/settings" class="btn btn-link p-0 text-primary" title="Settings">
                <i class="bi bi-gear fs-5"></i>
              </a>
              <app-notification-bell [count]="12"></app-notification-bell>
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
        <span class="h5 text-white mb-0"><img src="favicon.png" alt="Logo" class="me-2 rounded-circle" style="width: 24px; height: 24px;">Admin</span>
        <button class="btn btn-link text-white p-0" (click)="toggleSidebar()"><i class="bi bi-x-lg fs-5"></i></button>
      </div>
      <div class="p-3 text-white text-center border-bottom border-white border-opacity-25">
         @if (user()?.profilePicture) {
            <img [src]="getProfilePicUrl(user()?.profilePicture)" alt="Profile" 
                 class="rounded-circle mb-2 object-fit-cover shadow-sm border border-2 border-white border-opacity-25"
                 style="width:56px;height:56px;">
          } @else {
            <div class="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center mb-2"
                 style="width:56px;height:56px;font-size:20px;font-weight:700">AD</div>
          }
          <h6 class="mb-0">{{ user()?.firstName || 'Admin' }}</h6>
      </div>
      <nav class="nav flex-column p-3 flex-grow-1">
        <a routerLink="/admin/dashboard" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-speedometer2 me-2"></i>Dashboard</a>
        <a routerLink="/admin/verification" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-person-check me-2"></i>Doctor Approvals</a>
        <a routerLink="/admin/doctors" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-people me-2"></i>Doctors</a>
        <a routerLink="/admin/patients" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-people-fill me-2"></i>Patients</a>
        <a routerLink="/admin/finance" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-graph-up me-2"></i>Finance</a>
        <a routerLink="/admin/moderation" (click)="toggleSidebar()" class="nav-link text-white rounded mb-1"><i class="bi bi-shield me-2"></i>Moderation</a>
      </nav>
      <div class="p-3 border-top border-white border-opacity-25">
        <button (click)="logout()" class="btn btn-outline-light btn-sm w-100">Logout</button>
      </div>
    </aside>
  </div>
}
  `
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;
  sidebarOpen = signal(false);
  desktopSidebarCollapsed = signal(false);
  toggleSidebar(): void { this.sidebarOpen.update(v => !v); }
  toggleDesktopSidebar(): void { this.desktopSidebarCollapsed.update(v => !v); }
  logout(): void { this.authService.logout(true); }

  getProfilePicUrl(pic: string | undefined): string {
    if (!pic) return 'assets/images/default-avatar.png';
    return pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`;
  }
}