import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-email-verified',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div class="text-center p-4" style="max-width:480px">
        @if (isLoading()) { <div class="spinner-border text-primary mb-3" style="width:48px;height:48px"></div><h5 class="text-primary">Verifying...</h5> }
        @if (isPatient() && !isLoading()) {
          <div class="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" style="width:80px;height:80px"><i class="bi bi-check-lg text-white" style="font-size:40px"></i></div>
          <h4 class="text-primary">Email Verified! 🎉</h4><p class="text-medium mb-4">Your account is ready. Please login to continue.</p>
          <a routerLink="/auth/login" class="btn btn-primary btn-lg px-5">Go to Login</a>
        }
        @if (isDoctor() && !isLoading()) {
          <div class="rounded-circle bg-warning-light d-inline-flex align-items-center justify-content-center mb-3" style="width:80px;height:80px"><i class="bi bi-clock text-warning-dark" style="font-size:40px"></i></div>
          <h4 class="text-warning-dark">Email Verified!</h4><p class="text-medium mb-3">Your application is under review.</p>
          <div class="card bg-light text-start mb-4"><div class="card-body"><div class="d-flex flex-column gap-2">
            <div><i class="bi bi-check-circle-fill text-primary me-2"></i>Registration complete</div>
            <div><i class="bi bi-check-circle-fill text-primary me-2"></i>Email verified</div>
            <div><i class="bi bi-circle-fill text-warning me-2" style="font-size:8px"></i><strong>Admin review in progress</strong></div>
            <div><i class="bi bi-circle text-medium me-2" style="font-size:8px"></i>Approved</div>
          </div></div></div>
          <small class="text-medium">1-3 business days. You'll get an email when approved.</small>
          <br><a routerLink="/auth/login" class="btn btn-primary mt-3">Go to Login</a>
        }
        @if (errorMessage()) { <div class="alert alert-danger">{{ errorMessage() }}</div><a routerLink="/auth/login" class="btn btn-primary">Login</a> }
      </div>
    </div>
  `
})
export class EmailVerifiedComponent implements OnInit {
  private router = inject(Router);
  isLoading = signal(true); isPatient = signal(false); isDoctor = signal(false); errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const role = localStorage.getItem('pendingRole');
    if (role === 'Doctor') { this.isDoctor.set(true); this.isLoading.set(false); }
    else if (role === 'Patient') { this.isPatient.set(true); this.isLoading.set(false); }
    else { this.isLoading.set(false); this.errorMessage.set('Unable to verify. Please login.'); }
    localStorage.removeItem('pendingEmail'); localStorage.removeItem('pendingRole');
  }
}