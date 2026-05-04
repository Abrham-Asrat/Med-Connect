import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService } from '../../../core/services/appointment.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-admin-scheduling',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="text-primary fw-bold mb-1"><i class="bi bi-calendar-event me-3"></i>Global Scheduling Hub</h3>
          <p class="text-muted small">Monitor and manage all medical consultations across the platform.</p>
        </div>
        <div class="bg-white p-3 rounded-4 shadow-sm border d-flex gap-4">
          <div class="text-center">
            <small class="text-muted d-block text-uppercase fw-bold" style="font-size: 0.65rem;">Total Today</small>
            <span class="h4 fw-bold mb-0">24</span>
          </div>
          <div class="vr"></div>
          <div class="text-center">
            <small class="text-muted d-block text-uppercase fw-bold" style="font-size: 0.65rem;">Pending</small>
            <span class="h4 fw-bold mb-0 text-warning">{{ pendingCount() }}</span>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="card border-0 shadow-sm rounded-4 mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text bg-light border-0"><i class="bi bi-search"></i></span>
                <input type="text" class="form-control bg-light border-0" placeholder="Search by doctor or patient..." [(ngModel)]="searchTerm">
              </div>
            </div>
            <div class="col-md-3">
              <select class="form-select bg-light border-0" [(ngModel)]="statusFilter">
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Appointments List -->
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="ps-4">Appointment ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th class="text-end pe-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr><td colspan="6" class="text-center py-5"><div class="spinner-border text-primary"></div></td></tr>
              }
              @for (apt of filteredAppointments(); track apt.appointmentId) {
                <tr>
                  <td class="ps-4 fw-bold text-muted">#{{ apt.appointmentId.slice(0,8) }}</td>
                  <td>
                    <div class="fw-bold">{{ apt.patientName || 'N/A' }}</div>
                    <small class="text-muted">Patient</small>
                  </td>
                  <td>
                    <div class="fw-bold">Dr. {{ apt.doctorName || 'N/A' }}</div>
                    <small class="text-muted">Provider</small>
                  </td>
                  <td>
                    <div class="fw-bold">{{ apt.appointmentDate | date:'mediumDate' }}</div>
                    <span class="badge bg-light text-dark">{{ apt.appointmentTime }}</span>
                  </td>
                  <td>
                    <span class="badge rounded-pill px-3 py-2" 
                      [class.bg-success-light]="apt.status === 'Completed'"
                      [class.text-success]="apt.status === 'Completed'"
                      [class.bg-primary-light]="apt.status === 'Scheduled'"
                      [class.text-primary]="apt.status === 'Scheduled'"
                      [class.bg-danger-light]="apt.status === 'Cancelled'"
                      [class.text-danger]="apt.status === 'Cancelled'">
                      {{ apt.status }}
                    </span>
                  </td>
                  <td class="text-end pe-4">
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3" (click)="cancelAppointment(apt.appointmentId)">Cancel</button>
                    <button class="btn btn-sm btn-light rounded-circle ms-2"><i class="bi bi-three-dots"></i></button>
                  </td>
                </tr>
              }
              @if (filteredAppointments().length === 0 && !isLoading()) {
                <tr>
                  <td colspan="6" class="text-center py-5">
                    <i class="bi bi-journal-x display-4 opacity-25"></i>
                    <p class="text-muted mt-2">No appointments found matching your criteria.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .bg-success-light { background: #E8F5EC; }
    .bg-primary-light { background: #E7F0FF; }
    .bg-danger-light { background: #FFEBEE; }
  `]
})
export class AdminSchedulingComponent implements OnInit {
    private appointmentService = inject(AppointmentService);

    appointments = signal<any[]>([]);
    isLoading = signal(false);
    searchTerm = signal('');
    statusFilter = signal('All');

    pendingCount = signal(0);

    ngOnInit(): void {
        this.loadAppointments();
    }

    loadAppointments(): void {
        this.isLoading.set(true);
        this.appointmentService.getAllAppointments().subscribe({
            next: (res: any) => {
                const data = res?.data || res || [];
                this.appointments.set(data);
                this.pendingCount.set(data.filter((a: any) => (a as any).status === 'Scheduled').length);
                this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false)
        });
    }

    filteredAppointments() {
        return this.appointments().filter(a => {
            const patientName = (a as any).patientName || '';
            const doctorName = (a as any).doctorName || '';
            const matchesSearch = (patientName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
                doctorName.toLowerCase().includes(this.searchTerm().toLowerCase()));
            const matchesStatus = this.statusFilter() === 'All' || (a as any).status === this.statusFilter();
            return matchesSearch && matchesStatus;
        });
    }

    cancelAppointment(id: string): void {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            this.appointmentService.deleteAppointment(id).subscribe({
                next: () => this.loadAppointments()
            });
        }
    }
}
