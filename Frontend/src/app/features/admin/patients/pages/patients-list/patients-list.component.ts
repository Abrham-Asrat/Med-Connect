import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-people-fill me-2"></i>Patients Management</h4>
        <div>
          <span class="badge bg-primary me-2">{{ totalPatients() }} Total</span>
          <span class="badge bg-success me-2">{{ activePatients() }} Active</span>
          <span class="badge bg-secondary">{{ inactivePatients() }} Inactive</span>
        </div>
      </div>

      <!-- Search & Filter -->
      <div class="card mb-4">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-5">
              <input type="text" class="form-control" placeholder="Search patients by name, email or phone..." 
                     [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
            </div>
            <div class="col-md-3">
              <select class="form-select" (change)="filterByGender($any($event.target).value)">
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div class="col-md-2">
              <select class="form-select" (change)="filterByStatus($any($event.target).value)">
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div class="col-md-2">
              <button class="btn btn-outline-primary w-100" (click)="resetFilters()">Reset</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-4">
          <div class="card text-center p-3" style="border-left:4px solid #078930">
            <h4 class="text-primary mb-0">{{ totalPatients() }}</h4><small class="text-medium">Total Patients</small>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="card text-center p-3" style="border-left:4px solid #FCD116">
            <h4 class="text-warning-dark mb-0">{{ newThisMonth() }}</h4><small class="text-medium">New This Month</small>
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div class="card text-center p-3" style="border-left:4px solid #007BFF">
            <h4 class="text-secondary mb-0">{{ totalAppointments() }}</h4><small class="text-medium">Total Appointments</small>
          </div>
        </div>
      </div>

      <!-- Patients Table -->
      <div class="card">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>Patient</th>
                <th>Gender</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Appointments</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              @for (p of filteredPatients(); track p.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                           style="width:40px;height:40px;font-size:16px;font-weight:700">
                        {{ p.firstName.charAt(0) }}{{ p.lastName.charAt(0) }}
                      </div>
                      <div>
                        <strong>{{ p.firstName }} {{ p.lastName }}</strong><br>
                        <small class="text-medium">{{ p.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ p.gender }}</td>
                  <td>{{ p.age }}</td>
                  <td>{{ p.phone }}</td>
                  <td><span class="badge bg-primary-light text-primary">{{ p.appointmentCount }}</span></td>
                  <td><strong class="text-primary">{{ p.totalSpent.toLocaleString() }} ETB</strong></td>
                  <td><small>{{ p.joinedAt }}</small></td>
                  <td>
                    <span class="badge" [class.bg-primary-light]="p.status==='Active'" [class.text-primary]="p.status==='Active'" [class.bg-secondary-light]="p.status==='Inactive'" [class.text-secondary]="p.status==='Inactive'">
                      {{ p.status }}
                    </span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="card-footer bg-white d-flex justify-content-between">
          <small class="text-medium">Showing {{ filteredPatients().length }} of {{ totalPatients() }} patients</small>
          <nav>
            <ul class="pagination pagination-sm mb-0">
              <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
              <li class="page-item active"><a class="page-link bg-primary border-primary" href="#">1</a></li>
              <li class="page-item"><a class="page-link" href="#">2</a></li>
              <li class="page-item"><a class="page-link" href="#">3</a></li>
              <li class="page-item"><a class="page-link" href="#">4</a></li>
              <li class="page-item"><a class="page-link" href="#">Next</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  `
})
export class PatientsListComponent {
  searchTerm = signal('');
  selectedGender = signal('');
  selectedStatus = signal('');

  totalPatients = signal(12450);
  activePatients = signal(11800);
  inactivePatients = signal(650);
  newThisMonth = signal(342);
  totalAppointments = signal(100200);

  patients = signal([
    { id:'1', firstName:'Abebe', lastName:'Tesfaye', email:'abebe@email.com', phone:'+251-911-123456', age:34, gender:'Male', appointmentCount:12, totalSpent:6500, joinedAt:'Jan 2025', status:'Active' },
    { id:'2', firstName:'Meron', lastName:'Haile', email:'meron@email.com', phone:'+251-922-654321', age:28, gender:'Female', appointmentCount:8, totalSpent:4200, joinedAt:'Mar 2025', status:'Active' },
    { id:'3', firstName:'Dawit', lastName:'Mekonnen', email:'dawit@email.com', phone:'+251-933-789012', age:45, gender:'Male', appointmentCount:20, totalSpent:12000, joinedAt:'Jun 2024', status:'Active' },
    { id:'4', firstName:'Sara', lastName:'Tadesse', email:'sara@email.com', phone:'+251-944-345678', age:31, gender:'Female', appointmentCount:5, totalSpent:2800, joinedAt:'Sep 2025', status:'Active' },
    { id:'5', firstName:'Henok', lastName:'Girma', email:'henok@email.com', phone:'+251-955-901234', age:52, gender:'Male', appointmentCount:15, totalSpent:8900, joinedAt:'Jan 2024', status:'Active' },
    { id:'6', firstName:'Tigist', lastName:'Alemu', email:'tigist@email.com', phone:'+251-966-567890', age:25, gender:'Female', appointmentCount:0, totalSpent:0, joinedAt:'Apr 2026', status:'Inactive' },
  ]);

  filteredPatients() {
    let result = this.patients();
    const term = this.searchTerm().toLowerCase();
    if (term) result = result.filter(p => p.firstName.toLowerCase().includes(term) || p.lastName.toLowerCase().includes(term) || p.email.toLowerCase().includes(term) || p.phone.includes(term));
    if (this.selectedGender()) result = result.filter(p => p.gender === this.selectedGender());
    if (this.selectedStatus()) result = result.filter(p => p.status === this.selectedStatus());
    return result;
  }

  filterByGender(value: string): void { this.selectedGender.set(value); }
  filterByStatus(value: string): void { this.selectedStatus.set(value); }
  resetFilters(): void { this.searchTerm.set(''); this.selectedGender.set(''); this.selectedStatus.set(''); }
}