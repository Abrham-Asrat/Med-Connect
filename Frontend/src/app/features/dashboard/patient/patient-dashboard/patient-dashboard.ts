import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-patient-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './patient-dashboard.html',
  styles: [`
    .welcome-card { background: linear-gradient(135deg, #078930, #056B24); }
    .stat-card { border-left: 4px solid #078930; transition: all 0.2s ease; }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(7,137,48,0.12); }
    .stat-card.pending { border-left-color: #FCD116; }
    .appointment-card { border-left: 4px solid #078930; transition: all 0.2s ease; }
    .appointment-card.pending { border-left-color: #FCD116; }
    .appointment-card:hover { box-shadow: 0 4px 24px rgba(7,137,48,0.12); }
    .doctor-card { transition: all 0.2s ease; cursor: pointer; }
    .doctor-card:hover { transform: translateY(-4px); box-shadow: 0 4px 24px rgba(7,137,48,0.12); }
    .quick-action { transition: all 0.2s ease; cursor: pointer; }
    .quick-action:hover { background: #E8F5EC; transform: translateY(-2px); }
    .mood-btn { transition: all 0.2s ease; }
    .mood-btn:hover, .mood-btn.active { background: rgba(255,255,255,0.3); }
  `]
})
export class PatientDashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  upcomingAppointments = signal(3);
  completedAppointments = signal(21);
  totalAppointments = signal(24);

  appointments = signal([
    {
      id: 'APT-001', doctorName: 'Dr. Sarah Johnson', specialty: 'Cardiology',
      date: 'May 15, 2026', time: '2:30 PM', type: 'Online' as const,
      status: 'confirmed' as const, meetingLink: 'https://video.medconnect.com/abc123'
    },
    {
      id: 'APT-002', doctorName: 'Dr. Abebe Kebede', specialty: 'Neurology',
      date: 'May 18, 2026', time: '10:00 AM', type: 'InPerson' as const,
      status: 'confirmed' as const
    },
    {
      id: 'APT-003', doctorName: 'Dr. Tirunesh Desta', specialty: 'Dermatology',
      date: 'May 22, 2026', time: '3:00 PM', type: 'Online' as const,
      status: 'pending' as const
    }
  ]);

  recommendedDoctors = signal([
    { id: '1', name: 'Dr. Sarah Johnson', specialty: 'Cardiology', rating: 4.8, reviewCount: 124, fee: 500, nextAvailable: 'Today, 4:30 PM' },
    { id: '2', name: 'Dr. Yonas Tadesse', specialty: 'Pediatrics', rating: 4.9, reviewCount: 89, fee: 400, nextAvailable: 'Tomorrow, 9:00 AM' },
    { id: '3', name: 'Dr. Meseret Alemu', specialty: 'Gynecology', rating: 4.7, reviewCount: 201, fee: 600, nextAvailable: 'May 16, 1:00 PM' }
  ]);

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  getStatusClass(status: string): string {
    return status === 'confirmed' ? 'bg-primary-light text-primary' : 'bg-warning-light text-warning-dark';
  }

  joinCall(link: string): void { window.open(link, '_blank'); }
}