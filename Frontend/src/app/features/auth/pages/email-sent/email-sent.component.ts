import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-email-sent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex min-vh-100 align-items-center justify-content-center bg-light p-4">
      <div class="card shadow text-center" style="max-width: 480px; width: 100%;">
        <div class="card-body p-5">

          <!-- Icon -->
          <div class="mb-4">
            <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                 style="width:80px;height:80px;background:#E8F5EC;">
              <i class="bi bi-envelope-check-fill text-success" style="font-size:36px;"></i>
            </div>
          </div>

          <h4 class="fw-bold mb-2">Check Your Email</h4>
          <p class="text-muted mb-1">We sent a verification link to</p>
          <p class="fw-semibold text-success mb-4">{{ email() || 'your email address' }}</p>

          <p class="text-muted mb-4" style="font-size:14px;">
            Click the link in the email to verify your account.
            The link expires in <strong>24 hours</strong>.
          </p>

          <!-- Resend section -->
          @if (successMessage()) {
            <div class="alert alert-success d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-check-circle-fill"></i>
              {{ successMessage() }}
            </div>
          }
          @if (errorMessage()) {
            <div class="alert alert-danger d-flex align-items-center gap-2 mb-3">
              <i class="bi bi-exclamation-triangle-fill"></i>
              {{ errorMessage() }}
            </div>
          }

          <p class="text-muted mb-2" style="font-size:14px;">Didn't receive it?</p>
          <button class="btn btn-outline-primary w-100 mb-3"
                  (click)="resend()"
                  [disabled]="isLoading() || resendCooldown() > 0">
            @if (isLoading()) {
              <span class="spinner-border spinner-border-sm me-2"></span>Sending...
            } @else if (resendCooldown() > 0) {
              Resend in {{ resendCooldown() }}s
            } @else {
              <i class="bi bi-arrow-clockwise me-2"></i>Resend Verification Email
            }
          </button>

          <hr class="my-3">

          <a routerLink="/auth/login" class="text-decoration-none text-muted" style="font-size:14px;">
            <i class="bi bi-arrow-left me-1"></i>Back to Sign In
          </a>
        </div>
      </div>
    </div>
  `
})
export class EmailSentComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  email = signal('');
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  resendCooldown = signal(0);

  private cooldownInterval: any;

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['email']) this.email.set(params['email']);
    });
  }

  resend(): void {
    if (this.resendCooldown() > 0 || !this.email()) return;

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.authService.resendVerification(this.email()).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        if (res?.success) {
          this.successMessage.set('A new verification link has been sent!');
          this.startCooldown(60);
        } else {
          this.errorMessage.set(res?.message || 'Failed to resend. Please try again.');
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err?.error?.message || 'Failed to resend. Please try again.'
        );
      }
    });
  }

  private startCooldown(seconds: number): void {
    this.resendCooldown.set(seconds);
    this.cooldownInterval = setInterval(() => {
      this.resendCooldown.update(v => {
        if (v <= 1) {
          clearInterval(this.cooldownInterval);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }
}
