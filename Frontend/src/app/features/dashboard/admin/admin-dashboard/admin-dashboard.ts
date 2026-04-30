import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container-fluid p-4">
      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card border-left-danger h-100" style="border-left:4px solid #DA121A;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Pending Approvals</p>
              <h3 class="text-danger mb-0">12</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #078930;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Total Doctors</p>
              <h3 class="text-primary mb-0">245</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #007BFF;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Total Patients</p>
              <h3 class="text-secondary mb-0">12,450</h3>
            </div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card h-100" style="border-left:4px solid #FCD116;">
            <div class="card-body">
              <p class="text-medium mb-0" style="font-size:13px">Revenue</p>
              <h3 class="text-warning-dark mb-0">1.2M ETB</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Pending Doctors -->
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between align-items-center">
          <h5 class="text-danger mb-0"><i class="bi bi-clock me-2"></i>Pending Doctor Approvals</h5>
          <a routerLink="/admin/verification" class="btn btn-primary btn-sm">Review All</a>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th>Doctor</th><th>Specialty</th><th>Submitted</th><th>Documents</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Dr. Abebe Tadesse</strong><br><small class="text-medium">Cardiology</small></td>
                  <td><span class="badge bg-primary-light text-primary">Cardiology</span></td>
                  <td><small>Apr 25, 2026</small></td>
                  <td><i class="bi bi-file-pdf text-primary"></i> CV + 2 Certificates</td>
                  <td>
                    <button class="btn btn-primary btn-sm me-1">Approve</button>
                    <button class="btn btn-outline-danger btn-sm">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>Dr. Tirunesh Bekele</strong><br><small class="text-medium">Neurology</small></td>
                  <td><span class="badge bg-primary-light text-primary">Neurology</span></td>
                  <td><small>Apr 26, 2026</small></td>
                  <td><i class="bi bi-file-pdf text-primary"></i> CV + 1 Certificate</td>
                  <td>
                    <button class="btn btn-primary btn-sm me-1">Approve</button>
                    <button class="btn btn-outline-danger btn-sm">Reject</button>
                  </td>
                </tr>
                <tr>
                  <td><strong>Dr. Dawit Haile</strong><br><small class="text-medium">Pediatrics</small></td>
                  <td><span class="badge bg-primary-light text-primary">Pediatrics</span></td>
                  <td><small>Apr 27, 2026</small></td>
                  <td><i class="bi bi-file-pdf text-primary"></i> CV + 3 Certificates</td>
                  <td>
                    <button class="btn btn-primary btn-sm me-1">Approve</button>
                    <button class="btn btn-outline-danger btn-sm">Reject</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent {}