import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="alert alert-warning d-flex align-items-center gap-2 mb-3">
      <i class="bi bi-info-circle-fill fs-5"></i>
      <div>
        <strong>Verification Required</strong><br>
        <small>After registration, your account will be reviewed by our admin team. 
        You will NOT be able to access the doctor portal until approved. (1-3 business days)</small>
      </div>
    </div>

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
        <input type="email" class="form-control" formControlName="email">
      </div>

      <div class="mb-3">
        <label class="form-label">Password *</label>
        <input type="password" class="form-control" formControlName="password">
      </div>

      <div class="mb-3">
        <label class="form-label">Phone Number *</label>
        <input type="tel" class="form-control" formControlName="phone"
               [class.is-invalid]="isInvalid('phone')"
               placeholder="e.g. 0912345678">
        <div class="invalid-feedback">Phone number is required</div>
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

      <hr class="my-4">
      <h6 class="text-primary mb-3"><i class="bi bi-briefcase me-2"></i>Professional Information</h6>

      <div class="mb-3">
        <label class="form-label">Medical License Number *</label>
        <input type="text" class="form-control" formControlName="licenseNumber">
      </div>

      <div class="mb-3">
        <label class="form-label">Specialties *</label>
        <select class="form-select" formControlName="specialty">
          <option value="">Select primary specialty</option>
          <option>Cardiology</option><option>Neurology</option>
          <option>Pediatrics</option><option>Dermatology</option>
          <option>Orthopedics</option><option>Gynecology</option>
          <option>Psychiatry</option><option>Ophthalmology</option>
          <option>Internal Medicine</option><option>General Practice</option>
        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">Years of Experience *</label>
        <input type="number" class="form-control" formControlName="experience" min="0">
      </div>

      <div class="mb-3">
        <label class="form-label">Qualifications *</label>
        <textarea class="form-control" formControlName="qualifications" rows="3"
                  placeholder="e.g., MD, Board Certified in Cardiology"></textarea>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Online Appointment Fee (ETB) *</label>
          <input type="number" class="form-control" formControlName="onlineAppointmentFee"
                 min="0" placeholder="e.g. 500"
                 [class.is-invalid]="isInvalid('onlineAppointmentFee')">
          <div class="invalid-feedback">Online fee is required</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">In-Person Appointment Fee (ETB) *</label>
          <input type="number" class="form-control" formControlName="inPersonAppointmentFee"
                 min="0" placeholder="e.g. 800"
                 [class.is-invalid]="isInvalid('inPersonAppointmentFee')">
          <div class="invalid-feedback">In-person fee is required</div>
        </div>
      </div>

      <hr class="my-4">
      <h6 class="text-primary mb-3"><i class="bi bi-file-earmark-text me-2"></i>Document Upload</h6>

      <!-- CV Upload -->
      <div class="mb-3">
        <label class="form-label">CV / Resume *</label>
        <div class="border rounded p-4 text-center bg-light"
             [class.border-primary]="cvFile()"
             (dragover)="$event.preventDefault()" (drop)="$event.preventDefault()">
          @if (!cvFile()) {
            <i class="bi bi-cloud-upload text-primary fs-1"></i>
            <p class="text-medium mt-2 mb-1">Drag & drop your CV or click to browse</p>
            <small class="text-medium">PDF, DOC, DOCX (Max 10MB)</small>
            <br>
            <button type="button" class="btn btn-outline-primary btn-sm mt-2">Browse Files</button>
          } @else {
            <i class="bi bi-file-pdf text-primary fs-1"></i>
            <p class="text-primary fw-bold mt-2 mb-0">{{ cvFile()?.name }}</p>
            <small class="text-medium">{{ formatSize(cvFile()?.size) }}</small>
            <br>
            <button type="button" class="btn btn-outline-danger btn-sm mt-2"
                    (click)="cvFile.set(null)">Remove</button>
          }
        </div>
      </div>

      <!-- Certificates Upload -->
      <div class="mb-3">
        <label class="form-label">Certificates *</label>
        <div class="border rounded p-4 text-center bg-light">
          <i class="bi bi-paperclip text-primary fs-1"></i>
          <p class="text-medium mt-2 mb-1">Upload your medical certificates</p>
          <small class="text-medium">Multiple files allowed (PDF, JPG, PNG)</small>
          <br>
          <button type="button" class="btn btn-outline-primary btn-sm mt-2">Upload Certificates</button>
        </div>
      </div>

      <!-- Verification Timeline -->
      <div class="card bg-light mt-4">
        <div class="card-body">
          <h6 class="text-primary mb-3">Verification Process</h6>
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-check-circle-fill text-primary"></i>
              <small>Register & verify email</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-check-circle-fill text-primary"></i>
              <small>Upload credentials</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-circle text-warning"></i>
              <small class="text-warning-dark">Admin reviews your application</small>
            </div>
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-circle text-medium"></i>
              <small class="text-medium">Get approved & start practicing</small>
            </div>
          </div>
        </div>
      </div>
    </form>
  `
})
export class DoctorRegistrationComponent {
  @Input() form!: FormGroup;
  cvFile = signal<File | null>(null);

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.touched && ctrl.invalid);
  }

  formatSize(bytes: number | undefined): string {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(1) + ' MB';
  }
}