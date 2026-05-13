import { Injectable, signal, inject } from '@angular/core';
import { SignalRNotification } from './signalr.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface StoredNotification extends SignalRNotification {
  id: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationStoreService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  // Store all notifications in a signal
  notifications = signal<StoredNotification[]>([]);

  // Load initial notifications from Database
  loadInitialNotifications(): void {
    // Skip if not authenticated — avoids a 401 on layout init before the token is ready
    if (!this.authService.getToken()) return;

    this.http.get(`${this.apiUrl}/Notification/me`).subscribe({
      next: (response: any) => {
        const data = response?.data || [];
        const parsedNotifs = data.map((n: any) => {
          let mappedType = 'system';
          switch (n.notificationType) {
            case 0: case 'Payment': mappedType = 'payment'; break;
            case 1: case 'Comment': case 3: case 'Chat': mappedType = 'message'; break;
            case 2: case 'Appointment': mappedType = 'appointment'; break;
          }
          return {
            id: n.notificationId || n.id,
            type: mappedType,
            title: mappedType.charAt(0).toUpperCase() + mappedType.slice(1) + ' Notification',
            message: n.message,
            timestamp: n.createdAt || new Date().toISOString(),
            read: n.isRead
          };
        });
        this.notifications.set(parsedNotifs);
      },
      error: err => {
        // 401 is expected when the component renders before auth is ready — suppress it
        if (err?.status !== 401) {
          console.error('Failed to load notifications', err);
        }
      }
    });
  }

  // Get unread count
  unreadCount(): number {
    return this.notifications().filter(n => !n.read).length;
  }

  // Add a new notification (real-time from SignalR)
  addNotification(notification: SignalRNotification): void {
    const storedNotif: StoredNotification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false
    };

    this.notifications.update(notifs => [storedNotif, ...notifs]);

    // Keep max 100 notifications to avoid memory issues
    if (this.notifications().length > 100) {
      this.notifications.update(notifs => notifs.slice(0, 100));
    }

    // Optional: Play notification sound
    this.playSound();
  }

  // Mark a single notification as read
  markAsRead(id: string): void {
    this.http.put(`${this.apiUrl}/Notification/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => n.id === id ? { ...n, read: true } : n)
        );
      },
      error: err => console.error('Failed to mark read', err)
    });
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/Notification/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update(notifs =>
          notifs.map(n => ({ ...n, read: true }))
        );
      },
      error: err => console.error('Failed to mark all read', err)
    });
  }

  // Delete a single notification
  deleteNotification(id: string): void {
    this.notifications.update(notifs =>
      notifs.filter(n => n.id !== id)
    );
  }

  // Clear all notifications
  clearAll(): void {
    this.notifications.set([]);
  }

  // Get notifications by type
  getByType(type: string): StoredNotification[] {
    return this.notifications().filter(n => n.type === type);
  }

  // Get only unread notifications
  getUnread(): StoredNotification[] {
    return this.notifications().filter(n => !n.read);
  }

  // Get latest N notifications
  getLatest(count: number = 5): StoredNotification[] {
    return this.notifications().slice(0, count);
  }

  // Play notification sound
  private playSound(): void {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4B/f3+AgH9/f39/f39/gIB/f39/f39/gIB/f4CAf39/gH9/f39/f39/gIB/f39/f39/gIB/f39/gH9/f4B/f3+AgH9/gH9/f39/f39/gH9/f39/f39/gH9/f39/f3+AgH+AgH9/f4B/f39/gH9/f39/f39/gIB/f39/f3+AgH9/gH9/f3+AgH9/gH9/f3+AgH+AgH9/f4B/f39/gH+AgH9/f3+AgH9/gH9/f39/f3+AgH9/gIB/f39/gH+AgH9/f4B/f39/f39/f39/f39/f3+AgH9/f39/f39/gIB/f39/f39/gH9/f39/f39/f4B/f39/f39/gH+AgH9/f39/f39/gIB/f39/f3+AgH+AgH9/f4B/f39/gH+AgH9/f3+AgH9/gIB/f39/gIB/f39/gH+AgH9/f39/f3+AgH+AgH9/f39/f3+AgH+AgH+AgH9/f4B/f3+AgIB/f39/f3+AgH+AgIB/f3+AgH+AgH9/f4B/f3+AgH+AgH9/f4B/f3+AgH+AgH9/f4B/f3+AgIB/f3+AgH+AgH+AgH9/f4CAAAAA');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Browser may block autoplay - that's ok
      });
    } catch {
      // Silent fail if audio not supported
    }
  }
}