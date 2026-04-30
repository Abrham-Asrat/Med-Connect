import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">First Name *</label>
          <input type="text" class="form-control" formControlName="firstName" placeholder="Enter first name"
                 [class.is-invalid]="isInvalid('firstName')">
          <div class="invalid-feedback">First name is required (1-50 chars)</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Last Name *</label>
          <input type="text" class="form-control" formControlName="lastName" placeholder="Enter last name"
                 [class.is-invalid]="isInvalid('lastName')">
          <div class="invalid-feedback">Last name is required (1-50 chars)</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Email Address *</label>
        <input type="email" class="form-control" formControlName="email" placeholder="you@example.com"
               [class.is-invalid]="isInvalid('email')">
        <div class="invalid-feedback">Valid email is required</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Password *</label>
        <input type="password" class="form-control" formControlName="password" placeholder="Min 8 characters"
               [class.is-invalid]="isInvalid('password')">
        <div class="form-text">Must be 8+ characters with uppercase, number, and special character.</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Phone Number *</label>
        <input type="tel" class="form-control" formControlName="phone" placeholder="+251-XXX-XXX-XXX"
               [class.is-invalid]="isInvalid('phone')">
        <div class="invalid-feedback">Phone is required (4-20 digits)</div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Gender *</label>
          <select class="form-select" formControlName="gender" [class.is-invalid]="isInvalid('gender')">
            <option value="">Select gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <div class="invalid-feedback">Please select your gender</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Date of Birth *</label>
          <input type="date" class="form-control" formControlName="dateOfBirth"
                 [class.is-invalid]="isInvalid('dateOfBirth')">
          <div class="invalid-feedback">Date of birth is required (must be 18+)</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Address *</label>
        <input type="text" class="form-control" formControlName="address" placeholder="Enter your address"
               [class.is-invalid]="isInvalid('address')">
        <div class="invalid-feedback">Address is required (max 500 chars)</div>
      </div>
<div class="mb-3">
  <label class="form-label">Emergency Contact Name</label>
  <input type="text" class="form-control" formControlName="emergencyContactName" placeholder="Emergency contact person name">
</div>

<div class="mb-3">
  <label class="form-label">Emergency Contact Phone</label>
  <input type="tel" class="form-control" formControlName="emergencyContactPhone" placeholder="Emergency contact number">
</div>
    </form>
  `
})
export class PatientRegistrationComponent {
  @Input() form!: FormGroup;

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.touched && ctrl.invalid);
  }
}