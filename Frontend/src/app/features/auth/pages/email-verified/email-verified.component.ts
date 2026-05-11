import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="d-flex min-vh-100 align-items-center justify-content-center bg-light p-4">
      <div class="card shadow text-center" style="max-width: 480px; width: 100%;">
        <div class="card-body p-5">

          <!-- Loading state -->
          @if (status() === 'loading') {
            <div class="mb-4">
              <div class="spinner-border text-primary" style="width:56px;height:56px;" role="status">
                <span class="visually-hidden">Verifying...</span>
              </div>
            </div>
            <h4 class="fw-bold mb-2">Verifying Your Email</h4>
            <p class="text-muted">Please wait a moment...</p>
          }

          <!-- Success state -->
          @if (status() === 'success') {
            <div class="mb-4">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                   style="width:80px;height:80px;background:#E8F5EC;">
                <i class="bi bi-check-circle-fill text-success" style="font-size:40px;"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-2 text-success">Email Verified!</h4>
            <p class="text-muted mb-4">
              Your email has been verified successfully.
              You can now sign in to your account.
            </p>
            <a (click)="navigateToLogin()" class="btn btn-success w-100 py-2 fw-bold" style="cursor:pointer;">
              <i class="bi bi-box-arrow-in-right me-2"></i>Go to Sign In
            </a>
          }

          <!-- Error state -->
          @if (status() === 'error') {
            <div class="mb-4">
              <div class="rounded-circle d-inline-flex align-items-center justify-content-center"
                   style="width:80px;height:80px;background:#FEE2E2;">
                <i class="bi bi-x-circle-fill text-danger" style="font-size:40px;"></i>
              </div>
            </div>
            <h4 class="fw-bold mb-2 text-danger">Verification Failed</h4>
            <p class="text-muted mb-4">{{ errorMessage() }}</p>

            <a routerLink="/auth/login" class="btn btn-outline-primary w-100 mb-2">
              <i class="bi bi-arrow-left me-2"></i>Back to Sign In
            </a>
            <p class="text-muted mt-3" style="font-size:13px;">
              Need a new link?
              <a routerLink="/auth/login" class="text-primary">Sign in</a>
              and we'll prompt you to resend it.
            </p>
          }

        </div>
      </div>
    </div>
  `
})
export class EmailVerifiedComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private router = inject(Router);

  status = signal<'loading' | 'success' | 'error'>('loading');
  errorMessage = signal('The verification link is invalid or has expired.');
  verifiedEmail = signal<string | null>(null);

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      // Also capture email if passed as query param from the email-sent page
      if (params['email']) this.verifiedEmail.set(params['email']);
      if (!token) {
        this.status.set('error');
        this.errorMessage.set('No verification token found in the link.');
        return;
      }
      this.verifyToken(token);
    });
  }

  private verifyToken(token: string): void {
    this.authService.verifyEmail(token).subscribe({
      next: (res: any) => {
        if (res?.success) {
          // Backend may return the email in the response data
          if (res?.data?.email) this.verifiedEmail.set(res.data.email);
          this.status.set('success');
          // Auto-redirect to login after 3 seconds, pre-filling the email
          setTimeout(() => this.navigateToLogin(), 3000);
        } else {
          this.status.set('error');
          this.errorMessage.set(res?.message || 'Verification failed. Please try again.');
        }
      },
      error: (err: any) => {
        this.status.set('error');
        this.errorMessage.set(
          err?.error?.message || 'The verification link is invalid or has expired.'
        );
      }
    });
  }

  navigateToLogin(): void {
    const email = this.verifiedEmail();
    if (email) {
      this.router.navigate(['/auth/login'], { queryParams: { email } });
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
