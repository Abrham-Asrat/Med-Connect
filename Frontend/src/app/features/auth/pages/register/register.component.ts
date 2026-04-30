import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { RegisterRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styles: [`
    .brand-panel { background: linear-gradient(135deg, #078930, #056B24); }
    .form-card { max-width: 600px; }
    .step-dot { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; border: 2px solid #E5E7EB; background: white; color: #6B7280; transition: all 0.3s ease; }
    .step-dot.active { background: #078930; color: white; border-color: #078930; }
    .step-dot.done { background: #078930; color: white; border-color: #078930; }
    .step-line { width: 40px; height: 2px; background: #E5E7EB; transition: all 0.3s ease; }
    .step-line.done { background: #078930; }
    .role-card { cursor: pointer; border: 2px solid #E5E7EB; border-radius: 16px; padding: 24px; text-align: center; transition: all 0.3s ease; }
    .role-card:hover, .role-card.selected { border-color: #078930; background: #E8F5EC; }
    .role-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 12px; }
    .upload-zone { border: 2px dashed #E5E7EB; border-radius: 12px; padding: 24px; text-align: center; cursor: pointer; transition: all 0.3s ease; }
    .upload-zone:hover, .upload-zone.has-file { border-color: #078930; background: #E8F5EC; }
    .timeline-item { display: flex; align-items: center; gap: 8px; }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // Steps: 1=Role, 2=Account, 3=Professional (Doctor only), 4=Documents (Doctor only), 5=Done
  step = signal(1);
  totalSteps = signal(2); // 2 for Patient, 4 for Doctor
  selectedRole = signal<UserRole | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);

  // Files
  cvFile = signal<File | null>(null);
  certFiles = signal<File[]>([]);

  // Common form (Step 2)
  accountForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  });

  // Doctor Professional form (Step 3)
  professionalForm = this.fb.group({
    licenseNumber: ['', Validators.required],
    specialty: ['', Validators.required],
    experience: ['', [Validators.required, Validators.min(0)]],
    qualifications: ['', Validators.required],
    biography: [''],
    onlineAppointmentFee: [0],
    inPersonAppointmentFee: [0],
  });

  specialties = ['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Gynecology', 'Psychiatry', 'Ophthalmology', 'Internal Medicine', 'General Practice', 'ENT', 'Dentistry'];

  // ─── Navigation ──────────────────────────────

  selectRole(role: string): void {
    this.selectedRole.set(role === 'Patient' ? UserRole.Patient : UserRole.Doctor);
    if (role === 'Patient') {
      this.totalSteps.set(2);
    } else {
      this.totalSteps.set(4);
    }
    this.step.set(2);
  }

  nextStep(): void {
    if (this.step() === 2 && this.isDoctor()) {
      if (this.accountForm.invalid) {
        this.accountForm.markAllAsTouched();
        return;
      }
    }
    if (this.step() === 3 && this.isDoctor()) {
      if (this.professionalForm.invalid) {
        this.professionalForm.markAllAsTouched();
        return;
      }
    }
    this.step.update(v => Math.min(v + 1, this.totalSteps()));
  }

  prevStep(): void { this.step.update(v => Math.max(v - 1, 1)); }

  isDoctor(): boolean { return this.selectedRole() === UserRole.Doctor; }
  isPatient(): boolean { return this.selectedRole() === UserRole.Patient; }

  // ─── File Handling ───────────────────────────

  onCVSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) this.cvFile.set(input.files[0]);
  }

  removeCV(): void { this.cvFile.set(null); }

  onCertsSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.certFiles.update(f => [...f, ...Array.from(input.files!)]);
  }

  removeCert(index: number): void { this.certFiles.update(f => f.filter((_, i) => i !== index)); }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  // ─── Submit ──────────────────────────────────

  onSubmit(): void {
    if (this.isPatient() && this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    if (this.isDoctor() && (this.accountForm.invalid || this.professionalForm.invalid)) {
      this.accountForm.markAllAsTouched();
      this.professionalForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const a = this.accountForm.value;
    const p = this.isDoctor() ? this.professionalForm.value : null;

    const data: any = {
      firstName: a.firstName || '',
      lastName: a.lastName || '',
      email: a.email || '',
      password: a.password || '',
      phone: a.phone || '',
      gender: a.gender || '',
      dateOfBirth: a.dateOfBirth || '',
      address: a.address || '',
      role: this.selectedRole() || 'Patient',
      onlineAppointmentFee: p?.onlineAppointmentFee || 0,
      inPersonAppointmentFee: p?.inPersonAppointmentFee || 0,
      emergencyContactName: a.emergencyContactName || '',
      emergencyContactPhone: a.emergencyContactPhone || '',
      ...(this.isDoctor() ? {
        specialties: [p?.specialty || 'General Practice'],
        qualifications: p?.qualifications || '',
        biography: p?.biography || '',
        doctorStatus: 0,
      } : {}),
    };

    console.log('Sending:', JSON.stringify(data, null, 2));

    this.authService.register(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.step.set(this.totalSteps()); // Show success step
          this.authService.resendOTP(data.email).subscribe();
        } else {
          this.errorMessage.set(response?.message || 'Registration failed.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Registration failed.');
      }
    });
  }

  goToOTP(): void {
    this.router.navigate(['/auth/verify-otp'], { queryParams: { email: this.accountForm.value.email } });
  }
}