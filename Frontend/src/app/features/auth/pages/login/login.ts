import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
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

  togglePassword(): void {
    this.showPassword.set(!this.showPassword());
  }

  hasError(controlName: string, errorName: string): boolean {
    const control = this.loginForm.get(controlName);
    return !!control && control.hasError(errorName) && (control.dirty || control.touched);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) { this.loginForm.markAllAsTouched(); return; }
    this.isLoading.set(true); this.errorMessage.set(null);
    this.authService.login(this.loginForm.value).subscribe({
      next: (r: any) => { this.isLoading.set(false); if (!r?.success) this.errorMessage.set(r?.message || 'Login failed.'); },
      error: (e: any) => {
        this.isLoading.set(false);
        if (e?.status === 403) {
          this.errorMessage.set(e?.error?.message || 'Email verification required. Please check your inbox.');
        } else {
          this.errorMessage.set(e?.status === 401 ? 'Invalid credentials' : e?.error?.message || 'Login failed. Try again.');
        }
      }
    });
  }
}