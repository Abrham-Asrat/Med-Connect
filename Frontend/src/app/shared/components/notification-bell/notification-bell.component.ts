import { Component, Input, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationStoreService, StoredNotification } from '../../../core/services/notification-store.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dropdown">
      <!-- Bell Icon Button -->
      <button 
        class="btn btn-link text-dark position-relative p-1" 
        (click)="toggleDropdown()"
        type="button"
        aria-label="Notifications">
        <i class="bi bi-bell fs-5"></i>
        
        <!-- Unread Badge -->
        @if (unreadCount > 0) {
          <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger pulse-red"
                style="font-size: 0.65rem; padding: 0.25em 0.5em;">
            {{ unreadCount > 99 ? '99+' : unreadCount }}
          </span>
        }
      </button>

      <!-- Dropdown Panel -->
      @if (isOpen()) {
        <!-- Backdrop overlay -->
        <div class="position-fixed top-0 start-0 w-100 h-100" 
             style="z-index: 1040;" 
             (click)="toggleDropdown()">
        </div>
        
        <!-- Dropdown Menu -->
        <div class="dropdown-menu dropdown-menu-end shadow show position-absolute" 
             style="z-index: 1050; width: 340px; max-height: 450px; right: 0; top: 100%;">
          
          <!-- Header -->
          <div class="dropdown-header d-flex justify-content-between align-items-center bg-light rounded-top">
            <span class="fw-bold text-primary">Notifications</span>
            @if (unreadCount > 0) {
              <small class="text-primary" style="cursor: pointer;" (click)="markAllRead()">
                Mark all read
              </small>
            }
          </div>
          
          <div style="max-height: 350px; overflow-y: auto;">
            @for (notif of latestNotifications(); track notif.id) {
              <div 
                class="dropdown-item border-bottom py-2 px-3"
                style="cursor: pointer;"
                [class.bg-light]="!notif.read"
                (click)="markRead(notif.id)">
                <div class="d-flex gap-2">
                  <!-- Icon -->
                  <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 mt-1"
                       style="width: 32px; height: 32px;"
                       [class.bg-primary-light]="notif.type === 'appointment'"
                       [class.bg-warning-light]="notif.type === 'review'"
                       [class.bg-secondary-light]="notif.type === 'message'"
                       [class.bg-danger-light]="notif.type === 'system'">
                    <i class="bi"
                       [class.bi-calendar-check]="notif.type === 'appointment'"
                       [class.bi-chat-dots]="notif.type === 'message'"
                       [class.bi-star]="notif.type === 'review'"
                       [class.bi-bell]="notif.type === 'system'"
                       [class.bi-wallet2]="notif.type === 'payment'"
                       [class.text-primary]="notif.type === 'appointment'"
                       [class.text-secondary]="notif.type === 'message'"
                       [class.text-warning-dark]="notif.type === 'review'"
                       [class.text-danger]="notif.type === 'system'"></i>
                  </div>
                  
                  <div class="flex-grow-1 min-width-0">
                    <div class="d-flex justify-content-between">
                      <small class="fw-bold text-truncate">{{ notif.title }}</small>
                      @if (!notif.read) {
                        <span class="badge bg-primary rounded-pill flex-shrink-0 ms-1" style="font-size: 0.6rem;">New</span>
                      }
                    </div>
                    <small class="text-medium d-block text-truncate">{{ notif.message }}</small>
                    <small class="text-medium" style="font-size: 11px;">
                      {{ notif.timestamp | date:'shortTime' }}
                    </small>
                  </div>
                </div>
              </div>
            }

            <!-- Empty State -->
            @if (latestNotifications().length === 0) {
              <div class="text-center py-4">
                <i class="bi bi-bell-slash text-primary" style="font-size: 32px; opacity: 0.3;"></i>
                <p class="text-medium mt-2 mb-0">No notifications yet</p>
              </div>
            }
          </div>
          
          <!-- Footer -->
          <div class="dropdown-divider m-0"></div>
          <div class="text-center py-2">
            <a routerLink="/patient/notifications" 
               class="text-primary small text-decoration-none" 
               (click)="toggleDropdown()">
              <i class="bi bi-arrow-right me-1"></i>View All Notifications
            </a>
          </div>
          
        </div>
      }
    </div>
  `,
  styles: [`
    .dropdown { position: relative; display: inline-block; }
    .dropdown-item:hover { background-color: #E8F5EC; }
    .pulse-red {
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { box-shadow: 0 0 0 0 rgba(218, 18, 26, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(218, 18, 26, 0); }
      100% { box-shadow: 0 0 0 0 rgba(218, 18, 26, 0); }
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private store = inject(NotificationStoreService);
  private subscription!: Subscription;

  @Input() count: number = 0;
  
  isOpen = signal(false);
  unreadCount = 0;
  latestNotifications = signal<StoredNotification[]>([]);

  ngOnInit(): void {
    this.updateNotifications();
    
    this.subscription = this.signalRService.notificationReceived$.subscribe(notification => {
      this.store.addNotification(notification);
      this.updateNotifications();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
  }

  markRead(id: string): void {
    this.store.markAsRead(id);
    this.updateNotifications();
  }

  markAllRead(): void {
    this.store.markAllAsRead();
    this.updateNotifications();
  }

  private updateNotifications(): void {
    this.latestNotifications.set(this.store.getLatest(10));
    this.unreadCount = this.store.unreadCount();
  }
}