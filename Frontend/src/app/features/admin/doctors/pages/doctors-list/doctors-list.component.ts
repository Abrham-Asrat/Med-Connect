import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../../core/services/admin.service';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors-list.component.html',
  styles: [`
    .doctor-row { transition: all 0.2s; }
    .doctor-row:hover { background: #E8F5EC; }
    .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
  `]
})
export class DoctorsListComponent implements OnInit {
  private adminService = inject(AdminService);

  doctors = signal<any[]>([]);
  filteredDoctors = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  searchTerm = signal('');
  selectedSpecialty = signal('');
  selectedStatus = signal('');

  totalDoctors = signal(0);
  activeDoctors = signal(0);
  pendingDoctors = signal(0);
  suspendedDoctors = signal(0);

  specialties = ['Cardiology','Neurology','Pediatrics','Dermatology','Orthopedics','Gynecology','Psychiatry','Ophthalmology','Internal Medicine','General Practice','ENT','Dentistry'];

  ngOnInit(): void {
    this.loadDoctors();
  }

  loadDoctors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Get all doctors (verified + pending)
    this.adminService.getVerifiedDoctors().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        this.doctors.set(Array.isArray(data) ? data : []);
        this.applyFilters();
        this.calculateStats();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.errorMessage.set('Access denied. Admin privileges required.');
        } else {
          this.errorMessage.set('Failed to load doctors.');
        }
        console.error('Error:', error);
      }
    });
  }

  calculateStats(): void {
    const docs = this.doctors();
    this.totalDoctors.set(docs.length);
    this.activeDoctors.set(docs.filter(d => d.doctorStatus === 1 || d.doctorStatus === 'Active').length);
    this.pendingDoctors.set(docs.filter(d => d.doctorStatus === 0 || d.doctorStatus === 'Pending').length);
    this.suspendedDoctors.set(docs.filter(d => d.doctorStatus === 2 || d.doctorStatus === 'Suspended').length);
  }

  applyFilters(): void {
    let result = [...this.doctors()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(d => 
        `${d.firstName} ${d.lastName}`.toLowerCase().includes(term) ||
        (d.email || '').toLowerCase().includes(term)
      );
    }
    if (this.selectedSpecialty()) {
      result = result.filter(d => (d.specialties || []).includes(this.selectedSpecialty()));
    }
    if (this.selectedStatus()) {
      result = result.filter(d => {
        const status = d.doctorStatus;
        if (this.selectedStatus() === 'Active') return status === 1 || status === 'Active';
        if (this.selectedStatus() === 'Pending') return status === 0 || status === 'Pending';
        if (this.selectedStatus() === 'Suspended') return status === 2 || status === 'Suspended';
        return true;
      });
    }

    this.filteredDoctors.set(result);
  }

  filterBySpecialty(value: string): void { this.selectedSpecialty.set(value); this.applyFilters(); }
  filterByStatus(value: string): void { this.selectedStatus.set(value); this.applyFilters(); }
  resetFilters(): void { this.searchTerm.set(''); this.selectedSpecialty.set(''); this.selectedStatus.set(''); this.applyFilters(); }

  getStatusClass(status: any): string {
    if (status === 1 || status === 'Active') return 'bg-primary-light text-primary';
    if (status === 0 || status === 'Pending') return 'bg-warning-light text-warning-dark';
    if (status === 2 || status === 'Suspended') return 'bg-danger-light text-danger';
    return 'bg-light text-medium';
  }

  getStatusLabel(status: any): string {
    if (status === 1 || status === 'Active') return 'Active';
    if (status === 0 || status === 'Pending') return 'Pending';
    if (status === 2 || status === 'Suspended') return 'Suspended';
    return 'Unknown';
  }

  suspendDoctor(doctorId: string): void {
    this.adminService.updateDoctorStatus(doctorId, 2).subscribe({
      next: () => this.loadDoctors(),
      error: (e) => console.error('Error:', e)
    });
  }

  reactivateDoctor(doctorId: string): void {
    this.adminService.updateDoctorStatus(doctorId, 1).subscribe({
      next: () => this.loadDoctors(),
      error: (e) => console.error('Error:', e)
    });
  }
}