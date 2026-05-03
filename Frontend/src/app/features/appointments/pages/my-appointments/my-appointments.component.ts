import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './my-appointments.component.html',
  styleUrls: ['./my-appointments.component.scss']
})
export class MyAppointmentsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  appointments = signal<any[]>([]);
  filteredAppointments = signal<any[]>([]);
  isLoading = signal(false);
  activeFilter = signal('all');
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Reschedule modal
  showRescheduleModal = signal(false);
  rescheduleAppointment = signal<any>(null);
  newDate = signal('');
  newTime = signal('');

  // Cancel confirmation
  showCancelConfirm = signal(false);
  cancelAppointment = signal<any>(null);

  patientId = localStorage.getItem('patientId') || '';

  ngOnInit(): void {
    if (this.patientId) this.loadAppointments();
  }

  loadAppointments(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || [];
        this.appointments.set(Array.isArray(data) ? data : []);
        this.filterAppointments(this.activeFilter());
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to load appointments.');
        console.error('Error:', error);
      }
    });
  }

  filterAppointments(filter: string): void {
    this.activeFilter.set(filter);
    const all = this.appointments();
    switch (filter) {
      case 'upcoming':
        this.filteredAppointments.set(all.filter(a =>
          a.status === 'Scheduled' || a.status === 'Confirmed' || a.status === 'Pending'
        ));
        break;
      case 'past':
        this.filteredAppointments.set(all.filter(a =>
          a.status === 'Completed' || a.status === 'Cancelled'
        ));
        break;
      default:
        this.filteredAppointments.set(all);
    }
  }

  // ─── Reschedule ──────────────────────────────
  openReschedule(apt: any): void {
    this.rescheduleAppointment.set(apt);
    this.newDate.set(apt.appointmentDate || '');
    this.newTime.set(apt.appointmentTime || '');
    this.showRescheduleModal.set(true);
  }

  confirmReschedule(): void {
    const apt = this.rescheduleAppointment();
    if (!apt || !this.newDate() || !this.newTime()) return;

    this.appointmentService.updateAppointment(apt.appointmentId, {
      appointmentDate: this.newDate(),
      appointmentTime: this.newTime()
    }).subscribe({
      next: () => {
        this.showRescheduleModal.set(false);
        this.successMessage.set('Appointment rescheduled!');
        this.loadAppointments();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Reschedule error:', error);
        this.errorMessage.set('Failed to reschedule. Please try again.');
      }
    });
  }

  // ─── Cancel ──────────────────────────────────
  openCancel(apt: any): void {
    this.cancelAppointment.set(apt);
    this.showCancelConfirm.set(true);
  }

  confirmCancel(): void {
    const apt = this.cancelAppointment();
    if (!apt) return;

    this.appointmentService.deleteAppointment(apt.appointmentId).subscribe({
      next: () => {
        this.showCancelConfirm.set(false);
        this.successMessage.set('Appointment cancelled.');
        this.loadAppointments();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        console.error('Cancel error:', error);
        this.errorMessage.set('Failed to cancel. Please try again.');
      }
    });
  }

  // ─── Helpers ─────────────────────────────────
  getStatusClass(status: string): string {
    switch (status) {
      case 'Scheduled':
      case 'Confirmed': return 'bg-primary-light text-primary';
      case 'Pending': return 'bg-warning-light text-warning-dark';
      case 'Completed': return 'bg-success-light text-success';
      case 'Cancelled': return 'bg-danger-light text-danger';
      default: return 'bg-light text-medium';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Scheduled': return 'bi-calendar-check';
      case 'Confirmed': return 'bi-check-circle';
      case 'Pending': return 'bi-clock';
      case 'Completed': return 'bi-check-circle-fill';
      case 'Cancelled': return 'bi-x-circle';
      default: return 'bi-info-circle';
    }
  }
}