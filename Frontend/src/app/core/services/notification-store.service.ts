import { Injectable, signal } from '@angular/core';
import { SignalRNotification } from './signalr.service';

export interface StoredNotification extends SignalRNotification {
  id: string;
  read: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationStoreService {
  
  // Store all notifications in a signal
  notifications = signal<StoredNotification[]>([]);

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
    this.notifications.update(notifs =>
      notifs.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }

  // Mark all notifications as read
  markAllAsRead(): void {
    this.notifications.update(notifs =>
      notifs.map(n => ({ ...n, read: true }))
    );
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