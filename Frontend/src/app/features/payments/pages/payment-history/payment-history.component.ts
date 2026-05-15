import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { PaymentService } from '../../../../core/services/payment.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history.component.html',
  styleUrls: ['./payment-history.component.scss']
})
export class PaymentHistoryComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private paymentService = inject(PaymentService);
  private authService = inject(AuthService);

  patientId = localStorage.getItem('patientId') || '';
  user = this.authService.currentUser;

  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  appointments = signal<any[]>([]);
  payments = signal<any[]>([]);

  // Payment stats
  totalSpent = signal(0);
  pendingPayments = signal(0);
  completedPayments = signal(0);
  dueAppointments = signal<any[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    if (!this.patientId) return;
    this.isLoading.set(true);

    // Fetch both appointments (for context) and payments (the truth)
    this.paymentService.getPaymentHistory(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        const payList = Array.isArray(data) ? data : [];
        this.payments.set(payList);
        this.calculateStats();

        // After loading payments, fetch appointments to find which ones are unpaid
        this.loadAppointments();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading payments:', error);
      }
    });
  }

  loadAppointments(): void {
    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        const apps = Array.isArray(data) ? data : [];
        this.appointments.set(apps);

        // Filter appointments that might need payment
        // We look for Pending/Scheduled appointments that don't have a matching successful payment reference
        const unpaid = apps.filter(a => {
          const status = a.status?.toLowerCase();
          const needsPayment = status === 'pending' || status === 'scheduled';
          if (!needsPayment) return false;

          // Check if any payment exists that contains this appointment ID in its reference
          return !this.payments().some(p =>
            (p.paymentStatus === 'Success' || p.paymentStatus === 1) &&
            (p.transactionReference?.includes(a.appointmentId) || p.receiverId === a.doctorId)
          );
        });

        this.dueAppointments.set(unpaid.slice(0, 5));
      }
    });
  }

  calculateStats(): void {
    const pays = this.payments();
    const successful = pays.filter(p => p.paymentStatus === 'Success' || p.paymentStatus === 1);
    const pending = pays.filter(p => p.paymentStatus === 'Pending' || p.paymentStatus === 0);

    const total = successful.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

    this.totalSpent.set(total);
    this.completedPayments.set(successful.length);
    this.pendingPayments.set(pending.length);
  }

  getStatusClass(status: any): string {
    const s = status?.toString();
    switch (s) {
      case 'Success':
      case '1':
      case 'Completed': return 'bg-success-light text-success';
      case 'Pending':
      case '0':
      case 'Scheduled': return 'bg-warning-light text-warning-dark';
      case 'Failed':
      case '2':
      case 'Cancelled': return 'bg-danger-light text-danger';
      default: return 'bg-light text-medium';
    }
  }

  verifyPayment(p: any): void {
    const txRef = p.transactionReference || p.txRef;
    if (!txRef) {
      alert('No transaction reference found to verify.');
      return;
    }
    this.isLoading.set(true);
    this.paymentService.verifyTransaction(txRef).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.success || res.status === 'success') {
          this.successMessage.set('Payment verified successfully!');
          this.loadData();
        } else {
          this.errorMessage.set('Payment could not be verified yet.');
        }
        setTimeout(() => { this.successMessage.set(null); this.errorMessage.set(null); }, 3000);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Verification failed.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
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
    const apt = this.paymentAppointment();
    const fee = apt.appointmentFee || apt.onlineFee || '500';
    const user = this.user();

    this.paymentService.charge({
      amount: fee.toString(),
      currency: 'ETB',
      email: user?.email || '',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phoneNumber: user?.phone || '0900000000',
      paymentProvider: 'Chapa',
      paymentMethod: 'mobile',
      txRef: 'APT-' + apt.appointmentId.substring(0, 8) + '-' + Date.now()
    }).subscribe({
      next: (res: any) => {
        this.paymentLoading.set(false);
        this.showPaymentModal.set(false);
        if (res?.data?.checkoutUrl) {
          window.open(res.data.checkoutUrl, '_blank');
        } else {
          this.successMessage.set('Payment initiated! Check your phone.');
          setTimeout(() => this.successMessage.set(null), 3000);
        }
        this.loadData();
      },
      error: () => {
        this.paymentLoading.set(false);
        this.errorMessage.set('Payment failed. Try again.');
      }
    });
  }
}
