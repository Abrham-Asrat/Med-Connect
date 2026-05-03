import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PaymentService } from '../../../../core/services/payment.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private paymentService = inject(PaymentService);

  patientId = localStorage.getItem('patientId') || '';
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
    if (!this.paymentAppointment()) return;

    this.paymentLoading.set(true);

    // Get amount from appointment, fallback to 500
    const fee = this.paymentAppointment().appointmentFee || this.paymentAppointment().onlineFee || '500';

    this.paymentService.charge({
      amount: fee.toString(),
      currency: 'ETB',
      phoneNumber: '0911111111', // This should ideally come from user profile, hardcoded for democartion
      paymentProvider: 'Chapa',
      paymentMethod: 'mobile'
    }).subscribe({
      next: (res: any) => {
        this.paymentLoading.set(false);
        this.showPaymentModal.set(false);
        // If Chapa returns a checkout url, consider redirecting them
        if (res?.data?.checkoutUrl) {
          window.open(res.data.checkoutUrl, '_blank');
        } else {
          this.successMessage.set('Payment initiated! Check your phone.');
          setTimeout(() => this.successMessage.set(null), 3000);
        }
      },
      error: () => {
        this.paymentLoading.set(false);
        this.errorMessage.set('Payment failed. Try again.');
      }
    });
  }
}
