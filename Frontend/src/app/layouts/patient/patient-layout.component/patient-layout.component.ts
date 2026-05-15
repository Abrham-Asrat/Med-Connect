import { Component, inject, signal, OnInit, OnDestroy, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { NotificationBellComponent } from '../../../shared/components/notification-bell/notification-bell.component';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationStoreService } from '../../../core/services/notification-store.service';
import { ChatService } from '../../../core/services/chat.service';

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
  private chatService = inject(ChatService);
  private subscription!: Subscription;
  private chatSub: Subscription | undefined;

  user = this.authService.currentUser;
  sidebarOpen = signal(false);
  desktopSidebarCollapsed = signal(false);
  unreadCount = 0;
  unreadMessages = signal(0);

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

    // Track unread chat messages via SignalR
    this.chatService.startConnection().then(() => {
      this.chatSub = this.chatService.messageReceived$.subscribe(() => {
        this.unreadMessages.update(n => n + 1);
      });
    }).catch(() => { /* silent — chat badge just won't update in real-time */ });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
    this.chatSub?.unsubscribe();
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleDesktopSidebar(): void {
    this.desktopSidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout(true);
  }

  getProfilePicUrl(pic: string | undefined): string {
    if (!pic) return 'assets/images/default-avatar.png';
    return pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`;
  }
}