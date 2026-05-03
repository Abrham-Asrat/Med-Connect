import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styles: [`
    .notification-item { border-left: 4px solid #078930; transition: all 0.2s; }
    .notification-item:hover { background: #E8F5EC; }
    .notification-item.unread { background: #F8FFF8; }
    .notification-item.message { border-left-color: #007BFF; }
    .notification-item.payment { border-left-color: #FCD116; }
    .notification-item.system { border-left-color: #DA121A; }
  `]
})
export class NotificationsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  patientId = localStorage.getItem('patientId') || '';
  isLoading = signal(false);

  notifications = signal<any[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading.set(true);

    this.http.get(`${this.apiUrl}/Notification/me`).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || [];
        this.processNotifications(Array.isArray(data) ? data : []);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error fetching notifications:', error);
      }
    });
  }

  processNotifications(dbNotifications: any[]): void {
    const parsedNotifs = dbNotifications.map(n => {
      // Map Backend enum to local types
      let mappedType = 'system';
      let mappedIcon = 'bi-bell';

      switch (n.notificationType) {
        case 0: // Payment
        case 'Payment':
          mappedType = 'payment'; mappedIcon = 'bi-wallet2'; break;
        case 1: // Comment
        case 'Comment':
        case 3: // Chat
        case 'Chat':
          mappedType = 'message'; mappedIcon = 'bi-chat-dots'; break;
        case 2: // Appointment
        case 'Appointment':
          mappedType = 'appointment'; mappedIcon = 'bi-calendar-check'; break;
      }

      return {
        id: n.notificationId || n.id,
        type: mappedType,
        title: mappedType.charAt(0).toUpperCase() + mappedType.slice(1) + ' Notification',
        message: n.message,
        time: n.createdAt || new Date().toISOString(),
        read: n.isRead,
        icon: mappedIcon
      };
    });

    this.notifications.set(parsedNotifs);
    this.unreadCount.set(parsedNotifs.filter(notif => !notif.read).length);
  }

  markAsRead(id: string): void {
    this.http.put(`${this.apiUrl}/Notification/${id}/read`, {}).subscribe({
      next: () => {
        this.notifications.update(n => n.map(item =>
          item.id === id ? { ...item, read: true } : item
        ));
        this.unreadCount.update(c => Math.max(0, c - 1));
      },
      error: (err) => console.error('Failed to mark read', err)
    });
  }

  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/Notification/read-all`, {}).subscribe({
      next: () => {
        this.notifications.update(n => n.map(item => ({ ...item, read: true })));
        this.unreadCount.set(0);
      },
      error: (err) => console.error('Failed to mark all read', err)
    });
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'appointment': return 'notification-item';
      case 'message': return 'notification-item message';
      case 'payment': return 'notification-item payment';
      case 'system': return 'notification-item system';
      default: return 'notification-item';
    }
  }
}