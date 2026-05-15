import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../../../core/services/admin.service';
import { AppointmentService } from '../../../../../core/services/appointment.service';

@Component({
  selector: 'app-financial-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './financial-analytics.component.html',
  styles: [`
    .stat-card { border-left: 4px solid #078930; }
    .stat-card.revenue { border-left-color: #078930; }
    .stat-card.pending { border-left-color: #FCD116; }
    .stat-card.chapa { border-left-color: #007BFF; }
    .revenue-bar { height: 200px; display: flex; align-items: flex-end; gap: 8px; }
    .bar { width: 40px; border-radius: 4px 4px 0 0; transition: all 0.3s; }
  `]
})
export class FinancialAnalyticsComponent implements OnInit {
  private adminService = inject(AdminService);
  private appointmentService = inject(AppointmentService);

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // Stats
  totalRevenue = signal(0);
  thisMonth = signal(0);
  pendingPayouts = signal(0);
  totalAppointments = signal(0);
  completedAppointments = signal(0);

  // Revenue data
  monthlyRevenue = signal<{ month: string; amount: number }[]>([]);
  revenueBySpecialty = signal<{ specialty: string; amount: number }[]>([]);
  transactions = signal<any[]>([]);

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Get stats from admin endpoint
    this.adminService.getFinancialAnalytics().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || {};
        this.totalRevenue.set(data.totalRevenue || 0);
        this.thisMonth.set(data.thisMonth || 0);
        this.monthlyRevenue.set(data.monthlyRevenue || []);
        this.revenueBySpecialty.set(data.revenueBySpecialty || []);
        this.transactions.set(data.transactions || []);
        // Load counts additionally
        this.loadAppointmentsCounts();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.errorMessage.set('Access denied. Admin privileges required.');
        } else {
          this.errorMessage.set('Failed to load financial data.');
        }
      }
    });
  }

  loadAppointmentsCounts(): void {
    this.appointmentService.getAllAppointments().subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        const apps = Array.isArray(data) ? data : [];
        this.totalAppointments.set(apps.length);
        this.completedAppointments.set(apps.filter((a: any) => a.status === 'Completed').length);
        this.pendingPayouts.set(apps.filter((a: any) => a.status === 'Pending').length * 500); // 500 as static fee representation
      }
    });
  }

  generateMockData(): void {
    this.isLoading.set(false);
    this.totalRevenue.set(1245000);
    this.thisMonth.set(185000);
    this.pendingPayouts.set(45000);
    this.totalAppointments.set(4520);
    this.completedAppointments.set(3890);
    this.monthlyRevenue.set([
      { month: 'Jan', amount: 150000 }, { month: 'Feb', amount: 165000 }, { month: 'Mar', amount: 180000 },
      { month: 'Apr', amount: 175000 }, { month: 'May', amount: 185000 }, { month: 'Jun', amount: 190000 },
      { month: 'Jul', amount: 200000 },
    ]);
    this.revenueBySpecialty.set([
      { specialty: 'Cardiology', amount: 320000 }, { specialty: 'Neurology', amount: 280000 },
      { specialty: 'Pediatrics', amount: 210000 }, { specialty: 'Dermatology', amount: 195000 },
      { specialty: 'Orthopedics', amount: 240000 },
    ]);
    this.transactions.set([
      { id: 'TXN-001', doctor: 'Dr. Sarah Johnson', patient: 'Abebe T.', amount: 500, date: '2026-05-15', status: 'Completed' },
      { id: 'TXN-002', doctor: 'Dr. Abebe Kebede', patient: 'Meron H.', amount: 600, date: '2026-05-14', status: 'Completed' },
      { id: 'TXN-003', doctor: 'Dr. Tirunesh Desta', patient: 'Sara T.', amount: 400, date: '2026-05-13', status: 'Pending' },
      { id: 'TXN-004', doctor: 'Dr. Yonas Tadesse', patient: 'Dawit M.', amount: 550, date: '2026-05-12', status: 'Completed' },
      { id: 'TXN-005', doctor: 'Dr. Sarah Johnson', patient: 'Henok G.', amount: 500, date: '2026-05-11', status: 'Refunded' },
    ]);
  }

  generateMonthlyData(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const data = months.map(m => ({ month: m, amount: Math.floor(Math.random() * 100000) + 100000 }));
    this.monthlyRevenue.set(data);
    this.thisMonth.set(data[new Date().getMonth()]?.amount || 0);
  }

  generateTransactions(appointments: any[]): void {
    const fee = 500;
    const txns = appointments
      .filter((a: any) => a.status === 'Completed')
      .slice(0, 10)
      .map((a: any, i: number) => ({
        id: `TXN-${i + 1}`,
        doctor: a.doctorName || 'Doctor',
        patient: a.patientName || 'Patient',
        amount: fee,
        date: a.appointmentDate,
        status: 'Completed'
      }));
    this.transactions.set(txns.length > 0 ? txns : []);
    this.pendingPayouts.set(appointments.filter((a: any) => a.status === 'Pending').length * fee);
  }

  generateSpecialtyData(appointments: any[]): void {
    // Group by specialty from appointment data
    const specialtyMap = new Map<string, number>();
    appointments.forEach((a: any) => {
      const spec = a.specialty || 'General';
      specialtyMap.set(spec, (specialtyMap.get(spec) || 0) + 500);
    });
    const data = Array.from(specialtyMap.entries()).map(([specialty, amount]) => ({ specialty, amount }));
    if (data.length > 0) this.revenueBySpecialty.set(data);
  }

  getMaxRevenue(): number {
    const max = Math.max(...this.monthlyRevenue().map(m => m.amount), 1);
    return max;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed': return 'bg-primary-light text-primary';
      case 'Pending': return 'bg-warning-light text-warning-dark';
      case 'Refunded': return 'bg-danger-light text-danger';
      default: return 'bg-light text-medium';
    }
  }
}