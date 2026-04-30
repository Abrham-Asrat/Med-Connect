import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-calendar-week me-2"></i>Manage Schedule</h4>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-primary btn-sm" [class.active]="viewMode()==='week'" (click)="viewMode.set('week')">Weekly</button>
          <button class="btn btn-outline-primary btn-sm" [class.active]="viewMode()==='month'" (click)="viewMode.set('month')">Monthly</button>
          <span class="form-check form-switch ms-3">
            <input class="form-check-input" type="checkbox" [checked]="acceptingAppointments()" (change)="acceptingAppointments.set(!acceptingAppointments())">
            <label class="form-check-label">{{ acceptingAppointments() ? 'Accepting' : 'Not Accepting' }}</label>
          </span>
        </div>
      </div>

      <!-- Status Card -->
      <div class="card bg-primary text-white mb-4">
        <div class="card-body row text-center">
          <div class="col-4"><small>Available Hours</small><h4 class="mb-0">42h</h4></div>
          <div class="col-4"><small>Available Days</small><h4 class="mb-0">6</h4></div>
          <div class="col-4"><small>Open Slots</small><h4 class="mb-0">84</h4></div>
        </div>
      </div>

      <!-- Weekly Schedule -->
      <div class="card">
        <div class="card-header bg-white"><h5 class="text-primary mb-0">Weekly Schedule</h5></div>
        <div class="card-body">
          @for (day of days(); track day.name) {
            <div class="d-flex align-items-center p-3 border-bottom">
              <div style="width:120px">
                <strong>{{ day.name }}</strong>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" [checked]="day.enabled" (change)="toggleDay(day.name)">
                </div>
              </div>
              @if (day.enabled) {
                <div class="d-flex gap-2 flex-wrap">
                  @for (slot of day.slots; track slot) {
                    <span class="badge bg-primary-light text-primary p-2 px-3">{{ slot }}</span>
                  }
                  <button class="btn btn-outline-primary btn-sm rounded-circle">+</button>
                </div>
              } @else {
                <span class="text-medium">Not available</span>
              }
            </div>
          }
        </div>
      </div>

      <!-- Away/Vacation -->
      <div class="card mt-4">
        <div class="card-header bg-white"><h5 class="text-primary mb-0"><i class="bi bi-airplane me-2"></i>Away Mode</h5></div>
        <div class="card-body">
          <p class="text-medium">Block dates when you're unavailable for appointments.</p>
          <div class="row g-3">
            <div class="col-md-4"><input type="date" class="form-control" placeholder="From"></div>
            <div class="col-md-4"><input type="date" class="form-control" placeholder="To"></div>
            <div class="col-md-4"><button class="btn btn-warning">Block Dates</button></div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ScheduleManagementComponent {
  viewMode = signal<'week' | 'month'>('week');
  acceptingAppointments = signal(true);

  days = signal([
    { name: 'Monday', enabled: true, slots: ['8:00-12:00', '1:00-5:00'] },
    { name: 'Tuesday', enabled: true, slots: ['8:00-12:00', '1:00-5:00'] },
    { name: 'Wednesday', enabled: true, slots: ['9:00-1:00', '2:00-6:00'] },
    { name: 'Thursday', enabled: true, slots: ['8:00-12:00', '1:00-5:00'] },
    { name: 'Friday', enabled: true, slots: ['8:00-12:00'] },
    { name: 'Saturday', enabled: true, slots: ['9:00-1:00'] },
    { name: 'Sunday', enabled: false, slots: [] },
  ]);

  toggleDay(name: string): void {
    this.days.update(days => days.map(d => d.name === name ? { ...d, enabled: !d.enabled } : d));
  }
}