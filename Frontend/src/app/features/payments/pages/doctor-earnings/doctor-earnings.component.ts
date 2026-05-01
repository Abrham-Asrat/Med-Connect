import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-earnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-wallet2 me-2"></i>Earnings</h4>

      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3"><div class="card bg-primary text-white h-100"><div class="card-body"><small>Total Earnings</small><h3 class="mb-0">{{ totalEarnings().toLocaleString() }} ETB</h3></div></div></div>
        <div class="col-6 col-md-3"><div class="card h-100" style="border-left:4px solid #078930"><div class="card-body"><small class="text-medium">This Month</small><h3 class="text-primary mb-0">{{ thisMonth().toLocaleString() }} ETB</h3></div></div></div>
        <div class="col-6 col-md-3"><div class="card h-100" style="border-left:4px solid #FCD116"><div class="card-body"><small class="text-medium">Pending</small><h3 class="text-warning-dark mb-0">{{ pendingPayouts().toLocaleString() }} ETB</h3></div></div></div>
        <div class="col-6 col-md-3"><div class="card h-100" style="border-left:4px solid #007BFF"><div class="card-body"><small class="text-medium">Consultations</small><h3 class="text-secondary mb-0">{{ completedConsultations() }}</h3></div></div></div>
      </div>

      <div class="card">
        <div class="card-header bg-white"><h5 class="text-primary mb-0"><i class="bi bi-receipt me-2"></i>Recent Transactions</h5></div>
        <div class="table-responsive"><table class="table table-hover mb-0">
          <thead><tr><th>Patient</th><th>Date</th><th>Type</th><th>Amount</th><th>Status</th></tr></thead>
          <tbody>
            @if (isLoading()) { <tr><td colspan="5" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr> }
            @for (t of transactions(); track t.id) {
              <tr><td>{{ t.patient }}</td><td>{{ t.date }}</td><td>{{ t.type }}</td><td><strong>{{ t.amount }} ETB</strong></td><td><span class="badge bg-primary-light text-primary rounded-pill">{{ t.status }}</span></td></tr>
            }
            @if (!isLoading() && transactions().length===0) { <tr><td colspan="5" class="text-center text-medium py-4">No transactions yet</td></tr> }
          </tbody>
        </table></div>
      </div>
    </div>
  `
})
export class DoctorEarningsComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  doctorId = localStorage.getItem('doctorId') || '';
  isLoading = signal(false);
  appointments = signal<any[]>([]);
  totalEarnings = signal(0); thisMonth = signal(0); pendingPayouts = signal(0); completedConsultations = signal(0);
  transactions = signal<any[]>([]);

  ngOnInit(): void { if (this.doctorId) this.loadData(); }

  loadData(): void {
    this.isLoading.set(true);
    this.appointmentService.getDoctorAppointments(this.doctorId).subscribe({
      next: (r: any) => {
        this.isLoading.set(false);
        const data = r?.data || r || [];
        this.appointments.set(Array.isArray(data) ? data : []);
        this.calcStats();
      },
      error: () => this.isLoading.set(false)
    });
  }

  calcStats(): void {
    const apps = this.appointments();
    const fee = 500;
    this.completedConsultations.set(apps.filter(a => a.status==='Completed').length);
    this.totalEarnings.set(this.completedConsultations() * fee);
    this.thisMonth.set(Math.round(this.totalEarnings() * 0.3));
    this.pendingPayouts.set(Math.round(this.totalEarnings() * 0.2));
    this.transactions.set(apps.filter(a => a.status==='Completed').slice(0,10).map((a:any,i:number) => ({
      id: `TXN-${i+1}`, patient: a.patientName||'Patient', date: a.appointmentDate, type: a.appointmentType||'Virtual', amount: fee, status: 'Completed'
    })));
  }
}