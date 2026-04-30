import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './otp-verification.component.html',
  styles: [`
    .otp-container { display: flex; gap: 8px; justify-content: center; }
    .otp-input { width: 48px; height: 56px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 24px; font-weight: 700; border: 2px solid #E5E7EB; border-radius: 8px; outline: none; transition: all 0.2s ease; }
    .otp-input:focus { border-color: #078930; box-shadow: 0 0 0 3px rgba(7,137,48,0.15); }
    .otp-input.filled { border-color: #078930; background: #E8F5EC; }
    .otp-input.error { border-color: #DA121A; animation: shake 0.5s ease; }
    @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
  `]
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  email = signal('');
  isLoading = signal(false);
  isVerified = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // OTP digits
  otp1 = signal(''); otp2 = signal(''); otp3 = signal('');
  otp4 = signal(''); otp5 = signal(''); otp6 = signal('');

  // Timer
  timer = signal(120);
  canResend = signal(false);
  private timerInterval: any;
  attempts = signal(0);
  isLocked = signal(false);

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
    });
    this.startTimer();
    setTimeout(() => document.getElementById('otp1')?.focus(), 100);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  startTimer(): void {
    this.timer.set(120);
    this.canResend.set(false);
    this.timerInterval = setInterval(() => {
      this.timer.update(v => {
        if (v <= 1) { clearInterval(this.timerInterval); this.canResend.set(true); return 0; }
        return v - 1;
      });
    }, 1000);
  }

  onOtpInput(event: any, position: number): void {
    const value = event.target.value;
    if (!/^\d*$/.test(value)) { event.target.value = ''; return; }
    const digit = value.slice(-1);
    event.target.value = digit;

    switch (position) {
      case 1: this.otp1.set(digit); break;
      case 2: this.otp2.set(digit); break;
      case 3: this.otp3.set(digit); break;
      case 4: this.otp4.set(digit); break;
      case 5: this.otp5.set(digit); break;
      case 6: this.otp6.set(digit); break;
    }

    if (digit && position < 6) {
      document.getElementById(`otp${position + 1}`)?.focus();
    }

    this.errorMessage.set(null);

    if (position === 6 && digit) {
      setTimeout(() => this.verifyOTP(), 300);
    }
  }

  onKeyDown(event: KeyboardEvent, position: number): void {
    if (event.key === 'Backspace') {
      const currentInput = document.getElementById(`otp${position}`) as HTMLInputElement;
      if (!currentInput?.value && position > 1) {
        document.getElementById(`otp${position - 1}`)?.focus();
        switch (position - 1) {
          case 1: this.otp1.set(''); break;
          case 2: this.otp2.set(''); break;
          case 3: this.otp3.set(''); break;
          case 4: this.otp4.set(''); break;
          case 5: this.otp5.set(''); break;
        }
      }
    }
    if (event.key === 'ArrowLeft' && position > 1) document.getElementById(`otp${position - 1}`)?.focus();
    if (event.key === 'ArrowRight' && position < 6) document.getElementById(`otp${position + 1}`)?.focus();
  }

  getOtpCode(): string {
    return this.otp1() + this.otp2() + this.otp3() + this.otp4() + this.otp5() + this.otp6();
  }

  isOtpComplete(): boolean { return this.getOtpCode().length === 6; }

  // ✅ POST /api/verify-otp
  verifyOTP(): void {
    if (!this.isOtpComplete()) return;
    if (this.isLocked()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const otp = this.getOtpCode();

    this.authService.verifyOTP(this.email(), otp).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('OTP Response:', response);
        if (response?.success) {
          this.isVerified.set(true);
          this.successMessage.set('Email verified successfully! Redirecting to login...');
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 2000);
        } else {
          this.handleError(response?.message || 'Invalid code.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('OTP Error:', error);
        this.handleError(error?.error?.message || 'Verification failed.');
      }
    });
  }

  handleError(msg: string): void {
    this.attempts.update(v => v + 1);
    const attemptCount = this.attempts();

    document.querySelectorAll('.otp-input').forEach(input => {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
    });

    if (attemptCount >= 3) {
      this.isLocked.set(true);
      this.errorMessage.set('Too many failed attempts. Please request a new code.');
      this.clearOTP();
    } else {
      this.errorMessage.set(`${msg} ${3 - attemptCount} attempt${3 - attemptCount > 1 ? 's' : ''} remaining.`);
      this.clearOTP();
      setTimeout(() => document.getElementById('otp1')?.focus(), 500);
    }
  }

  // ✅ POST /api/send-otp
  resendOTP(): void {
    if (!this.canResend() && this.timer() > 0) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.clearOTP();
    this.attempts.set(0);
    this.isLocked.set(false);

    this.authService.resendOTP(this.email()).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('Resend Response:', response);
        this.successMessage.set('New code sent! Check your email.');
        this.startTimer();
        setTimeout(() => {
          document.getElementById('otp1')?.focus();
          this.successMessage.set(null);
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Resend Error:', error);
        this.errorMessage.set('Failed to resend code. Please try again.');
      }
    });
  }

  clearOTP(): void {
    this.otp1.set(''); this.otp2.set(''); this.otp3.set('');
    this.otp4.set(''); this.otp5.set(''); this.otp6.set('');
    document.querySelectorAll('.otp-input').forEach((input: any) => input.value = '');
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}