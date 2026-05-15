import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-doctor-earnings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4 animate-fade-in">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="text-primary fw-bold mb-1"><i class="bi bi-wallet2 me-3"></i>Revenue & Analytics / ገቢ እና ትንታኔ</h3>
          <p class="text-muted small">Track your consultations and financial performance.</p>
        </div>
        <button class="btn btn-outline-primary rounded-pill px-4" (click)="loadData()">
          <i class="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="row g-4 mb-5">
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div class="bg-primary p-3 text-white border-0">
              <small class="opacity-75 text-uppercase fw-bold ls-1">Total Revenue</small>
              <h2 class="mb-0 mt-2 fw-bold">{{ totalEarnings().toLocaleString() }} <small class="fs-6 opacity-75">ETB</small></h2>
            </div>
            <div class="card-body py-2 px-3 bg-light border-top">
              <span class="text-success small"><i class="bi bi-graph-up me-1"></i> Lifetime earnings</span>
            </div>
          </div>
        </div>
        
        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="bg-success bg-opacity-10 text-success rounded-3 p-2">
                  <i class="bi bi-calendar-check fs-4"></i>
                </div>
                <span class="badge bg-success-light text-success rounded-pill px-2">Current Month</span>
              </div>
              <small class="text-muted fw-bold">This Month</small>
              <h3 class="mb-0 text-dark fw-bold mt-1">{{ thisMonth().toLocaleString() }} ETB</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="bg-warning bg-opacity-10 text-warning-dark rounded-3 p-2">
                  <i class="bi bi-hourglass-split fs-4"></i>
                </div>
                <span class="badge bg-warning-light text-warning-dark rounded-pill px-2">Unpaid</span>
              </div>
              <small class="text-muted fw-bold">Pending Payout</small>
              <h3 class="mb-0 text-dark fw-bold mt-1">{{ pendingPayouts().toLocaleString() }} ETB</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <div class="card border-0 shadow-sm rounded-4 h-100">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <div class="bg-info bg-opacity-10 text-info rounded-3 p-2">
                  <i class="bi bi-people fs-4"></i>
                </div>
                <span class="badge bg-info-light text-info rounded-pill px-2">Activity</span>
              </div>
              <small class="text-muted fw-bold">Total Sessions</small>
              <h3 class="mb-0 text-dark fw-bold mt-1">{{ completedConsultations() }}</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
          <h5 class="fw-bold mb-0 text-primary">Recent Transactions / የቅርብ ጊዜ ግብይቶች</h5>
          <div class="dropdown">
            <button class="btn btn-sm btn-light border rounded-pill px-3" type="button">
              <i class="bi bi-download me-2"></i>Export
            </button>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Patient & Description</th>
                <th>Date</th>
                <th>Type</th>
                <th>Revenue</th>
                <th class="text-end pe-4">Status</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr><td colspan="5" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
              }
              @for (t of transactions(); track t.id) {
                <tr class="transition-all hover-lift-sm">
                  <td class="ps-4">
                    <div class="d-flex align-items-center gap-3">
                      <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width:35px;height:35px;">
                        <i class="bi bi-person"></i>
                      </div>
                      <div>
                        <span class="fw-bold d-block text-dark">{{ t.patient }}</span>
                        <small class="text-muted">Consultation #{{ t.id }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="text-muted small">{{ t.date | date:'mediumDate' }}</span></td>
                  <td>
                    <span class="badge" [class.bg-primary-light]="t.type==='Virtual'" [class.text-primary]="t.type==='Virtual'"
                          [class.bg-info-light]="t.type==='InPerson'" [class.text-info]="t.type==='InPerson'">
                      {{ t.type }}
                    </span>
                  </td>
                  <td><strong>+{{ t.amount }} ETB</strong></td>
                  <td class="text-end pe-4">
                    <span class="badge bg-success-light text-success rounded-pill px-3">{{ t.status }}</span>
                  </td>
                </tr>
              }
              @if (!isLoading() && transactions().length === 0) {
                <tr>
                  <td colspan="5" class="text-center py-5">
                    <i class="bi bi-receipt display-4 text-muted opacity-25"></i>
                    <p class="text-muted mt-3">No transaction history found.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
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
    const completedApps = apps.filter(a =>
      a.status?.toLowerCase() === 'completed' || a.status?.toLowerCase() === 'closed' || a.status?.toLowerCase() === 'scheduled'
    );

    this.completedConsultations.set(completedApps.length);

    // Sum fees from completed appointments (fallback to 500 if missing)
    const total = completedApps.reduce((sum, a) => sum + (a.fee || 500), 0);
    this.totalEarnings.set(total);

    // For demo/sim, assume 30% is for the current month and 20% is pending
    this.thisMonth.set(Math.round(total * 0.3));
    this.pendingPayouts.set(Math.round(total * 0.2));

    this.transactions.set(completedApps.slice(0, 10).map((a: any, i: number) => ({
      id: `TXN-${i + 1}`,
      patient: a.patientName || 'Patient',
      date: a.appointmentDate,
      type: a.appointmentType || 'Virtual',
      amount: a.fee || 500,
      status: a.status
    })));
  }
}