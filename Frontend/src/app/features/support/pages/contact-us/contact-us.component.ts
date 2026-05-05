import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupportService } from '../../../../core/services/support.service';

@Component({
  selector: 'app-contact-us',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container-fluid py-3" >
      <div class="row g-3">


        <div class="col-lg-5">
          <div class="support-sidebar p-2 rounded-4 bg-white shadow-sm border h-80">
            <h3 class="fw-bold mb-4 text-center pt-2">Contact Support</h3>
            <p class="text-muted mb-5">Have a question or looking for assistance? Reach out to our dedicated team available 24/7.</p>

            <div class="contact-info-list d-grid gap-4">
              <div class="d-flex gap-3 align-items-center">
                <div class="icon-circle bg-primary text-white"><i class="bi bi-envelope"></i></div>
                <div>
                  <small class="text-muted d-block uppercase fw-bold" style="font-size: 0.65rem;">Email Us</small>
                  <span class="fw-bold">{{ contactInfo()?.email || 'support@medconnect.com' }}</span>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-center">
                <div class="icon-circle bg-warning text-dark"><i class="bi bi-telephone"></i></div>
                <div>
                  <small class="text-muted d-block uppercase fw-bold" style="font-size: 0.65rem;">Call Center</small>
                  <span class="fw-bold">{{ contactInfo()?.phone || '+251-11-XXX-XXXX' }}</span>
                </div>
              </div>
              <div class="d-flex gap-3 align-items-center">
                <div class="icon-circle bg-secondary text-white"><i class="bi bi-geo-alt"></i></div>
                <div>
                  <small class="text-muted d-block uppercase fw-bold" style="font-size: 0.65rem;">Addis Office</small>
                  <span class="fw-bold">{{ contactInfo()?.address || 'Bole Road, Addis Ababa' }}</span>
                </div>
              </div>
            </div>

            <div class="mt-5 p-4 bg-light rounded-4 border-dashed">
              <h6 class="fw-bold mb-2">Live Chat</h6>
              <p class="small text-muted mb-0">Use the chat icon in your dashboard for instant support from our medical coordinators.</p>
            </div>
          </div>
        </div>

        <div class="col-lg-6">
          <div class="card border-0 shadow-lg rounded-4 overflow-hidden">
            <div class="bg-primary p-4 text-white">
              <h4 class="mb-1">Send a Message</h4>
              <p class="mb-0 opacity-75">We usually respond within 2 hours.</p>
            </div>
            <div class="card-body p-2">
              @if (successMessage()) {
                <div class="alert alert-success border-0 bg-success-light text-success p-3 rounded-3 mb-2 animate fade-in">
                  <i class="bi bi-check-circle-fill me-2"></i> {{ successMessage() }}
                </div>
              }
              @if (errorMessage()) {
                <div class="alert alert-danger border-0 bg-danger-light text-danger p-3 rounded-3 mb-4 animate fade-in">
                  <i class="bi bi-exclamation-triangle-fill me-2"></i> {{ errorMessage() }}
                </div>
              }

              <form [formGroup]="contactForm" (ngSubmit)="send()">
                <div class="row g-4">
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">First Name</label>
                    <input type="text" class="form-control" formControlName="firstName" placeholder="Abebe">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Last Name</label>
                    <input type="text" class="form-control" formControlName="lastName" placeholder="Bekele">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Email</label>
                    <input type="email" class="form-control" formControlName="email" placeholder="abebe&#64;example.com">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label small fw-bold">Phone Number</label>
                    <input type="text" class="form-control" formControlName="phone" placeholder="+251 911...">
                  </div>
                  <div class="col-12">
                    <label class="form-label small fw-bold">Message</label>
                    <textarea class="form-control" rows="3" formControlName="message" placeholder="How can we help?"></textarea>
                  </div>
                  <div class="col-6 mx-auto">
                    <button class="btn btn-primary btn-lg w-100 rounded-pill py-3 fw-bold shadow-sm" [disabled]="contactForm.invalid || isSubmitting()">
                      @if (isSubmitting()) { 
                        <span class="spinner-border spinner-border-sm me-2"></span> Sending... 
                      } @else { 
                        Send Message <i class="bi bi-send ms-2"></i>
                      }
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .icon-circle { width: 45px; height: 45px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.25rem; }
    .border-dashed { border: 2px dashed #dee2e6; }
    .bg-success-light { background: #E8F5EC; }
    .bg-danger-light { background: #FFEBEE; }
    .form-control, .form-select { border: 1px solid #eee; padding: 0.75rem 1rem; border-radius: 12px; }
    .form-control:focus { border-color: #078930; box-shadow: 0 0 0 0.25rem rgba(7, 137, 48, 0.1); }
  `]
})
export class ContactUsComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supportService = inject(SupportService);

  isSubmitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  contactInfo = signal<any>(null);

  contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    message: ['', [Validators.required, Validators.minLength(10)]]
  });

  ngOnInit() {
    this.supportService.getSupportInfo().subscribe(info => this.contactInfo.set(info));
  }

  send() {
    if (this.contactForm.invalid) return;

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    this.supportService.submitContact(this.contactForm.value).subscribe({
      next: (res: any) => {
        this.isSubmitting.set(false);
        this.successMessage.set(res.message || "Message sent! We'll get back to you soon.");
        this.contactForm.reset();
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err: any) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || "Failed to send message. Please try again later.");
        setTimeout(() => this.errorMessage.set(null), 5000);
      }
    });
  }
}
