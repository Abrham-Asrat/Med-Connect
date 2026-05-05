import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './doctor-dashboard.html',
  styles: [`
    .welcome-card { background: linear-gradient(135deg, #078930, #056B24); }
    .stat-card { border-left: 4px solid #078930; }
    .stat-card.pending { border-left-color: #FCD116; }
    .appointment-row { border-left: 4px solid #078930; transition: all 0.2s; }
    .appointment-row:hover { background: #E8F5EC; }
    .appointment-row.pending { border-left-color: #FCD116; }
  `]
})
export class DoctorDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = this.authService.currentUser;
  doctorId = localStorage.getItem('doctorId') || '';
  isLoading = signal(false);
  isOnline = signal(true);

  todayAppointments = signal(0);
  pendingConfirmations = signal(0);
  totalPatients = signal(0);
  completedToday = signal(0);

  appointments = signal<any[]>([]);

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    if (!this.doctorId) {
      this.doctorId = localStorage.getItem('doctorId') || '';
    }

    if (!this.doctorId) {
      console.log('No doctor ID found');
      return;
    }

    this.isLoading.set(true);

    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        const apps = Array.isArray(data) ? data : [];
        this.appointments.set(apps.slice(0, 10));

        // Calculate stats
        this.todayAppointments.set(apps.filter((a: any) =>
          a.status === 'Scheduled' || a.status === 'Confirmed'
        ).length);
        this.pendingConfirmations.set(apps.filter((a: any) =>
          a.status === 'Pending'
        ).length);
        this.completedToday.set(apps.filter((a: any) =>
          a.status === 'Completed'
        ).length);
        this.totalPatients.set(new Set(apps.map((a: any) => a.patientId)).size);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error:', error);
      }
    });
  }

  toggleOnline(): void {
    this.isOnline.update(v => !v);
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed': return 'bg-primary-light text-primary';
      case 'Pending': return 'bg-warning-light text-warning-dark';
      case 'Completed': return 'bg-success-light text-success';
      default: return 'bg-light text-medium';
    }
  }

  confirmAppointment(id: string): void {
    if (!id) return;
    this.isLoading.set(true);
    this.appointmentService.updateAppointment(id, { status: 'Confirmed' }).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error confirming:', err);
      }
    });
  }

  declineAppointment(id: string): void {
    if (!id) return;
    if (!confirm('Are you sure you want to decline this appointment?')) return;

    this.isLoading.set(true);
    this.appointmentService.updateAppointment(id, { status: 'Cancelled' }).subscribe({
      next: () => {
        this.loadAppointments();
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Error declining:', err);
      }
    });
  }
}