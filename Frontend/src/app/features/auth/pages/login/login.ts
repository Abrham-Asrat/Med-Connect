import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="min-vh-100 d-flex">
      <div class="d-none d-lg-flex flex-column justify-content-center align-items-center text-white" style="width:45%;padding:60px;background:linear-gradient(135deg,#078930,#056B24)">
        <i class="bi bi-heart-pulse" style="font-size:64px"></i>
        <h2 class="mt-3 fw-bold">Med-Connect</h2>
        <p class="text-center mt-2">Ethiopia's Trusted Healthcare Platform</p>
        <hr class="border-warning my-4" style="width:60px;border-width:2px">
        <div><p class="mb-2"><i class="bi-check-circle-fill text-warning me-2"></i>2,000+ Verified Doctors</p><p class="mb-2"><i class="bi-check-circle-fill text-warning me-2"></i>Secure Appointments</p><p><i class="bi-check-circle-fill text-warning me-2"></i>Trusted Platform</p></div>
      </div>
      <div class="flex-grow-1 d-flex align-items-center justify-content-center bg-light p-4">
        <div style="max-width:440px;width:100%">
          <div class="text-center mb-4 d-lg-none"><i class="bi bi-heart-pulse text-primary" style="font-size:48px"></i><h4 class="text-primary mt-2">Med-Connect</h4></div>
          <div class="card shadow"><div class="card-body p-4">
            <h4 class="text-primary mb-1">Welcome Back</h4>
            <p class="text-medium mb-4">Sign in to your account</p>
            @if (errorMessage()) { <div class="alert alert-danger d-flex align-items-center gap-2"><i class="bi-exclamation-circle-fill"></i>{{ errorMessage() }}</div> }
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
              <div class="mb-3"><label class="form-label">Email</label><input type="email" class="form-control" formControlName="email" placeholder="you@example.com"></div>
              <div class="mb-3"><label class="form-label">Password</label><div class="input-group"><input [type]="showPassword()?'text':'password'" class="form-control" formControlName="password" placeholder="Enter password"><button type="button" class="btn btn-outline-secondary" (click)="showPassword.set(!showPassword())"><i [class]="showPassword()?'bi-eye-slash':'bi-eye'"></i></button></div></div>
              <button type="submit" class="btn btn-primary w-100 py-2 fw-bold mb-3" [disabled]="isLoading()">@if(isLoading()){Signing in...}@else{Sign In}</button>
              <div class="text-center"><span class="text-medium">Don't have an account?</span> <a routerLink="/auth/register" class="fw-bold text-primary">Register</a></div>
            </form>
          </div></div>
          <div class="text-center mt-3"><a routerLink="/" class="text-medium text-decoration-none"><i class="bi-arrow-left me-1"></i>Back to Home</a></div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading.set(true); this.errorMessage.set(null);
    this.authService.login(this.loginForm.value).subscribe({
      next: (r: any) => { this.isLoading.set(false); if (!r?.success) this.errorMessage.set(r?.message || 'Login failed.'); },
      error: (e: any) => { this.isLoading.set(false); this.errorMessage.set(e?.status===401?'Invalid credentials':e?.error?.message||'Login failed. Try again.'); }
    });
  }
}