import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../../core/services/admin.service';

@Component({
  selector: 'app-doctor-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-verification.component.html',
  styles: [`
    .verification-card { border-left: 4px solid #FCD116; transition: all 0.2s; }
    .verification-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
    .stat-card { border-left: 4px solid #DA121A; }
    .stat-card.approved { border-left-color: #078930; }
    .stat-card.review { border-left-color: #FCD116; }
    .stat-card.rejected { border-left-color: #DA121A; opacity: 0.7; }
  `]
})
export class DoctorVerificationComponent implements OnInit {
  private adminService = inject(AdminService);

  pendingDoctors = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  searchTerm = signal('');

  // Stats
  pendingCount = signal(0);
  approvedToday = signal(0);
  approvedTotal = signal(0);
  rejectedCount = signal(0);

  // Modals
  showApproveModal = signal(false);
  showRejectModal = signal(false);
  selectedDoctor = signal<any>(null);
  approveNotes = signal('');
  rejectReason = signal('');

  // Document viewer
  showDocumentViewer = signal(false);
  viewingDocument = signal<string>('');

  ngOnInit(): void {
    this.loadPendingDoctors();
  }

  loadPendingDoctors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getPendingDoctors().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        this.pendingDoctors.set(Array.isArray(data) ? data : []);
        this.pendingCount.set(this.pendingDoctors().length);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.errorMessage.set('Access denied. Admin privileges required. Please login with an Admin account.');
        } else {
          this.errorMessage.set('Failed to load pending doctors. Please try again.');
        }
        console.error('Error:', error);
      }
    });
  }

  filteredDoctors(): any[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.pendingDoctors();
    return this.pendingDoctors().filter((d: any) =>
      (d.firstName || '').toLowerCase().includes(term) ||
      (d.lastName || '').toLowerCase().includes(term) ||
      (d.email || '').toLowerCase().includes(term) ||
      (d.specialties || []).some((s: string) => s.toLowerCase().includes(term))
    );
  }

  viewDocument(url: string): void {
    this.viewingDocument.set(url);
    this.showDocumentViewer.set(true);
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
    this.isLoading.set(true);

    this.adminService.approveDoctor(doc.doctorId, this.approveNotes()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showApproveModal.set(false);
        this.successMessage.set(`Dr. ${doc.firstName} ${doc.lastName} approved successfully!`);
        this.approvedToday.update(v => v + 1);
        this.loadPendingDoctors();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.errorMessage.set('Access denied. Admin privileges required.');
        } else {
          this.errorMessage.set('Failed to approve doctor.');
        }
      }
    });
  }

  confirmReject(): void {
    const doc = this.selectedDoctor();
    if (!doc || !this.rejectReason()) return;
    this.isLoading.set(true);

    this.adminService.rejectDoctor(doc.doctorId, this.rejectReason()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.showRejectModal.set(false);
        this.successMessage.set(`Dr. ${doc.firstName} ${doc.lastName} rejected.`);
        this.rejectedCount.update(v => v + 1);
        this.loadPendingDoctors();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to reject doctor.');
      }
    });
  }
}