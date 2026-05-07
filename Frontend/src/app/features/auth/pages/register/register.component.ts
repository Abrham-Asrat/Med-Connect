import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const birth = new Date(control.value);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= minAge ? null : { minAge: { required: minAge, actual: age } };
  };
}

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  return control.get('password')?.value === control.get('confirmPassword')?.value ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  selectedRole = signal<'Patient' | 'Doctor' | null>(null);
  currentStep = signal(1);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  cvFile = signal<File | null>(null);
  cvBase64 = signal<string | null>(null);

  passwordStrength = signal(0);
  strengthLabel = signal('');
  strengthWidth = signal('0%');
  strengthColor = signal('#E5E7EB');
  hasMinLength = signal(false);
  hasUpperCase = signal(false);
  hasNumber = signal(false);
  hasSpecial = signal(false);

  maxDate = signal(new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]);

  patientForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, minAgeValidator(18)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  }, { validators: passwordMatchValidator });

  doctorForm = this.fb.group({
    firstName: ['', [Validators.required, Validators.maxLength(50)]],
    lastName: ['', [Validators.required, Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    gender: ['', Validators.required],
    dateOfBirth: ['', [Validators.required, minAgeValidator(18)]],
    address: ['', [Validators.required, Validators.maxLength(500)]],
    specialty: [''],
    qualifications: [''],
    biography: [''],
    onlineAppointmentFee: [300, Validators.required],
    inPersonAppointmentFee: [500, Validators.required],
  }, { validators: passwordMatchValidator });

  specialties = ['Cardiology', 'Neurology', 'Pediatrics', 'Dermatology', 'Orthopedics', 'Gynecology', 'Psychiatry', 'Ophthalmology', 'Internal Medicine', 'General Practice', 'ENT', 'Dentistry'];

  getForm(): FormGroup { return this.selectedRole() === 'Patient' ? this.patientForm : this.doctorForm; }
  selectRole(role: 'Patient' | 'Doctor'): void { this.selectedRole.set(role); this.currentStep.set(2); }
  backToRole(): void { this.selectedRole.set(null); this.currentStep.set(1); this.errorMessage.set(null); this.successMessage.set(null); }

  nextStep(): void {
    const form = this.getForm();
    const step2Fields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'phone'];
    let valid = true;
    step2Fields.forEach(f => {
      const ctrl = form.get(f);
      if (ctrl?.invalid) { ctrl.markAsTouched(); valid = false; }
    });
    if (form.hasError('passwordMismatch')) { form.get('confirmPassword')?.markAsTouched(); valid = false; }
    if (valid) this.currentStep.set(3);
  }
  prevStep(): void { this.currentStep.set(2); }

  onCVSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) { this.cvFile.set(file); const r = new FileReader(); r.onload = () => this.cvBase64.set(r.result as string); r.readAsDataURL(file); }
  }
  removeCV(): void { this.cvFile.set(null); this.cvBase64.set(null); }

  checkPasswordStrength(password: string): void {
    let s = 0;
    this.hasMinLength.set(password.length >= 8);
    this.hasUpperCase.set(/[A-Z]/.test(password));
    this.hasNumber.set(/\d/.test(password));
    this.hasSpecial.set(/[!@#$%^&*(),.?":{}|<>]/.test(password));
    if (password.length >= 8) s++; if (/[A-Z]/.test(password)) s++;
    if (/\d/.test(password)) s++; if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) s++;
    this.passwordStrength.set(s);
    switch (s) {
      case 0: this.strengthLabel.set(''); this.strengthWidth.set('0%'); this.strengthColor.set('#E5E7EB'); break;
      case 1: this.strengthLabel.set('Weak'); this.strengthWidth.set('25%'); this.strengthColor.set('#DA121A'); break;
      case 2: this.strengthLabel.set('Fair'); this.strengthWidth.set('50%'); this.strengthColor.set('#FCD116'); break;
      case 3: this.strengthLabel.set('Good'); this.strengthWidth.set('75%'); this.strengthColor.set('#007BFF'); break;
      case 4: this.strengthLabel.set('Strong'); this.strengthWidth.set('100%'); this.strengthColor.set('#078930'); break;
    }
  }

  onSubmit(): void {
    const form = this.getForm();
    if (form.invalid) { form.markAllAsTouched(); return; }
    this.isLoading.set(true); this.errorMessage.set(null); this.successMessage.set(null);
    const v: any = form.value;
    const isPatient = this.selectedRole() === 'Patient';

    const data: any = {
      firstName: v.firstName, lastName: v.lastName, email: v.email,
      password: v.password, phone: v.phone, gender: v.gender,
      dateOfBirth: v.dateOfBirth, address: v.address,
      role: this.selectedRole() || 'Patient',
      onlineAppointmentFee: isPatient ? 0 : (v.onlineAppointmentFee || 300),
      inPersonAppointmentFee: isPatient ? 0 : (v.inPersonAppointmentFee || 500),
    };
    if (isPatient) {
      if (v.emergencyContactName) data.emergencyContactName = v.emergencyContactName;
      if (v.emergencyContactPhone) data.emergencyContactPhone = v.emergencyContactPhone;
    } else {
      if (v.specialty) data.specialties = [v.specialty];
      if (v.qualifications) data.qualifications = v.qualifications;
      if (v.biography) data.biography = v.biography;
      data.doctorStatus = 0;
      if (this.cvFile() && this.cvBase64()) {
        data.cv = { fileName: this.cvFile()!.name, mimeType: this.cvFile()!.type || 'application/pdf', fileDataBase64: this.cvBase64()!.split(',')[1] || this.cvBase64() };
      }
    }

    this.authService.register(data).subscribe({
      next: (r: any) => {
        this.isLoading.set(false);
        if (r?.success) {
          if (r.data?.patientId) localStorage.setItem('patientId', r.data.patientId);
          if (r.data?.doctorId) localStorage.setItem('doctorId', r.data.doctorId);

          const isDoctor = this.selectedRole() === 'Doctor';
          localStorage.setItem('pendingEmail', data.email);
          localStorage.setItem('pendingRole', this.selectedRole() || '');

          this.successMessage.set(
            isDoctor
              ? 'Application submitted! Please check your email for a verification link. Admin review within 1-3 days.'
              : 'Account created! Please check your email for a verification link before logging in.'
          );
        } else {
          this.errorMessage.set(r?.message || 'Registration failed.');
        }
      },
      error: (e: any) => { this.isLoading.set(false); this.errorMessage.set(e?.error?.message || 'Registration failed.'); }
    });
  }
}