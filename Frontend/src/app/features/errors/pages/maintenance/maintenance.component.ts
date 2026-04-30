import { Component } from '@angular/core';

@Component({
  selector: 'app-maintenance',
  standalone: true,
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="text-center p-5">
        <i class="bi bi-tools text-warning" style="font-size: 80px;"></i>
        <h1 class="display-3 fw-bold text-warning mt-3">503</h1>
        <h4 class="text-dark mb-3">Under Maintenance</h4>
        <p class="text-medium mb-4">Med-Connect is temporarily unavailable while we perform scheduled maintenance.<br>We'll be back shortly.</p>
        <div class="alert alert-warning d-inline-block">
          <i class="bi bi-clock me-2"></i>Expected back by 6:00 AM EAT
        </div>
      </div>
    </div>
  `
})
export class MaintenanceComponent {}