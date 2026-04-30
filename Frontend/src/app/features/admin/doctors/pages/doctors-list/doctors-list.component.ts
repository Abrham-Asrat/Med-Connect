import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctors-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-people me-2"></i>Doctors Management</h4>
        <div>
          <span class="badge bg-primary me-2">{{ totalDoctors() }} Total</span>
          <span class="badge bg-success me-2">{{ activeDoctors() }} Active</span>
          <span class="badge bg-danger">{{ suspendedDoctors() }} Suspended</span>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <input type="text" class="form-control" placeholder="Search doctors by name or email..." 
                     [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
            </div>
            <div class="col-md-3">
              <select class="form-select" (change)="filterBySpecialty($any($event.target).value)">
                <option value="">All Specialties</option>
                @for (s of specialties(); track s) { <option [value]="s">{{ s }}</option> }
              </select>
            </div>
            <div class="col-md-3">
              <select class="form-select" (change)="filterByStatus($any($event.target).value)">
                <option value="">All Status</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-primary w-100" (click)="resetFilters()">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Doctors Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Doctor</th>
                <th>Specialty</th>
                <th>Experience</th>
                <th>Rating</th>
                <th>Patients</th>
                <th>Earnings</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (doc of filteredDoctors(); track doc.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                           style="width:40px;height:40px;font-size:16px;font-weight:700">
                        {{ doc.firstName.charAt(0) }}{{ doc.lastName.charAt(0) }}
                      </div>
                      <div>
                        <strong>{{ doc.firstName }} {{ doc.lastName }}</strong><br>
                        <small class="text-medium">{{ doc.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge bg-primary-light text-primary">{{ doc.specialty }}</span></td>
                  <td>{{ doc.experience }} yrs</td>
                  <td>
                    <span class="text-warning">⭐ {{ doc.rating }}</span>
                    <small class="text-medium">({{ doc.reviewCount }})</small>
                  </td>
                  <td>{{ doc.patientCount }}</td>
                  <td><strong class="text-primary">{{ doc.earnings.toLocaleString() }} ETB</strong></td>
                  <td>
                    <span class="badge" [class.bg-primary-light]="doc.status==='Approved'" 
                          [class.text-primary]="doc.status==='Approved'"
                          [class.bg-warning-light]="doc.status==='Pending'" 
                          [class.text-warning-dark]="doc.status==='Pending'"
                          [class.bg-danger-light]="doc.status==='Suspended'" 
                          [class.text-danger]="doc.status==='Suspended'">
                      {{ doc.status }}
                    </span>
                  </td>
                  <td>
                    <div class="dropdown">
                      <button class="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                        Actions
                      </button>
                      <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#"><i class="bi bi-eye me-2"></i>View Profile</a></li>
                        <li><a class="dropdown-item" href="#"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                        @if (doc.status === 'Approved') {
                          <li><a class="dropdown-item text-danger" href="#"><i class="bi bi-pause-circle me-2"></i>Suspend</a></li>
                        }
                        @if (doc.status === 'Suspended') {
                          <li><a class="dropdown-item text-success" href="#"><i class="bi bi-play-circle me-2"></i>Reactivate</a></li>
                        }
                      </ul>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="card-footer bg-white d-flex justify-content-between align-items-center">
          <small class="text-medium">Showing {{ filteredDoctors().length }} of {{ totalDoctors() }} doctors</small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
              <li class="page-item active"><a class="page-link bg-primary border-primary" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class DoctorsListComponent {
  searchTerm = signal('');
  selectedSpecialty = signal('');
  selectedStatus = signal('');

  totalDoctors = signal(245);
  activeDoctors = signal(230);
  suspendedDoctors = signal(3);

  specialties = signal(['Cardiology','Neurology','Pediatrics','Dermatology','Orthopedics','Gynecology','Psychiatry','Internal Medicine','General Practice']);

  doctors = signal([
    { id:'1', firstName:'Sarah', lastName:'Johnson', email:'sarah@email.com', specialty:'Cardiology', experience:12, rating:4.8, reviewCount:124, patientCount:450, earnings:320000, status:'Approved' },
    { id:'2', firstName:'Abebe', lastName:'Kebede', email:'abebe@email.com', specialty:'Neurology', experience:15, rating:4.9, reviewCount:89, patientCount:380, earnings:280000, status:'Approved' },
    { id:'3', firstName:'Tirunesh', lastName:'Desta', email:'tirunesh@email.com', specialty:'Dermatology', experience:8, rating:4.7, reviewCount:201, patientCount:520, earnings:195000, status:'Approved' },
    { id:'4', firstName:'Yonas', lastName:'Tadesse', email:'yonas@email.com', specialty:'Pediatrics', experience:20, rating:4.9, reviewCount:156, patientCount:600, earnings:210000, status:'Approved' },
    { id:'5', firstName:'Meseret', lastName:'Alemu', email:'meseret@email.com', specialty:'Gynecology', experience:10, rating:4.6, reviewCount:178, patientCount:410, earnings:240000, status:'Approved' },
    { id:'6', firstName:'Abebe', lastName:'Tadesse', email:'abebe2@email.com', specialty:'Cardiology', experience:12, rating:0, reviewCount:0, patientCount:0, earnings:0, status:'Pending' },
    { id:'7', firstName:'Kebede', lastName:'Assefa', email:'kebede@email.com', specialty:'Psychiatry', experience:6, rating:4.2, reviewCount:45, patientCount:120, earnings:85000, status:'Suspended' },
  ]);

  filteredDoctors() {
    let result = this.doctors();
    const term = this.searchTerm().toLowerCase();
    const spec = this.selectedSpecialty();
    const status = this.selectedStatus();

    if (term) result = result.filter(d => d.firstName.toLowerCase().includes(term) || d.lastName.toLowerCase().includes(term) || d.email.toLowerCase().includes(term));
    if (spec) result = result.filter(d => d.specialty === spec);
    if (status) result = result.filter(d => d.status === status);
    return result;
  }

  filterBySpecialty(value: string): void { this.selectedSpecialty.set(value); }
  filterByStatus(value: string): void { this.selectedStatus.set(value); }
  resetFilters(): void { this.searchTerm.set(''); this.selectedSpecialty.set(''); this.selectedStatus.set(''); }
}