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
  styles: [`
    .login-container { min-height: 100vh; }
    .brand-panel { background: linear-gradient(135deg, #078930, #056B24); }
    .form-card { max-width: 440px; }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = signal(false);
  showPassword = signal(false);
  errorMessage = signal<string | null>(null);

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

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        // ✅ Navigation happens in setSession now
        if (!response.success) {
          this.errorMessage.set(response.message || 'Login failed.');
        }
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Login error:', error);
        
        if (error.status === 401) {
          this.errorMessage.set('Invalid email or password.');
        } else if (error.status === 403) {
          this.errorMessage.set('Your account is not verified. Please check your email.');
        } else if (error.status === 429) {
          this.errorMessage.set('Too many attempts. Please try again later.');
        } else {
          this.errorMessage.set(error?.error?.message || 'Login failed. Please try again.');
        }
      }
    });
  }


  hasError(field: string, error: string): boolean {
    const control = this.loginForm.get(field);
    return !!(control && control.touched && control.hasError(error));
  }
}