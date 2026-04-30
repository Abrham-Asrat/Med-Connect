import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-appointments',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-calendar-check me-2"></i>My Appointments</h4>
      <div class="d-flex gap-2 mb-4">
        <button class="btn btn-primary btn-sm rounded-pill">Upcoming</button>
        <button class="btn btn-outline-primary btn-sm rounded-pill">Past</button>
        <button class="btn btn-outline-primary btn-sm rounded-pill">Cancelled</button>
      </div>
      @for (apt of appointments(); track apt.id) {
        <div class="card mb-3" style="border-left:4px solid #078930">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div><h6 class="mb-1">{{ apt.doctor }}</h6><small class="text-medium">{{ apt.date }} · {{ apt.time }} · {{ apt.type }}</small></div>
              <span class="badge" [class.bg-primary-light]="apt.status==='Confirmed'" [class.text-primary]="apt.status==='Confirmed'" [class.bg-warning-light]="apt.status==='Pending'" [class.text-warning-dark]="apt.status==='Pending'">{{ apt.status }}</span>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class MyAppointmentsComponent {
  appointments = signal([
    { id:'1', doctor:'Dr. Sarah Johnson', date:'May 15, 2026', time:'2:30 PM', type:'Online', status:'Confirmed' },
    { id:'2', doctor:'Dr. Abebe Kebede', date:'May 18, 2026', time:'10:00 AM', type:'In-Person', status:'Confirmed' },
    { id:'3', doctor:'Dr. Tirunesh Desta', date:'May 22, 2026', time:'3:00 PM', type:'Online', status:'Pending' },
    { id:'4', doctor:'Dr. Yonas Tadesse', date:'Mar 15, 2026', time:'9:00 AM', type:'In-Person', status:'Completed' },
  ]);
}