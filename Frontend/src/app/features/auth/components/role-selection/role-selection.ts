import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mb-4">
      <label class="form-label fw-bold">I am a</label>
      <div class="row g-3">
        <!-- Patient Card -->
        <div class="col-6">
          <div class="card cursor-pointer h-100"
               [class.border-primary]="selectedRole() === 'Patient'"
               [class.bg-primary-light]="selectedRole() === 'Patient'"
               [class.shadow-green]="selectedRole() === 'Patient'"
               style="border-width: 2px; transition: all 0.2s ease;"
               (click)="selectRole('Patient')">
            <div class="card-body text-center p-3">
              <div class="mb-2">
                <i class="bi bi-person-heart fs-1"
                   [class.text-primary]="selectedRole() === 'Patient'"
                   [class.text-medium]="selectedRole() !== 'Patient'"></i>
              </div>
              <h6 class="mb-1">I'm a Patient</h6>
              <small class="text-medium">Find doctors, book appointments, get care</small>
              @if (selectedRole() === 'Patient') {
                <span class="badge bg-primary mt-2">
                  <i class="bi bi-check-lg"></i> Selected
                </span>
              }
            </div>
          </div>
        </div>

        <!-- Doctor Card -->
        <div class="col-6">
          <div class="card cursor-pointer h-100"
               [class.border-primary]="selectedRole() === 'Doctor'"
               [class.bg-primary-light]="selectedRole() === 'Doctor'"
               [class.shadow-green]="selectedRole() === 'Doctor'"
               style="border-width: 2px; transition: all 0.2s ease;"
               (click)="selectRole('Doctor')">
            <div class="card-body text-center p-3">
              <div class="mb-2">
                <i class="bi bi-stethoscope fs-1"
                   [class.text-primary]="selectedRole() === 'Doctor'"
                   [class.text-medium]="selectedRole() !== 'Doctor'"></i>
              </div>
              <h6 class="mb-1">I'm a Doctor</h6>
              <small class="text-medium">Join our verified practitioner network</small>
              @if (selectedRole() === 'Doctor') {
                <span class="badge bg-primary mt-2">
                  <i class="bi bi-check-lg"></i> Selected
                </span>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Doctor Warning -->
      @if (selectedRole() === 'Doctor') {
        <div class="alert alert-warning mt-3 d-flex align-items-center gap-2">
          <i class="bi bi-shield-exclamation"></i>
          <small>Requires credential verification & admin approval. You cannot access the platform until approved.</small>
        </div>
      }
    </div>
  `,
  styles: [`
    .cursor-pointer { cursor: pointer; }
    .card:hover { border-color: #078930 !important; }
  `]
})
export class RoleSelectionComponent {
  @Output() roleSelected = new EventEmitter<'Patient' | 'Doctor'>();
  selectedRole = signal<'Patient' | 'Doctor' | null>(null);

  selectRole(role: 'Patient' | 'Doctor'): void {
    this.selectedRole.set(role);
    this.roleSelected.emit(role);
  }
}