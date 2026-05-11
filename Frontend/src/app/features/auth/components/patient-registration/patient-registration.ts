import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">First Name *</label>
          <input type="text" class="form-control" formControlName="firstName"
                 [class.is-invalid]="isInvalid('firstName')">
          <div class="invalid-feedback">First name is required</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Last Name *</label>
          <input type="text" class="form-control" formControlName="lastName"
                 [class.is-invalid]="isInvalid('lastName')">
          <div class="invalid-feedback">Last name is required</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Email Address *</label>
        <input type="email" class="form-control" formControlName="email"
               [class.is-invalid]="isInvalid('email')">
        @if (form.get('email')?.hasError('required')) {
          <div class="invalid-feedback">Email is required</div>
        }
        @if (form.get('email')?.hasError('email')) {
          <div class="invalid-feedback">Please enter a valid email</div>
        }
      </div>

      <div class="mb-3">
        <label class="form-label">Password *</label>
        <input type="password" class="form-control" formControlName="password"
               [class.is-invalid]="isInvalid('password')">
        <div class="form-text">
          Must be 8+ characters with uppercase, number, and special character.
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Phone Number (Optional)</label>
        <input type="tel" class="form-control" formControlName="phone">
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Gender *</label>
          <select class="form-select" formControlName="gender"
                  [class.is-invalid]="isInvalid('gender')">
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
        <textarea class="form-control" formControlName="address" rows="2"
                  [class.is-invalid]="isInvalid('address')"
                  placeholder="Street address, city, region"></textarea>
        <div class="invalid-feedback">Address is required</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Emergency Contact Phone (Optional)</label>
        <input type="tel" class="form-control" formControlName="emergencyContactPhone">
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