import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { UserRole } from '../../../../core/enums/user-role.enum';
import { RegisterRequest } from '../../../../core/models/user.model';
import { RoleSelectionComponent } from '../../components/role-selection/role-selection';
import { PatientRegistrationComponent } from '../../components/patient-registration/patient-registration';
import { DoctorRegistrationComponent } from '../../components/doctor-registration/doctor-registration';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    RoleSelectionComponent,
    PatientRegistrationComponent,
    DoctorRegistrationComponent
  ],
  templateUrl: './register.component.html',
  styles: [`
    .brand-panel {
      background: linear-gradient(135deg, #078930, #056B24);
    }
    .card {
      max-width: 600px;
    }
    .step-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .step-indicator .step {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #E5E7EB;
      font-weight: 700;
      font-size: 14px;
      background: white;
      color: #6B7280;
    }
    .step-indicator .step.active {
      background: #078930;
      color: white;
      border-color: #078930;
    }
    .step-indicator .step.complete {
      background: #078930;
      color: white;
      border-color: #078930;
    }
    .step-indicator .line {
      width: 40px;
      height: 2px;
      background: #E5E7EB;
    }
    .step-indicator .line.complete {
      background: #078930;
    }
  `]
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  step = signal(1);
  selectedRole = signal<UserRole | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Common form for both roles
  commonForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    phone: [''],
    emergencyContactPhone: [''],
  });

  // Doctor-specific form
  doctorForm = this.fb.group({
    licenseNumber: ['', Validators.required],
    specialty: ['', Validators.required],
    experience: ['', [Validators.required, Validators.min(0)]],
    qualifications: ['', Validators.required],
  });

  onRoleSelected(role: 'Patient' | 'Doctor'): void {
    this.selectedRole.set(role === 'Patient' ? UserRole.Patient : UserRole.Doctor);
    this.step.set(2);
  }

  backToRole(): void {
    this.step.set(1);
    this.selectedRole.set(null);
  }

  onSubmit(): void {
    // Mark all as touched for validation display
    if (this.commonForm.invalid) {
      Object.keys(this.commonForm.controls).forEach(key => {
        this.commonForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (this.selectedRole() === UserRole.Doctor && this.doctorForm.invalid) {
      Object.keys(this.doctorForm.controls).forEach(key => {
        this.doctorForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // Build the registration data
    const commonValues = this.commonForm.value;
    const doctorValues = this.selectedRole() === UserRole.Doctor ? this.doctorForm.value : null;

    const data: RegisterRequest = {
      firstName: commonValues.firstName || '',
      lastName: commonValues.lastName || '',
      email: commonValues.email || '',
      password: commonValues.password || '',
      phone: commonValues.phone || undefined,
      gender: (commonValues.gender as 'Male' | 'Female' | 'Other') || 'Other',
      dateOfBirth: commonValues.dateOfBirth || '',
      role: this.selectedRole() || UserRole.Patient,
      emergencyContactPhone: commonValues.emergencyContactPhone || undefined,
      ...(doctorValues ? {
        licenseNumber: doctorValues.licenseNumber || undefined,
        specialty: doctorValues.specialty || undefined,
        experience: doctorValues.experience ? Number(doctorValues.experience) : undefined,
        qualifications: doctorValues.qualifications || undefined,
      } : {}),
    };

    this.authService.register(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.successMessage.set('Account created successfully! Redirecting to OTP verification...');
          setTimeout(() => {
            this.router.navigate(['/auth/verify-otp'], {
              queryParams: { email: data.email }
            });
          }, 1500);
        } else {
          this.errorMessage.set(response?.message || 'Registration failed. Please try again.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        if (error?.status === 409) {
          this.errorMessage.set('An account with this email already exists.');
        } else {
          this.errorMessage.set(
            error?.error?.message || 'Registration failed. Please check your connection and try again.'
          );
        }
      }
    });
  }

  // Helper for template
  hasError(form: FormGroup, field: string, error: string): boolean {
    const control = form.get(field);
    return !!(control && control.touched && control.hasError(error));
  }
}