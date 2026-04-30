import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-dashboard.html',
  styles: [`
    .welcome-card { background: linear-gradient(135deg, #078930, #056B24); }
    .stat-card { border-left: 4px solid #078930; transition: all 0.2s; }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(7,137,48,0.12); }
    .stat-card.pending { border-left-color: #FCD116; }
    .stat-card.earnings { border-left-color: #007BFF; }
    .appointment-row { border-left: 4px solid #078930; transition: all 0.2s; }
    .appointment-row.pending { border-left-color: #FCD116; }
    .appointment-row:hover { background: #E8F5EC; }
    .patient-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }
    .quick-action { transition: all 0.2s; cursor: pointer; }
    .quick-action:hover { background: #E8F5EC; transform: translateY(-2px); }
    .online-toggle { width: 60px; height: 30px; }
  `]
})
export class DoctorDashboardComponent {
  private authService = inject(AuthService);
  user = this.authService.currentUser;

  // Online status
  isOnline = signal(true);
  
  // Stats
  todayAppointments = signal(8);
  pendingConfirmations = signal(3);
  totalPatients = signal(245);
  monthlyEarnings = signal(45000);
  thisMonthAppointments = signal(142);
  patientSatisfaction = signal(98);

  // Today's Schedule
  todaySchedule = signal([
    { id:'1', patient:'Abebe Tesfaye', time:'9:00 AM', type:'In-Person', status:'completed', notes:'Follow-up on blood pressure' },
    { id:'2', patient:'Meron Haile', time:'10:30 AM', type:'Online', status:'in-progress', notes:'Initial consultation' },
    { id:'3', patient:'Dawit Mekonnen', time:'2:00 PM', type:'Online', status:'confirmed', notes:'Test results review' },
    { id:'4', patient:'Sara Tadesse', time:'3:30 PM', type:'In-Person', status:'pending', notes:'Annual check-up' },
    { id:'5', patient:'Henok Girma', time:'4:30 PM', type:'Online', status:'confirmed', notes:'Medication review' },
  ]);

  // Pending Requests
  pendingRequests = signal([
    { id:'1', patient:'Kidist Alemu', requestedTime:'Tomorrow, 11:00 AM', type:'Online', reason:'Skin rash consultation' },
    { id:'2', patient:'Bereket Yohannes', requestedTime:'May 18, 3:00 PM', type:'In-Person', reason:'Back pain follow-up' },
    { id:'3', patient:'Tigist Haile', requestedTime:'May 19, 9:30 AM', type:'Online', reason:'Pregnancy check-up' },
  ]);

  // Upcoming Week
  weeklyStats = signal([
    { day:'Mon', appointments:6, available:2 },
    { day:'Tue', appointments:8, available:0 },
    { day:'Wed', appointments:5, available:3 },
    { day:'Thu', appointments:7, available:1 },
    { day:'Fri', appointments:4, available:4 },
    { day:'Sat', appointments:3, available:5 },
    { day:'Sun', appointments:0, available:0 },
  ]);

  // Recent Patients
  recentPatients = signal([
    { id:'1', name:'Abebe Tesfaye', lastVisit:'Today', condition:'Hypertension', avatar:'AT' },
    { id:'2', name:'Meron Haile', lastVisit:'Today', condition:'Migraine', avatar:'MH' },
    { id:'3', name:'Dawit Mekonnen', lastVisit:'Yesterday', condition:'Diabetes Type 2', avatar:'DM' },
    { id:'4', name:'Sara Tadesse', lastVisit:'2 days ago', condition:'General Check-up', avatar:'ST' },
  ]);

  toggleOnline(): void {
    this.isOnline.update(v => !v);
  }

  confirmAppointment(id: string): void {
    this.pendingRequests.update(reqs => reqs.filter(r => r.id !== id));
    this.pendingConfirmations.update(v => v - 1);
    this.todayAppointments.update(v => v + 1);
  }

  declineAppointment(id: string): void {
    this.pendingRequests.update(reqs => reqs.filter(r => r.id !== id));
    this.pendingConfirmations.update(v => v - 1);
  }

  startConsultation(id: string): void {
    this.todaySchedule.update(schedule =>
      schedule.map(s => s.id === id ? { ...s, status:'in-progress' } : s)
    );
  }

  completeConsultation(id: string): void {
    this.todaySchedule.update(schedule =>
      schedule.map(s => s.id === id ? { ...s, status:'completed' } : s)
    );
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'bg-primary-light text-primary';
      case 'in-progress': return 'bg-secondary-light text-secondary';
      case 'confirmed': return 'bg-primary-light text-primary';
      case 'pending': return 'bg-warning-light text-warning-dark';
      default: return 'bg-light text-medium';
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}