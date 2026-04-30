import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-gear me-2"></i>Settings</h4>

      <div class="row g-4">
        <div class="col-lg-6">
          <!-- Profile -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="text-primary mb-0">Profile Information</h5></div>
            <div class="card-body">
              <div class="text-center mb-3">
                <div class="rounded-circle bg-primary-light text-primary d-inline-flex align-items-center justify-content-center mb-2"
                     style="width:80px;height:80px;font-size:30px;font-weight:700">JD</div>
                <br><button class="btn btn-outline-primary btn-sm">Change Photo</button>
              </div>
              <div class="row g-3">
                <div class="col-md-6"><label class="form-label">First Name</label><input class="form-control" value="John"></div>
                <div class="col-md-6"><label class="form-label">Last Name</label><input class="form-control" value="Doe"></div>
                <div class="col-12"><label class="form-label">Email</label><input class="form-control" value="john@example.com" readonly></div>
                <div class="col-12"><label class="form-label">Phone</label><input class="form-control" value="+251-XXX-XXX"></div>
              </div>
              <button class="btn btn-primary mt-3">Save Changes</button>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <!-- Security -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="text-primary mb-0">Security</h5></div>
            <div class="card-body">
              <div class="mb-3"><label class="form-label">Current Password</label><input type="password" class="form-control"></div>
              <div class="mb-3"><label class="form-label">New Password</label><input type="password" class="form-control"></div>
              <div class="mb-3"><label class="form-label">Confirm Password</label><input type="password" class="form-control"></div>
              <button class="btn btn-primary">Update Password</button>
            </div>
          </div>

          <!-- Notification Prefs -->
          <div class="card mb-4">
            <div class="card-header bg-white"><h5 class="text-primary mb-0">Notifications</h5></div>
            <div class="card-body">
              @for (pref of notifications(); track pref.label) {
                <div class="form-check form-switch mb-2">
                  <input class="form-check-input" type="checkbox" [checked]="pref.enabled">
                  <label class="form-check-label">{{ pref.label }}</label>
                </div>
              }
            </div>
          </div>

          <!-- Danger Zone -->
          <div class="card border-danger">
            <div class="card-header bg-white"><h5 class="text-danger mb-0">Danger Zone</h5></div>
            <div class="card-body">
              <p class="text-medium">Delete your account and all data permanently.</p>
              <button class="btn btn-outline-danger">Delete Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SettingsComponent {
  notifications = signal([
    { label: 'Appointment reminders', enabled: true },
    { label: 'New messages', enabled: true },
    { label: 'Payment receipts', enabled: true },
    { label: 'Review requests', enabled: true },
    { label: 'Marketing emails', enabled: false },
  ]);
}