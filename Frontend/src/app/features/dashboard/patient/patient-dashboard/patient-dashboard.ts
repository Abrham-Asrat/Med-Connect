import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.html',
  styleUrls: ['./patient-dashboard.scss']
})
export class PatientDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = this.authService.currentUser;
  isLoading = signal(false);
  upcomingAppointments = signal(0);
  completedAppointments = signal(0);
  totalAppointments = signal(0);
  appointments = signal<any[]>([]);

  ngOnInit(): void {
    const patientId = localStorage.getItem('patientId');
    console.log('Dashboard - Patient ID:', patientId);

    if (patientId) {
      this.loadAppointments(patientId);
    }
  }

  loadAppointments(patientId: string): void {
    this.isLoading.set(true);
    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        const list = Array.isArray(data) ? data : [];
        this.appointments.set(list.slice(0, 5));
        this.totalAppointments.set(list.length);
        this.upcomingAppointments.set(list.filter((a: any) =>
          a.status === 'Scheduled' || a.status === 'Confirmed'
        ).length);
        this.completedAppointments.set(list.filter((a: any) =>
          a.status === 'Completed'
        ).length);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading appointments:', error);
      }
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning / እንደምን አደሩ';
    if (hour < 17) return 'Good Afternoon / እንደምን ዋሉ';
    return 'Good Evening / እንደምን አመሹ';
  }

  getStatusClass(status: string): string {
    return status === 'Scheduled' || status === 'Confirmed'
      ? 'bg-primary-light text-primary'
      : 'bg-warning-light text-warning-dark';
  }

  getInitials(first: string, last: string): string {
    if (!first && !last) return '?';
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  }


  showEmergency = signal(false);
  emergencyContacts = signal([
    { name: 'Emergency (Ambulance)', phone: '907', icon: 'bi-telephone-plus' },
    { name: 'Red Cross Ethiopia', phone: '911', icon: 'bi-heart' },
    { name: 'St. Paul\'s Hospital', phone: '+251-111-234567', icon: 'bi-hospital' },
    { name: 'Black Lion Hospital', phone: '+251-111-765432', icon: 'bi-hospital' },
  ]);
}