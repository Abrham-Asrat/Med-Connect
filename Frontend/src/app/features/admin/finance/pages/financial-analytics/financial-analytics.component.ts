import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-financial-analytics',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-graph-up me-2"></i>Financial Analytics</h4>

      <!-- Key Metrics -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card bg-primary text-white h-100"><div class="card-body">
            <small>Total Revenue</small><h3 class="mb-0">1,245,000 ETB</h3><small>↑ 12% from last month</small>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #078930"><div class="card-body">
            <small class="text-medium">This Month</small><h3 class="text-primary mb-0">185,000 ETB</h3><small class="text-medium">↑ 8%</small>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #FCD116"><div class="card-body">
            <small class="text-medium">Pending Payouts</small><h3 class="text-warning-dark mb-0">45,000 ETB</h3><small class="text-medium">12 doctors</small>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #007BFF"><div class="card-body">
            <small class="text-medium">Chapa Status</small><h3 class="text-secondary mb-0">Active</h3><small class="text-primary">Connected</small>
          </div></div>
        </div>
      </div>

      <!-- Revenue Chart -->
      <div class="row g-4 mb-4">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header bg-white"><h5 class="text-primary mb-0">Revenue Overview</h5></div>
            <div class="card-body">
              <div class="d-flex justify-content-center align-items-end gap-2" style="height:200px">
                @for (m of monthlyRevenue(); track m.month) {
                  <div class="text-center">
                    <div class="bg-primary rounded-top" [style.height.px]="m.amount / 1000" [style.width]="'40px'"></div>
                    <small class="text-medium">{{ m.month }}</small><br>
                    <small class="text-primary fw-bold">{{ m.amount / 1000 }}k</small>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header bg-white"><h5 class="text-primary mb-0">By Specialty</h5></div>
            <div class="card-body">
              @for (s of revenueBySpecialty(); track s.specialty) {
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-medium">{{ s.specialty }}</span>
                  <span class="text-primary fw-bold">{{ s.amount.toLocaleString() }} ETB</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Transactions -->
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between">
          <h5 class="text-primary mb-0">Recent Transactions</h5>
          <button class="btn btn-outline-primary btn-sm">Export CSV</button>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead><tr><th>ID</th><th>Doctor</th><th>Patient</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              @for (t of transactions(); track t.id) {
                <tr>
                  <td><small class="text-primary">{{ t.id }}</small></td>
                  <td>{{ t.doctor }}</td>
                  <td>{{ t.patient }}</td>
                  <td><strong>{{ t.amount }} ETB</strong></td>
                  <td>{{ t.date }}</td>
                  <td><span class="badge" [class.bg-primary-light]="t.status==='Completed'" [class.text-primary]="t.status==='Completed'" [class.bg-warning-light]="t.status==='Pending'" [class.text-warning-dark]="t.status==='Pending'">{{ t.status }}</span></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class FinancialAnalyticsComponent {
  monthlyRevenue = signal([
    { month:'Jan', amount:150000 }, { month:'Feb', amount:165000 }, { month:'Mar', amount:180000 },
    { month:'Apr', amount:175000 }, { month:'May', amount:185000 }, { month:'Jun', amount:190000 },
  ]);

  revenueBySpecialty = signal([
    { specialty:'Cardiology', amount:320000 },
    { specialty:'Neurology', amount:280000 },
    { specialty:'Pediatrics', amount:210000 },
    { specialty:'Dermatology', amount:195000 },
    { specialty:'Orthopedics', amount:240000 },
  ]);

  transactions = signal([
    { id:'TXN-001', doctor:'Dr. Sarah Johnson', patient:'Abebe Tesfaye', amount:500, date:'May 15, 2026', status:'Completed' },
    { id:'TXN-002', doctor:'Dr. Abebe Kebede', patient:'Meron Haile', amount:600, date:'May 14, 2026', status:'Completed' },
    { id:'TXN-003', doctor:'Dr. Tirunesh Desta', patient:'Sara Tadesse', amount:400, date:'May 13, 2026', status:'Pending' },
    { id:'TXN-004', doctor:'Dr. Yonas Tadesse', patient:'Dawit Mekonnen', amount:550, date:'May 12, 2026', status:'Completed' },
    { id:'TXN-005', doctor:'Dr. Sarah Johnson', patient:'Henok Girma', amount:500, date:'May 11, 2026', status:'Refunded' },
  ]);
}