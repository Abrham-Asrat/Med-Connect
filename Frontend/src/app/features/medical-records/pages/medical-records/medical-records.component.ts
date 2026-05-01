import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-records.component.html',
  styles: [`
    .record-card { border-left: 4px solid #078930; transition: all 0.2s ease; }
    .record-card:hover { box-shadow: 0 4px 16px rgba(7,137,48,0.12); }
    .record-card.prescription { border-left-color: #078930; }
    .record-card.lab { border-left-color: #007BFF; }
    .record-card.diagnosis { border-left-color: #FCD116; }
    .category-btn { cursor: pointer; transition: all 0.2s; }
    .category-btn.active { background: #078930; color: white; }
  `]
})
export class MedicalRecordsComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  user = this.authService.currentUser;
  patientId = localStorage.getItem('patientId') || '';
  
  isLoading = signal(false);
  activeCategory = signal('all');
  appointments = signal<any[]>([]);
  filteredRecords = signal<any[]>([]);

  categories = ['all', 'prescription', 'lab', 'diagnosis'];

  ngOnInit(): void {
    this.loadAppointmentHistory();
  }

  loadAppointmentHistory(): void {
    if (!this.patientId) return;

    this.isLoading.set(true);

    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || [];
        this.appointments.set(Array.isArray(data) ? data : []);
        this.filterCategory('all');
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading records:', error);
      }
    });
  }

  filterCategory(category: string): void {
    this.activeCategory.set(category);
    const appointments = this.appointments();

    // Convert appointments to medical record format
    let records = appointments.map((apt: any) => ({
      id: apt.appointmentId,
      category: 'diagnosis',
      title: `${apt.appointmentType || 'Virtual'} Consultation`,
      date: apt.appointmentDate,
      doctor: apt.doctorName || 'Doctor',
      description: `Appointment on ${apt.appointmentDate} at ${apt.appointmentTime}. Status: ${apt.status}.`,
      status: apt.status
    }));

    // Add some sample records based on completed appointments
    const completedApts = appointments.filter((a: any) => a.status === 'Completed');
    
    if (completedApts.length > 0) {
      records.push({
        id: 'presc-1',
        category: 'prescription',
        title: 'Standard Prescription',
        date: completedApts[0].appointmentDate,
        doctor: completedApts[0].doctorName || 'Doctor',
        description: 'Routine medication prescribed during consultation.',
        status: 'Active'
      });
    }

    if (category !== 'all') {
      records = records.filter(r => r.category === category);
    }

    this.filteredRecords.set(records);
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'prescription': return 'bi-capsule';
      case 'lab': return 'bi-clipboard2-pulse';
      case 'diagnosis': return 'bi-stethoscope';
      default: return 'bi-file-medical';
    }
  }

  getCategoryClass(category: string): string {
    return `record-card ${category}`;
  }
}