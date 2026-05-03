import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationStoreService } from '../../../core/services/notification-store.service';

@Component({
  selector: 'app-patient-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NotificationBellComponent
  ],
  templateUrl: './patient-layout.component.html'
})
export class PatientLayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private store = inject(NotificationStoreService);
  private subscription!: Subscription;

  user = this.authService.currentUser;
  sidebarOpen = signal(false);
  unreadCount = 0;

  ngOnInit(): void {
    // Update notification count in real-time
    this.subscription = this.signalRService.notificationReceived$.subscribe(() => {
      this.store.addNotification({
        type: 'system',
        title: 'New Notification',
        message: 'You have a new notification',
        timestamp: new Date()
      });
      this.unreadCount = this.store.unreadCount();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout(true);
  }
}