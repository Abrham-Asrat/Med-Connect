import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
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
    .brand-panel { background: linear-gradient(135deg, #078930, #056B24); }
    .card { max-width: 600px; }
    .step-indicator { display: flex; align-items: center; justify-content: center; }
    .step-indicator .step {
      width: 32px; height: 32px; border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      border: 2px solid #E5E7EB; font-weight: 700; font-size: 14px;
      background: white; color: #6B7280;
    }
    .step-indicator .step.active  { background: #078930; color: white; border-color: #078930; }
    .step-indicator .step.complete { background: #078930; color: white; border-color: #078930; }
    .step-indicator .line { width: 40px; height: 2px; background: #E5E7EB; }
    .step-indicator .line.complete { background: #078930; }
  `]
})
export class RegisterComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  step = signal(1);
  selectedRole = signal<UserRole | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Track which field caused the server-side duplicate error so we can
  // clear the message as soon as the user edits that specific field.
  private duplicateField = signal<'email' | 'phone' | null>(null);
  private formSubs: Subscription[] = [];

  // ── Forms ──────────────────────────────────────────────────────────────
  commonForm = this.fb.group({
    firstName:            ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    lastName:             ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
    email:                ['', [Validators.required, Validators.email]],
    password:             ['', [Validators.required, Validators.minLength(8)]],
    phone:                ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    gender:               ['', Validators.required],
    dateOfBirth:          ['', Validators.required],
    address:              ['', [Validators.required, Validators.maxLength(500)]],
    emergencyContactPhone:[''],
  });

  doctorForm = this.fb.group({
    licenseNumber:        ['', Validators.required],
    specialty:            ['', Validators.required],
    experience:           ['', [Validators.required, Validators.min(0)]],
    qualifications:       ['', Validators.required],
    onlineAppointmentFee: [0,  [Validators.required, Validators.min(0)]],
    inPersonAppointmentFee:[0, [Validators.required, Validators.min(0)]],
  });

  // ── Lifecycle ──────────────────────────────────────────────────────────
  ngOnInit(): void {
    // Auto-clear the error message when the user edits the field that caused it.
    this.formSubs.push(
      this.commonForm.get('email')!.valueChanges.subscribe(() => {
        if (this.duplicateField() === 'email') {
          this.errorMessage.set(null);
          this.duplicateField.set(null);
        }
      }),
      this.commonForm.get('phone')!.valueChanges.subscribe(() => {
        if (this.duplicateField() === 'phone') {
          this.errorMessage.set(null);
          this.duplicateField.set(null);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.formSubs.forEach(s => s.unsubscribe());
  }

  // ── Navigation ─────────────────────────────────────────────────────────
  onRoleSelected(role: 'Patient' | 'Doctor'): void {
    this.selectedRole.set(role === 'Patient' ? UserRole.Patient : UserRole.Doctor);
    this.step.set(2);
  }

  backToRole(): void {
    this.step.set(1);
    this.selectedRole.set(null);
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  onSubmit(): void {
    if (this.commonForm.invalid) {
      this.commonForm.markAllAsTouched();
      return;
    }
    if (this.selectedRole() === UserRole.Doctor && this.doctorForm.invalid) {
      this.doctorForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.duplicateField.set(null);

    const cv = this.commonForm.value;
    const dv = this.selectedRole() === UserRole.Doctor ? this.doctorForm.value : null;

    const data: RegisterRequest = {
      firstName:   cv.firstName   || '',
      lastName:    cv.lastName    || '',
      email:       cv.email       || '',
      password:    cv.password    || '',
      phone:       cv.phone       || '',
      gender:      (cv.gender as 'Male' | 'Female' | 'Other') || 'Other',
      dateOfBirth: cv.dateOfBirth || '',
      address:     cv.address     || '',
      role:        this.selectedRole() || UserRole.Patient,
      emergencyContactPhone: cv.emergencyContactPhone || undefined,
      onlineAppointmentFee:  dv ? Number(dv.onlineAppointmentFee)  || 0 : 0,
      inPersonAppointmentFee:dv ? Number(dv.inPersonAppointmentFee)|| 0 : 0,
      ...(dv ? {
        licenseNumber:  dv.licenseNumber  || undefined,
        specialty:      dv.specialty      || undefined,
        experience:     dv.experience ? Number(dv.experience) : undefined,
        qualifications: dv.qualifications || undefined,
      } : {}),
    };

    this.authService.register(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.successMessage.set('Account created! Redirecting...');
          setTimeout(() => {
            this.router.navigate(['/auth/email-sent'], { queryParams: { email: data.email } });
          }, 1000);
        } else {
          this.handleServerError(response?.message || '', data);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        const msg: string = error?.error?.message || '';
        this.handleServerError(msg, data, error?.status);
      }
    });
  }

  private handleServerError(msg: string, data: RegisterRequest, status?: number): void {
    const lower = msg.toLowerCase();

    if (status === 409 || lower.includes('email') && lower.includes('already exist')) {
      this.duplicateField.set('email');
      this.errorMessage.set(
        `The email address "${data.email}" is already registered. Please use a different email or sign in.`
      );
    } else if (lower.includes('phone') && lower.includes('already exist')) {
      this.duplicateField.set('phone');
      this.errorMessage.set(
        `The phone number "${data.phone}" is already linked to another account. Please use a different number.`
      );
    } else if (lower.includes('already exist')) {
      // Generic duplicate — could be either field
      this.errorMessage.set(msg);
    } else {
      this.errorMessage.set(msg || 'Registration failed. Please check your connection and try again.');
    }
  }

  // Helper for template
  hasError(form: FormGroup, field: string, error: string): boolean {
    const control = form.get(field);
    return !!(control && control.touched && control.hasError(error));
  }
}
