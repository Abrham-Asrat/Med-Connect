import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-wallet2 me-2"></i>Payment History</h4>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card text-white bg-primary h-100"><div class="card-body">
            <small>Total Spent</small><h4 class="mb-0">12,500 ETB</h4>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #078930"><div class="card-body">
            <small class="text-medium">This Month</small><h4 class="text-primary mb-0">2,400 ETB</h4>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #FCD116"><div class="card-body">
            <small class="text-medium">Pending</small><h4 class="text-warning-dark mb-0">500 ETB</h4>
          </div></div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #007BFF"><div class="card-body">
            <small class="text-medium">Refunds</small><h4 class="text-secondary mb-0">300 ETB</h4>
          </div></div>
        </div>
      </div>

      <!-- Transactions -->
      <div class="card">
        <div class="card-header bg-white"><h5 class="text-primary mb-0">Transactions</h5></div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead><tr><th>ID</th><th>Doctor</th><th>Date</th><th>Amount</th><th>Status</th><th>Receipt</th></tr></thead>
            <tbody>
              @for (t of transactions(); track t.id) {
                <tr>
                  <td><small class="text-primary">{{ t.id }}</small></td>
                  <td>{{ t.doctor }}</td>
                  <td>{{ t.date }}</td>
                  <td><strong>{{ t.amount }} ETB</strong></td>
                  <td><span class="badge" [class.bg-primary-light]="t.status==='Completed'" [class.text-primary]="t.status==='Completed'" [class.bg-warning-light]="t.status==='Pending'" [class.text-warning-dark]="t.status==='Pending'">{{ t.status }}</span></td>
                  <td><button class="btn btn-outline-primary btn-sm"><i class="bi bi-download"></i></button></td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PaymentHistoryComponent {
  transactions = signal([
    { id:'TXN-001', doctor:'Dr. Sarah Johnson', date:'May 15, 2026', amount:500, status:'Completed' },
    { id:'TXN-002', doctor:'Dr. Abebe Kebede', date:'Apr 28, 2026', amount:600, status:'Completed' },
    { id:'TXN-003', doctor:'Dr. Tirunesh Desta', date:'May 22, 2026', amount:400, status:'Pending' },
    { id:'TXN-004', doctor:'Dr. Yonas Tadesse', date:'Mar 15, 2026', amount:550, status:'Refunded' },
    { id:'TXN-005', doctor:'Dr. Sarah Johnson', date:'Mar 10, 2026', amount:500, status:'Completed' },
  ]);
}