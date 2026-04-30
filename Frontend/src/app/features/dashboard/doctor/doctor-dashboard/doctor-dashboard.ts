import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-doctor-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <!-- Stats Row -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-left-primary h-100" style="border-left: 4px solid #078930;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Today's Appointments</p>
              <h3 class="text-primary mb-0">8</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left: 4px solid #FCD116;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Pending Confirmations</p>
              <h3 class="text-warning-dark mb-0">3</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left: 4px solid #078930;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Total Patients</p>
              <h3 class="text-primary mb-0">245</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left: 4px solid #007BFF;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Monthly Earnings</p>
              <h3 class="text-secondary mb-0">45,000 ETB</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Schedule -->
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="text-primary mb-0"><i class="bi bi-calendar-check me-2"></i>Today's Schedule</h5>
        </div>
        <div class="card-body">
          @for (apt of todayAppointments(); track apt.id) {
            <div class="d-flex align-items-center justify-content-between p-3 border rounded mb-2">
              <div class="d-flex align-items-center gap-3">
                <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                     style="width:44px;height:44px">{{ apt.patient.charAt(0) }}</div>
                <div>
                  <h6 class="mb-0">{{ apt.patient }}</h6>
                  <small class="text-medium">{{ apt.time }} - {{ apt.type }}</small>
                </div>
              </div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge" [class.bg-primary-light]="apt.status==='confirmed'"
                      [class.text-primary]="apt.status==='confirmed'"
                      [class.bg-warning-light]="apt.status==='pending'"
                      [class.text-warning-dark]="apt.status==='pending'">
                  {{ apt.status }}
                </span>
                @if (apt.status === 'pending') {
                  <button class="btn btn-primary btn-sm">Confirm</button>
                  <button class="btn btn-outline-danger btn-sm">Decline</button>
                }
                @if (apt.status === 'confirmed' && apt.type === 'Online') {
                  <button class="btn btn-primary btn-sm"><i class="bi bi-camera-video me-1"></i>Start Call</button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DoctorDashboardComponent {
  user = inject(AuthService).currentUser;

  todayAppointments = signal([
    { id: '1', patient: 'Abebe Tesfaye', time: '9:00 AM', type: 'In-Person', status: 'confirmed' },
    { id: '2', patient: 'Meron Haile', time: '10:30 AM', type: 'Online', status: 'confirmed' },
    { id: '3', patient: 'Dawit Mekonnen', time: '2:00 PM', type: 'Online', status: 'pending' },
    { id: '4', patient: 'Sara Tadesse', time: '3:30 PM', type: 'In-Person', status: 'pending' },
  ]);
}