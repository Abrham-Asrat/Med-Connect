import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../../core/services/admin.service';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients-list.component.html',
  styles: [`
    .patient-row { transition: all 0.2s; }
    .patient-row:hover { background: #E8F5EC; }
  `]
})
export class PatientsListComponent implements OnInit {
  private adminService = inject(AdminService);

  patients = signal<any[]>([]);
  filteredPatients = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  searchTerm = signal('');
  selectedGender = signal('');
  selectedStatus = signal('');

  totalPatients = signal(0);
  activePatients = signal(0);
  newThisMonth = signal(0);

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.adminService.getAllPatients().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        this.patients.set(Array.isArray(data) ? data : []);
        this.applyFilters();
        this.calculateStats();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error.status === 403) {
          this.errorMessage.set('Access denied. Admin privileges required.');
        } else {
          this.errorMessage.set('Failed to load patients.');
        }
        console.error('Error:', error);
      }
    });
  }

  calculateStats(): void {
    const all = this.patients();
    this.totalPatients.set(all.length);
    this.activePatients.set(all.filter(p => p.status === 'Active' || !p.status).length);
    
    // Count new this month
    const now = new Date();
    const thisMonth = all.filter(p => {
      const created = new Date(p.createdAt || p.joinedAt || p.registeredAt || now);
      return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    });
    this.newThisMonth.set(thisMonth.length);
  }

  applyFilters(): void {
    let result = [...this.patients()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(p => 
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(term) ||
        (p.email || '').toLowerCase().includes(term) ||
        (p.phone || '').includes(term)
      );
    }
    if (this.selectedGender()) {
      result = result.filter(p => p.gender === this.selectedGender());
    }
    if (this.selectedStatus()) {
      result = result.filter(p => p.status === this.selectedStatus() || (!p.status && this.selectedStatus() === 'Active'));
    }

    this.filteredPatients.set(result);
  }

  filterByGender(value: string): void { this.selectedGender.set(value); this.applyFilters(); }
  filterByStatus(value: string): void { this.selectedStatus.set(value); this.applyFilters(); }
  resetFilters(): void { this.searchTerm.set(''); this.selectedGender.set(''); this.selectedStatus.set(''); this.applyFilters(); }
}