import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow border-0" style="border-radius: 16px;">
            <div class="card-body p-4 p-lg-5">
              
              <!-- Back Button -->
              <div class="mb-4">
                <a routerLink="/auth/login" class="text-decoration-none text-secondary d-inline-flex align-items-center">
                  <i class="bi bi-arrow-left me-2"></i>
                  Back to Login
                </a>
              </div>

              <!-- Step 1: Email Input -->
              <div *ngIf="step() === 1">
                <div class="text-center mb-4">
                  <div class="icon-circle bg-primary-light mb-3">
                    <i class="bi bi-envelope-at text-primary fs-2"></i>
                  </div>
                  <h3 class="fw-bold">Forgot Password?</h3>
                  <p class="text-muted">No worries! Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
                </div>

                <form [formGroup]="emailForm" (ngSubmit)="onSendOtp()">
                  <div class="mb-4">
                    <label class="form-label fw-semibold">Email Address</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-envelope text-muted"></i></span>
                      <input type="email" class="form-control bg-light border-start-0" formControlName="email"
                             placeholder="name@example.com" [class.is-invalid]="emailForm.get('email')?.touched && emailForm.get('email')?.invalid">
                    </div>
                    <div class="invalid-feedback" *ngIf="emailForm.get('email')?.touched && emailForm.get('email')?.invalid">
                      Please enter a valid registered email.
                    </div>
                  </div>

                  <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" [disabled]="emailForm.invalid || loading()">
                    <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading() ? 'Sending...' : 'Send OTP Code' }}
                  </button>
                </form>
              </div>

              <!-- Step 2: OTP Verification -->
              <div *ngIf="step() === 2">
                <div class="text-center mb-4">
                  <div class="icon-circle bg-success-light mb-3">
                    <i class="bi bi-shield-check text-success fs-2"></i>
                  </div>
                  <h3 class="fw-bold">Security Check</h3>
                  <p class="text-muted">We've sent a 6-digit code to <span class="text-dark fw-semibold">{{ emailForm.value.email }}</span></p>
                </div>

                <div class="otp-container mb-4 d-flex justify-content-between">
                  <input *ngFor="let i of [0,1,2,3,4,5]" #otpInput
                         type="text" maxlength="1" 
                         class="form-control otp-input text-center fs-3 fw-bold" 
                         (keyup)="onOtpKeyUp($event, i)"
                         [id]="'otp-' + i">
                </div>

                <button class="btn btn-primary w-100 py-2 fw-bold mb-3" 
                        [disabled]="otpValue().length < 6 || loading()"
                        (click)="onVerifyOtp()">
                  <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
                  Verify OTP
                </button>

                <p class="text-center text-muted small">
                  Didn't receive the code? 
                  <button class="btn btn-link p-0 small fw-bold text-decoration-none" (click)="onSendOtp()" [disabled]="loading()">Resend</button>
                </p>
              </div>

              <!-- Step 3: Reset Password -->
              <div *ngIf="step() === 3">
                <div class="text-center mb-4">
                  <div class="icon-circle bg-warning-light mb-3">
                    <i class="bi bi-key text-warning fs-2"></i>
                  </div>
                  <h3 class="fw-bold">New Password</h3>
                  <p class="text-muted">Create a strong password to protect your account.</p>
                </div>

                <form [formGroup]="passwordForm" (ngSubmit)="onResetPassword()">
                  <div class="mb-3">
                    <label class="form-label fw-semibold">New Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock text-muted"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'" class="form-control bg-light border-start-0" 
                             formControlName="newPassword" placeholder="••••••••">
                    </div>
                  </div>

                  <div class="mb-4">
                    <label class="form-label fw-semibold">Confirm Password</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light border-end-0"><i class="bi bi-lock-fill text-muted"></i></span>
                      <input [type]="showPassword ? 'text' : 'password'" class="form-control bg-light border-start-0" 
                             formControlName="confirmPassword" placeholder="••••••••">
                    </div>
                    <div class="text-danger small mt-1" *ngIf="passwordForm.errors?.['mismatch'] && passwordForm.get('confirmPassword')?.touched">
                      Passwords do not match
                    </div>
                  </div>

                  <button type="submit" class="btn btn-success w-100 py-2 fw-bold" [disabled]="passwordForm.invalid || loading()">
                    <span *ngIf="loading()" class="spinner-border spinner-border-sm me-2"></span>
                    Update Password
                  </button>
                </form>
              </div>

              <!-- Success State -->
              <div *ngIf="step() === 4" class="text-center py-4">
                <div class="icon-circle bg-success mb-3 mx-auto">
                    <i class="bi bi-check-lg text-white fs-1"></i>
                </div>
                <h3 class="fw-bold">Password Updated!</h3>
                <p class="text-muted mb-4">Your password has been reset successfully. You can now login with your new password.</p>
                <a routerLink="/auth/login" class="btn btn-primary w-100 py-2 fw-bold">Login Now</a>
              </div>

              <!-- Error Toast-like message -->
              <div *ngIf="errorMessage()" class="alert alert-danger mt-4 small border-0 shadow-sm" role="alert">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                {{ errorMessage() }}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
    }
    .bg-primary-light { background-color: rgba(13, 110, 253, 0.1); }
    .bg-success-light { background-color: rgba(25, 135, 84, 0.1); }
    .bg-warning-light { background-color: rgba(255, 193, 13, 0.1); }
    .otp-input {
      width: 50px;
      height: 60px;
      border-radius: 10px;
      border: 2px solid #dee2e6;
    }
    .otp-input:focus {
      border-color: #0d6efd;
      box-shadow: none;
    }
    .btn-primary { background-color: #0d6efd; border: none; }
    .btn-primary:hover { background-color: #0b5ed7; }
  `]
})
export class ForgotPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  step = signal(1);
  loading = signal(false);
  errorMessage = signal<string | null>(null);
  otpValue = signal('');
  showPassword = false;

  emailForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSendOtp() {
    if (this.emailForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.forgotPassword(this.emailForm.value.email).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set(2);
        setTimeout(() => document.getElementById('otp-0')?.focus(), 100);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to send OTP. Please check your email.');
      }
    });
  }

  onOtpKeyUp(event: any, index: number) {
    const val = event.target.value;
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    this.updateOtpValue();
  }

  updateOtpValue() {
    let combined = '';
    for (let i = 0; i < 6; i++) {
      const el = document.getElementById(`otp-${i}`) as HTMLInputElement;
      combined += el?.value || '';
    }
    this.otpValue.set(combined);
  }

  onVerifyOtp() {
    if (this.otpValue().length < 6) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    // We don't really have a standalone verify-otp for forgot password that doesn't clear it, 
    // but the backend will verify it during reset-password. 
    // To provide immediate feedback, we can call verify-otp but we need to ensure the backend doesn't clear it 
    // OR we just proceed to step 3 and let reset-password handle the validation.
    // Given my backend implementation of reset-password takes OTP, I can just proceed to step 3.

    // Check if OTP is correct by calling verify-otp (but this might clear it in current implementation)
    // Actually, I'll just skip verification step call and go to password reset, 
    // because reset-password will verify it anyway.

    this.loading.set(false);
    this.step.set(3);
  }

  onResetPassword() {
    if (this.passwordForm.invalid) return;

    this.loading.set(true);
    this.errorMessage.set(null);

    const payload = {
      email: this.emailForm.value.email,
      otp: Number(this.otpValue()),
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: () => {
        this.loading.set(false);
        this.step.set(4);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to reset password. Please try again.');
        if (err.error?.message?.includes('OTP')) {
          this.step.set(2); // Go back to OTP if it's an OTP error
        }
      }
    });
  }
}