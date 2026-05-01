import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';

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

  patientId = localStorage.getItem('patientId') || '';
  isLoading = signal(false);
  
  notifications = signal<any[]>([]);
  unreadCount = signal(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    if (!this.patientId) return;

    this.isLoading.set(true);

    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const appointments = response?.data || [];
        this.generateNotifications(Array.isArray(appointments) ? appointments : []);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error:', error);
      }
    });
  }

  generateNotifications(appointments: any[]): void {
    const notifs: any[] = [];

    // Welcome notification
    notifs.push({
      id: 'welcome',
      type: 'system',
      title: 'Welcome to Med-Connect! 🎉',
      message: 'Your account has been created successfully. Start by finding a doctor.',
      time: new Date().toISOString(),
      read: false,
      icon: 'bi-heart-pulse'
    });

    // Appointment notifications
    appointments.forEach((apt: any) => {
      if (apt.status === 'Scheduled' || apt.status === 'Confirmed') {
        notifs.push({
          id: apt.appointmentId,
          type: 'appointment',
          title: 'Appointment Booked',
          message: `Your ${apt.appointmentType || 'Virtual'} appointment on ${apt.appointmentDate} at ${apt.appointmentTime} is confirmed.`,
          time: apt.createdAt || new Date().toISOString(),
          read: false,
          icon: 'bi-calendar-check'
        });
      }
    });

    // Add some sample notifications
    notifs.push({
      id: 'tip-1',
      type: 'message',
      title: 'Health Tip',
      message: 'Remember to stay hydrated! Drink at least 8 glasses of water daily.',
      time: new Date().toISOString(),
      read: true,
      icon: 'bi-lightbulb'
    });

    notifs.push({
      id: 'payment-1',
      type: 'payment',
      title: 'Payment Information',
      message: 'Payments are processed securely through Chapa. Keep your payment details updated.',
      time: new Date().toISOString(),
      read: true,
      icon: 'bi-wallet2'
    });

    this.notifications.set(notifs);
    this.unreadCount.set(notifs.filter(n => !n.read).length);
  }

  markAsRead(id: string): void {
    this.notifications.update(n => n.map(item => 
      item.id === id ? { ...item, read: true } : item
    ));
    this.unreadCount.update(c => Math.max(0, c - 1));
  }

  markAllAsRead(): void {
    this.notifications.update(n => n.map(item => ({ ...item, read: true })));
    this.unreadCount.set(0);
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