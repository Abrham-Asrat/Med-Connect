import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-history.component.html',
  styles: [`
    .stat-card { border-left: 4px solid #078930; }
    .stat-card.pending { border-left-color: #FCD116; }
    .transaction-row { transition: all 0.2s; }
    .transaction-row:hover { background: #E8F5EC; }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  private appointmentService = inject(AppointmentService);

  patientId = localStorage.getItem('patientId') || '';
  private http = inject(HttpClient);
private apiUrl = environment.apiUrl;
successMessage = signal<string | null>(null);
errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  appointments = signal<any[]>([]);
  
  // Payment stats
  totalSpent = signal(0);
  pendingPayments = signal(0);
  completedPayments = signal(0);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.patientId) return;

    this.isLoading.set(true);

    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || [];
        this.appointments.set(Array.isArray(data) ? data : []);
        this.calculateStats();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error:', error);
      }
    });
  }

  calculateStats(): void {
    const apps = this.appointments();
    this.completedPayments.set(apps.filter(a => a.status === 'Completed').length);
    this.pendingPayments.set(apps.filter(a => a.status === 'Scheduled' || a.status === 'Confirmed').length);
    // Estimate 500 ETB per appointment
    this.totalSpent.set(this.completedPayments() * 500);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-primary-light text-primary';
      case 'Scheduled':
      case 'Confirmed': return 'bg-warning-light text-warning-dark';
      case 'Cancelled': return 'bg-danger-light text-danger';
      default: return 'bg-light text-medium';
    }
  }

  showPaymentModal = signal(false);
paymentAppointment = signal<any>(null);
paymentLoading = signal(false);

openPayment(apt: any): void {
  this.paymentAppointment.set(apt);
  this.showPaymentModal.set(true);
}

processPayment(): void {
  this.paymentLoading.set(true);
  // Call Chapa payment endpoint
  this.http.post(`${this.apiUrl}/payments/charge`, {
    amount: '500',
    currency: 'ETB',
    phoneNumber: '0911111111',
    paymentProvider: 'Chapa',
    paymentMethod: 'mobile'
  }).subscribe({
    next: () => {
      this.paymentLoading.set(false);
      this.showPaymentModal.set(false);
      this.successMessage.set('Payment initiated! Check your phone.');
      setTimeout(() => this.successMessage.set(null), 3000);
    },
    error: () => {
      this.paymentLoading.set(false);
      this.errorMessage.set('Payment failed. Try again.');
    }
  });
}
}