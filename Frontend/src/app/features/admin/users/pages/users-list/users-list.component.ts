import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../../../core/services/admin.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-people me-2"></i>Users Management</h4>
      <div class="card"><div class="table-responsive"><table class="table table-hover mb-0">
        <thead><tr><th>User</th><th>Role</th><th>Email</th><th>Phone</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          @if (isLoading()) { <tr><td colspan="6" class="text-center py-4"><div class="spinner-border text-primary"></div></td></tr> }
          @for (u of users(); track u.userId) {
            <tr>
              <td><strong>{{ u.firstName }} {{ u.lastName }}</strong></td>
              <td><span class="badge" [class.bg-primary-light]="u.role==='Patient'" [class.text-primary]="u.role==='Patient'" [class.bg-warning-light]="u.role==='Doctor'" [class.text-warning-dark]="u.role==='Doctor'" [class.bg-danger-light]="u.role==='Admin'" [class.text-danger]="u.role==='Admin'">{{ u.role }}</span></td>
              <td>{{ u.email }}</td>
              <td>{{ u.phone || 'N/A' }}</td>
              <td>{{ u.createdAt | date }}</td>
              <td>
                <button class="btn btn-outline-danger btn-sm" (click)="deactivateUser(u.userId)">Deactivate</button>
              </td>
            </tr>
          }
        </tbody>
      </table></div></div>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private adminService = inject(AdminService);
  users = signal<any[]>([]);
  isLoading = signal(false);

  ngOnInit(): void { this.loadUsers(); }

  loadUsers(): void {
    this.isLoading.set(true);
    this.adminService.getAllUsers().subscribe({
      next: (r: any) => { this.isLoading.set(false); this.users.set(r?.data || r || []); },
      error: () => this.isLoading.set(false)
    });
  }

  deactivateUser(userId: string): void {
    this.adminService.deactivateUser(userId).subscribe({
      next: () => this.loadUsers(),
      error: (e) => console.error('Error:', e)
    });
  }
}