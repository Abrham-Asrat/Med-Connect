import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PendingDoctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  qualifications: string;
  experience: number;
  licenseNumber: string;
  submittedAt: string;
  cvFile: string;
  certificates: string[];
}

@Component({
  selector: 'app-doctor-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-person-check me-2"></i>Doctor Verification</h4>
        <div>
          <span class="badge bg-danger me-2">{{ pendingDoctors().length }} Pending</span>
          <span class="badge bg-primary">{{ approvedToday() }} Approved Today</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-6 col-md-3">
          <div class="card text-center p-3" style="border-left:4px solid #DA121A">
            <h3 class="text-danger mb-0">{{ pendingDoctors().length }}</h3><small class="text-medium">Pending</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center p-3" style="border-left:4px solid #FCD116">
            <h3 class="text-warning-dark mb-0">3</h3><small class="text-medium">In Review</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center p-3" style="border-left:4px solid #078930">
            <h3 class="text-primary mb-0">{{ approvedTotal() }}</h3><small class="text-medium">Approved</small>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="card text-center p-3" style="border-left:4px solid #007BFF">
            <h3 class="text-secondary mb-0">2</h3><small class="text-medium">Rejected</small>
          </div>
        </div>
      </div>

      <!-- Pending Doctors List -->
      <div class="card">
        <div class="card-header bg-white d-flex justify-content-between">
          <h5 class="text-primary mb-0"><i class="bi bi-clock me-2"></i>Pending Approvals</h5>
          <input type="text" class="form-control form-control-sm w-auto" placeholder="Search doctors..." 
                 [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event)">
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr><th>Doctor</th><th>Specialty</th><th>Experience</th><th>Documents</th><th>Submitted</th><th>Actions</th></tr>
            </thead>
            <tbody>
              @for (doc of filteredDoctors(); track doc.id) {
                <tr>
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                           style="width:36px;height:36px;font-size:14px;font-weight:700">
                        {{ doc.firstName.charAt(0) }}{{ doc.lastName.charAt(0) }}
                      </div>
                      <div>
                        <strong>{{ doc.firstName }} {{ doc.lastName }}</strong><br>
                        <small class="text-medium">{{ doc.email }}</small>
                      </div>
                    </div>
                  </td>
                  <td><span class="badge bg-primary-light text-primary">{{ doc.specialty }}</span></td>
                  <td>{{ doc.experience }} years</td>
                  <td>
                    <button class="btn btn-outline-primary btn-sm me-1" (click)="viewDocument(doc.cvFile)">CV</button>
                    @if (doc.certificates.length > 0) {
                      <button class="btn btn-outline-secondary btn-sm" (click)="viewCertificates(doc)">
                        {{ doc.certificates.length }} Cert
                      </button>
                    }
                  </td>
                  <td><small>{{ doc.submittedAt }}</small></td>
                  <td>
                    <button class="btn btn-primary btn-sm me-1" (click)="approveDoctor(doc.id)">Approve</button>
                    <button class="btn btn-outline-danger btn-sm" (click)="rejectDoctor(doc.id)">Reject</button>
                  </td>
                </tr>
              }
              @if (filteredDoctors().length === 0) {
                <tr><td colspan="6" class="text-center py-4 text-medium">No pending doctors found</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Approve Modal -->
      @if (showApproveModal()) {
        <div class="modal d-block" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header bg-primary text-white">
                <h6 class="modal-title">Approve Doctor</h6>
                <button class="btn-close btn-close-white" (click)="showApproveModal.set(false)"></button>
              </div>
              <div class="modal-body">
                <p>Are you sure you want to approve this doctor?</p>
                <div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Doctor will be notified and can start practicing.</div>
                <textarea class="form-control mb-2" rows="2" placeholder="Welcome message (optional)"></textarea>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="showApproveModal.set(false)">Cancel</button>
                <button class="btn btn-primary" (click)="confirmApprove()">Confirm Approval</button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Reject Modal -->
      @if (showRejectModal()) {
        <div class="modal d-block" style="background:rgba(0,0,0,0.5)">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header bg-danger text-white">
                <h6 class="modal-title">Reject Doctor</h6>
                <button class="btn-close btn-close-white" (click)="showRejectModal.set(false)"></button>
              </div>
              <div class="modal-body">
                <p>Please provide a reason for rejection:</p>
                <select class="form-select mb-2">
                  <option>Incomplete documentation</option>
                  <option>Invalid credentials</option>
                  <option>Does not meet requirements</option>
                  <option>Other</option>
                </select>
                <textarea class="form-control" rows="3" placeholder="Detailed reason..."></textarea>
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="showRejectModal.set(false)">Cancel</button>
                <button class="btn btn-danger" (click)="confirmReject()">Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DoctorVerificationComponent {
  searchTerm = signal('');
  showApproveModal = signal(false);
  showRejectModal = signal(false);
  approvedToday = signal(5);
  approvedTotal = signal(245);
  selectedDoctorId = signal<string | null>(null);

  pendingDoctors = signal<PendingDoctor[]>([
    { id:'1', firstName:'Abebe', lastName:'Tadesse', email:'abebe@email.com', phone:'+251...', specialty:'Cardiology', qualifications:'MD, Board Certified', experience:12, licenseNumber:'LIC-001', submittedAt:'Apr 25, 2026', cvFile:'CV_Abebe.pdf', certificates:['Board_Cert.pdf', 'Degree.pdf'] },
    { id:'2', firstName:'Tirunesh', lastName:'Bekele', email:'tirunesh@email.com', phone:'+251...', specialty:'Neurology', qualifications:'MD, PhD Neuroscience', experience:15, licenseNumber:'LIC-002', submittedAt:'Apr 26, 2026', cvFile:'CV_Tirunesh.pdf', certificates:['PhD_Cert.pdf'] },
    { id:'3', firstName:'Dawit', lastName:'Haile', email:'dawit@email.com', phone:'+251...', specialty:'Pediatrics', qualifications:'MD, Pediatric Board', experience:8, licenseNumber:'LIC-003', submittedAt:'Apr 27, 2026', cvFile:'CV_Dawit.pdf', certificates:['Board_Cert.pdf', 'License.pdf', 'Degree.pdf'] },
    { id:'4', firstName:'Meron', lastName:'Girma', email:'meron@email.com', phone:'+251...', specialty:'Dermatology', qualifications:'MD', experience:5, licenseNumber:'LIC-004', submittedAt:'Apr 27, 2026', cvFile:'CV_Meron.pdf', certificates:['Degree.pdf'] },
    { id:'5', firstName:'Henok', lastName:'Assefa', email:'henok@email.com', phone:'+251...', specialty:'Orthopedics', qualifications:'MD, Orthopedic Surgery', experience:10, licenseNumber:'LIC-005', submittedAt:'Apr 28, 2026', cvFile:'CV_Henok.pdf', certificates:['Board_Cert.pdf'] },
  ]);

  filteredDoctors(): PendingDoctor[] {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.pendingDoctors();
    return this.pendingDoctors().filter(d =>
      d.firstName.toLowerCase().includes(term) ||
      d.lastName.toLowerCase().includes(term) ||
      d.specialty.toLowerCase().includes(term)
    );
  }

  viewDocument(file: string): void {
    alert('Opening document: ' + file);
  }

  viewCertificates(doc: PendingDoctor): void {
    alert('Certificates for ' + doc.firstName + ': ' + doc.certificates.join(', '));
  }

  approveDoctor(id: string): void {
    this.selectedDoctorId.set(id);
    this.showApproveModal.set(true);
  }

  confirmApprove(): void {
    const id = this.selectedDoctorId();
    if (id) {
      this.pendingDoctors.update(docs => docs.filter(d => d.id !== id));
      this.approvedToday.update(v => v + 1);
    }
    this.showApproveModal.set(false);
    this.selectedDoctorId.set(null);
  }

  rejectDoctor(id: string): void {
    this.selectedDoctorId.set(id);
    this.showRejectModal.set(true);
  }

  confirmReject(): void {
    const id = this.selectedDoctorId();
    if (id) {
      this.pendingDoctors.update(docs => docs.filter(d => d.id !== id));
    }
    this.showRejectModal.set(false);
    this.selectedDoctorId.set(null);
  }
}