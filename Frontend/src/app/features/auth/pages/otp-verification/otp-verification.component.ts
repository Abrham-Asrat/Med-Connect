import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './otp-verification.component.html',
  styles: [`
    .otp-container {
      display: flex;
      gap: 8px;
      justify-content: center;
    }
    .otp-input {
      width: 48px;
      height: 56px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 24px;
      font-weight: 700;
      border: 2px solid #E5E7EB;
      border-radius: 8px;
      outline: none;
      transition: all 0.2s ease;
    }
    .otp-input:focus {
      border-color: #078930;
      box-shadow: 0 0 0 3px rgba(7, 137, 48, 0.15);
    }
    .otp-input.filled {
      border-color: #078930;
      background: #E8F5EC;
    }
    .otp-input.error {
      border-color: #DA121A;
      animation: shake 0.5s ease;
    }
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-5px); }
      75% { transform: translateX(5px); }
    }
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(7, 137, 48, 0.4); }
      70% { box-shadow: 0 0 0 10px rgba(7, 137, 48, 0); }
      100% { box-shadow: 0 0 0 0 rgba(7, 137, 48, 0); }
    }
    .resend-active {
      animation: pulse-green 2s infinite;
    }
  `]
})
export class OtpVerificationComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  email = signal('');
  isLoading = signal(false);
  isVerified = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  
  // OTP digits
  otp1 = signal('');
  otp2 = signal('');
  otp3 = signal('');
  otp4 = signal('');
  otp5 = signal('');
  otp6 = signal('');
  
  // Timer
  timer = signal(120); // 2 minutes
  canResend = signal(false);
  private timerInterval: any;
  
  // Attempts
  attempts = signal(0);
  isLocked = signal(false);

  ngOnInit(): void {
    // Get email from query params
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['email']) {
        this.email.set(params['email']);
      }
    });
    
    // Start countdown
    this.startTimer();
    
    // Auto-focus first input
    setTimeout(() => {
      document.getElementById('otp1')?.focus();
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  startTimer(): void {
    this.timer.set(120);
    this.canResend.set(false);
    
    this.timerInterval = setInterval(() => {
      this.timer.update(v => {
        if (v <= 1) {
          clearInterval(this.timerInterval);
          this.canResend.set(true);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
  }

  onOtpInput(event: any, position: number): void {
    const value = event.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) {
      event.target.value = '';
      return;
    }

    // Take only the last character
    const digit = value.slice(-1);
    event.target.value = digit;
    
    // Set the signal
    switch (position) {
      case 1: this.otp1.set(digit); break;
      case 2: this.otp2.set(digit); break;
      case 3: this.otp3.set(digit); break;
      case 4: this.otp4.set(digit); break;
      case 5: this.otp5.set(digit); break;
      case 6: this.otp6.set(digit); break;
    }

    // Auto-focus next input
    if (digit && position < 6) {
      const nextInput = document.getElementById(`otp${position + 1}`);
      nextInput?.focus();
    }

    // Clear error on new input
    this.errorMessage.set(null);
    
    // Auto-submit if all 6 digits filled
    if (position === 6 && digit) {
      setTimeout(() => this.verifyOTP(), 300);
    }
  }

  onKeyDown(event: KeyboardEvent, position: number): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      const currentInput = document.getElementById(`otp${position}`) as HTMLInputElement;
      
      if (!currentInput?.value && position > 1) {
        // Move to previous input
        const prevInput = document.getElementById(`otp${position - 1}`);
        prevInput?.focus();
        // Clear previous input
        switch (position - 1) {
          case 1: this.otp1.set(''); break;
          case 2: this.otp2.set(''); break;
          case 3: this.otp3.set(''); break;
          case 4: this.otp4.set(''); break;
          case 5: this.otp5.set(''); break;
        }
      }
    }
    
    // Handle left arrow
    if (event.key === 'ArrowLeft' && position > 1) {
      document.getElementById(`otp${position - 1}`)?.focus();
    }
    
    // Handle right arrow
    if (event.key === 'ArrowRight' && position < 6) {
      document.getElementById(`otp${position + 1}`)?.focus();
    }
  }

  getOtpCode(): string {
    return this.otp1() + this.otp2() + this.otp3() + this.otp4() + this.otp5() + this.otp6();
  }

  isOtpComplete(): boolean {
    return this.getOtpCode().length === 6;
  }

  verifyOTP(): void {
    if (!this.isOtpComplete()) return;
    if (this.isLocked()) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const otp = this.getOtpCode();

    this.authService.verifyOTP(this.email(), otp).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.isVerified.set(true);
          this.successMessage.set('Email verified successfully!');
          
          // Redirect based on role or show success
          setTimeout(() => {
            const role = response?.data?.role;
            if (role === 'Doctor') {
              // Show pending approval message
              this.successMessage.set('Your application is under review. You will be notified once approved.');
            } else {
              this.router.navigate(['/auth/login']);
            }
          }, 2000);
        } else {
          this.handleError();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.handleError();
      }
    });
  }

  handleError(): void {
    this.attempts.update(v => v + 1);
    const attemptCount = this.attempts();

    // Shake animation
    document.querySelectorAll('.otp-input').forEach(input => {
      input.classList.add('error');
      setTimeout(() => input.classList.remove('error'), 500);
    });

    if (attemptCount >= 3) {
      this.isLocked.set(true);
      this.errorMessage.set('Too many failed attempts. Please request a new code.');
      // Clear OTP
      this.clearOTP();
    } else {
      this.errorMessage.set(`Invalid code. ${3 - attemptCount} attempt${3 - attemptCount > 1 ? 's' : ''} remaining.`);
      // Clear OTP and refocus
      this.clearOTP();
      setTimeout(() => document.getElementById('otp1')?.focus(), 500);
    }
  }

  resendOTP(): void {
    if (!this.canResend() && this.timer() > 0) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.clearOTP();
    this.attempts.set(0);
    this.isLocked.set(false);

    // Call resend API - using forgot password endpoint for now
    this.authService.forgotPassword(this.email()).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('New code sent! Check your email.');
        this.startTimer();
        
        setTimeout(() => {
          document.getElementById('otp1')?.focus();
          this.successMessage.set(null);
        }, 2000);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to resend code. Please try again.');
      }
    });
  }

  clearOTP(): void {
    this.otp1.set(''); this.otp2.set(''); this.otp3.set('');
    this.otp4.set(''); this.otp5.set(''); this.otp6.set('');
    document.querySelectorAll('.otp-input').forEach((input: any) => {
      input.value = '';
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
}