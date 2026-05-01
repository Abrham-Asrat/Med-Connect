import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../../core/services/admin.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.html',
  styles: [`
    .stat-card { border-left: 4px solid #078930; transition: all 0.2s; }
    .stat-card:hover { box-shadow: 0 4px 16px rgba(7,137,48,0.12); }
    .stat-card.danger { border-left-color: #DA121A; }
    .stat-card.warning { border-left-color: #FCD116; }
    .stat-card.info { border-left-color: #007BFF; }
    .pending-row { transition: all 0.2s; cursor: pointer; }
    .pending-row:hover { background: #E8F5EC; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Stats
  totalDoctors = signal(0);
  totalPatients = signal(0);
  pendingApprovals = signal(0);
  totalAppointments = signal(0);
  totalRevenue = signal(0);

  // Pending doctors
  pendingDoctors = signal<any[]>([]);

  // Approve/Reject modals
  showApproveModal = signal(false);
  showRejectModal = signal(false);
  selectedDoctor = signal<any>(null);
  approveNotes = signal('');
  rejectReason = signal('');

  ngOnInit(): void {
    this.loadStats();
    this.loadPendingDoctors();
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (response: any) => {
        const data = response?.data || response || {};
        this.totalDoctors.set(data.totalDoctors || 0);
        this.totalPatients.set(data.totalPatients || 0);
        this.pendingApprovals.set(data.pendingApprovals || 0);
        this.totalAppointments.set(data.totalAppointments || 0);
        this.totalRevenue.set(data.totalRevenue || 0);
      },
      error: (error: any) => console.error('Stats error:', error)
    });
  }

  loadPendingDoctors(): void {
    this.isLoading.set(true);
    this.adminService.getPendingDoctors().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        this.pendingDoctors.set(Array.isArray(data) ? data.slice(0, 10) : []);
        this.pendingApprovals.set(this.pendingDoctors().length);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error:', error);
      }
    });
  }

  openApprove(doc: any): void {
    this.selectedDoctor.set(doc);
    this.approveNotes.set('');
    this.showApproveModal.set(true);
  }

  openReject(doc: any): void {
    this.selectedDoctor.set(doc);
    this.rejectReason.set('');
    this.showRejectModal.set(true);
  }

  confirmApprove(): void {
    const doc = this.selectedDoctor();
    if (!doc) return;
    
    this.adminService.approveDoctor(doc.doctorId, this.approveNotes()).subscribe({
      next: () => {
        this.showApproveModal.set(false);
        this.loadPendingDoctors();
        this.loadStats();
      },
      error: (e) => console.error('Approve error:', e)
    });
  }

  confirmReject(): void {
    const doc = this.selectedDoctor();
    if (!doc || !this.rejectReason()) return;
    
    this.adminService.rejectDoctor(doc.doctorId, this.rejectReason()).subscribe({
      next: () => {
        this.showRejectModal.set(false);
        this.loadPendingDoctors();
        this.loadStats();
      },
      error: (e) => console.error('Reject error:', e)
    });
  }
}