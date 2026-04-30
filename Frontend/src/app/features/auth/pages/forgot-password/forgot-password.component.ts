import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow">
            <div class="card-body p-4 text-center">
              <div class="mb-4">
                <i class="bi bi-lock text-primary" style="font-size: 48px;"></i>
              </div>
              <h4 class="text-primary mb-2">Forgot Password?</h4>
              <p class="text-medium mb-4">Enter your email and we'll send you a reset link</p>
              
              <form [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
                <div class="mb-3">
                  <input type="email" class="form-control" formControlName="email"
                         placeholder="you@example.com">
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3"
                        [disabled]="forgotForm.invalid || loading">
                  @if (loading) {
                    <span class="spinner-border spinner-border-sm me-2"></span>
                  }
                  Send Reset Link
                </button>
              </form>
              
              <a routerLink="/auth/login" class="text-secondary">
                <i class="bi bi-arrow-left me-1"></i>Back to Login
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  loading = false;

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm.valid) {
      this.loading = true;
      // Simulate API call
      setTimeout(() => this.loading = false, 2000);
    }
  }
}