import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { LoginRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login-form.component.html',
  styles: [`
    .card { max-width: 440px; }
    .login-container { min-height: 100vh; }
    .brand-panel { background: linear-gradient(135deg, #078930, #056B24); }
  `]
})
export class LoginFormComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    rememberMe: [false]
  });

  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);
  failedAttempts = signal(0);
  isLocked = signal(false);
  lockoutTimer = signal(0);
  private timerInterval: any;

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const credentials: LoginRequest = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        if (response.success) {
          this.authService.navigateByRole();
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        this.failedAttempts.update(v => v + 1);
        const attempts = this.failedAttempts();

        // Brute-force protection
        if (attempts >= 5) {
          this.lockAccount();
          return;
        }

        if (error.status === 403) {
          const msg = error.error?.message || 'Your account is pending admin approval. Please wait for verification.';
          this.errorMessage.set(msg);
        } else if (error.status === 429) {
          this.errorMessage.set('Too many requests. Please try again later.');
        } else {
          const remaining = 5 - attempts;
          this.errorMessage.set(
            `Invalid email or password. ${remaining} attempt${remaining > 1 ? 's' : ''} remaining.`
          );
        }
      }
    });
  }

  private lockAccount(): void {
    this.isLocked.set(true);
    this.errorMessage.set('Account temporarily locked for 15 minutes due to multiple failed attempts.');
    let seconds = 900; // 15 minutes
    this.lockoutTimer.set(seconds);

    // Countdown
    const updateTimer = () => {
      seconds--;
      this.lockoutTimer.set(seconds);
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      this.errorMessage.set(
        `Account locked. Try again in ${minutes}:${secs.toString().padStart(2, '0')}.`
      );
      if (seconds <= 0) {
        clearInterval(this.timerInterval);
        this.isLocked.set(false);
        this.failedAttempts.set(0);
        this.errorMessage.set(null);
      }
    };

    this.timerInterval = setInterval(updateTimer, 1000);
  }

  // Helper for template validation
  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.touched && control.hasError(error));
  }

  get emailControl() { return this.loginForm.get('email'); }
  get passwordControl() { return this.loginForm.get('password'); }
}