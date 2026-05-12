import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface CvFileData {
  fileName: string;
  mimeType: string;
  fileDataBase64: string;
}

@Component({
  selector: 'app-doctor-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="alert alert-warning d-flex align-items-start gap-2 mb-4">
      <i class="bi bi-shield-exclamation fs-5 mt-1"></i>
      <div>
        <strong>Verification Required</strong><br>
        <small>After registration, your account will be reviewed by our admin team.
        You will NOT be able to access the doctor portal until approved (1–3 business days).</small>
      </div>
    </div>

    <!-- Personal Info — bound to commonForm -->
    <form [formGroup]="form">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">First Name *</label>
          <input type="text" class="form-control" formControlName="firstName"
                 [class.is-invalid]="isInvalid(form, 'firstName')">
          <div class="invalid-feedback">First name is required</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">Last Name *</label>
          <input type="text" class="form-control" formControlName="lastName"
                 [class.is-invalid]="isInvalid(form, 'lastName')">
          <div class="invalid-feedback">Last name is required</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Email Address *</label>
        <input type="email" class="form-control" formControlName="email"
               [class.is-invalid]="isInvalid(form, 'email')">
        <div class="invalid-feedback">Valid email is required</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Password *</label>
        <input type="password" class="form-control" formControlName="password"
               [class.is-invalid]="isInvalid(form, 'password')">
        <div class="form-text">Must be 8+ characters with uppercase, number, and special character.</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Phone Number *</label>
        <input type="tel" class="form-control" formControlName="phone"
               [class.is-invalid]="isInvalid(form, 'phone')"
               placeholder="e.g. 0912345678">
        <div class="invalid-feedback">Phone number is required</div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Gender *</label>
          <select class="form-select" formControlName="gender"
                  [class.is-invalid]="isInvalid(form, 'gender')">
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
                 [class.is-invalid]="isInvalid(form, 'dateOfBirth')">
          <div class="invalid-feedback">Date of birth is required (must be 18+)</div>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">Address *</label>
        <textarea class="form-control" formControlName="address" rows="2"
                  [class.is-invalid]="isInvalid(form, 'address')"
                  placeholder="Street address, city, region"></textarea>
        <div class="invalid-feedback">Address is required</div>
      </div>
    </form>

    <hr class="my-4">
    <h6 class="text-primary mb-3"><i class="bi bi-briefcase me-2"></i>Professional Information</h6>

    <!-- Professional Info — bound to doctorForm -->
    <form [formGroup]="doctorForm">

      <div class="mb-3">
        <label class="form-label">Primary Specialty *</label>
        <select class="form-select" formControlName="specialty"
                [class.is-invalid]="isInvalid(doctorForm, 'specialty')">
          <option value="">Select primary specialty</option>
          <option>Cardiology</option>
          <option>Neurology</option>
          <option>Pediatrics</option>
          <option>Dermatology</option>
          <option>Orthopedics</option>
          <option>Gynecology</option>
          <option>Psychiatry</option>
          <option>Ophthalmology</option>
          <option>Internal Medicine</option>
          <option>General Practice</option>
        </select>
        <div class="invalid-feedback">Please select a specialty</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Qualifications *</label>
        <textarea class="form-control" formControlName="qualifications" rows="2"
                  [class.is-invalid]="isInvalid(doctorForm, 'qualifications')"
                  placeholder="e.g. MD, Board Certified in Cardiology"></textarea>
        <div class="invalid-feedback">Qualifications are required</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Biography *</label>
        <textarea class="form-control" formControlName="biography" rows="3"
                  [class.is-invalid]="isInvalid(doctorForm, 'biography')"
                  placeholder="Brief professional bio visible to patients..."></textarea>
        <div class="invalid-feedback">Biography is required</div>
      </div>

      <div class="row">
        <div class="col-md-6 mb-3">
          <label class="form-label">Online Appointment Fee (ETB) *</label>
          <input type="number" class="form-control" formControlName="onlineAppointmentFee"
                 min="0" placeholder="e.g. 500"
                 [class.is-invalid]="isInvalid(doctorForm, 'onlineAppointmentFee')">
          <div class="invalid-feedback">Online fee is required</div>
        </div>
        <div class="col-md-6 mb-3">
          <label class="form-label">In-Person Appointment Fee (ETB) *</label>
          <input type="number" class="form-control" formControlName="inPersonAppointmentFee"
                 min="0" placeholder="e.g. 800"
                 [class.is-invalid]="isInvalid(doctorForm, 'inPersonAppointmentFee')">
          <div class="invalid-feedback">In-person fee is required</div>
        </div>
      </div>

    </form>

    <hr class="my-4">
    <h6 class="text-primary mb-3"><i class="bi bi-file-earmark-text me-2"></i>CV / Resume *</h6>

    <!-- CV Upload — no formGroup needed -->
    <div class="mb-3">
      <label
        class="d-block border rounded p-4 text-center bg-light"
        [class.border-primary]="cvFile()"
        [class.border-danger]="cvError()"
        style="cursor:pointer;"
        (dragover)="onDragOver($event)"
        (drop)="onDrop($event)">
        <input type="file" class="d-none" #cvInput
               accept=".pdf,.doc,.docx"
               (change)="onFileSelected($event)">

        @if (!cvFile()) {
          <i class="bi bi-cloud-upload text-primary fs-1"></i>
          <p class="mb-1 mt-2 fw-semibold">Drag & drop or click to upload your CV</p>
          <small class="text-muted">PDF, DOC, DOCX — max 10 MB</small>
          <br>
          <button type="button" class="btn btn-outline-primary btn-sm mt-2"
                  (click)="cvInput.click()">Browse Files</button>
        } @else {
          <i class="bi bi-file-earmark-check text-success fs-1"></i>
          <p class="text-success fw-bold mt-2 mb-0">{{ cvFile()!.name }}</p>
          <small class="text-muted">{{ formatSize(cvFile()!.size) }}</small>
          <br>
          <button type="button" class="btn btn-outline-danger btn-sm mt-2"
                  (click)="removeFile($event)">Remove</button>
        }
      </label>
      @if (cvError()) {
        <div class="text-danger mt-1" style="font-size:13px;">
          <i class="bi bi-exclamation-circle me-1"></i>{{ cvError() }}
        </div>
      }
    </div>
  `
})
export class DoctorRegistrationComponent {
  /** Personal info form (shared with patient) */
  @Input() form!: FormGroup;
  /** Doctor-specific professional info form */
  @Input() doctorForm!: FormGroup;
  @Output() cvSelected = new EventEmitter<CvFileData | null>();

  cvFile = signal<File | null>(null);
  cvError = signal<string | null>(null);

  isInvalid(fg: FormGroup, field: string): boolean {
    const ctrl = fg.get(field);
    return !!(ctrl && ctrl.touched && ctrl.invalid);
  }

  formatSize(bytes: number): string {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file) this.processFile(file);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.processFile(file);
  }

  removeFile(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.cvFile.set(null);
    this.cvError.set(null);
    this.cvSelected.emit(null);
  }

  private processFile(file: File): void {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowed.includes(file.type)) {
      this.cvError.set('Only PDF, DOC, or DOCX files are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      this.cvError.set('File size must be under 10 MB.');
      return;
    }
    this.cvError.set(null);
    this.cvFile.set(file);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      this.cvSelected.emit({ fileName: file.name, mimeType: file.type, fileDataBase64: base64 });
    };
    reader.readAsDataURL(file);
  }
}
