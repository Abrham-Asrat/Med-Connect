import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-md-5">
          <div class="card shadow">
            <div class="card-header bg-primary text-white text-center py-3">
              <h4 class="mb-0"><i class="bi bi-box-arrow-in-right me-2"></i>Sign In</h4>
            </div>
            <div class="card-body p-4">
              <form>
                <div class="mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" placeholder="you@example.com">
                </div>
                <div class="mb-3">
                  <label class="form-label">Password</label>
                  <input type="password" class="form-control" placeholder="Enter password">
                </div>
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="remember">
                  <label class="form-check-label" for="remember">Remember me</label>
                </div>
                <button type="submit" class="btn btn-primary w-100 mb-3">Sign In</button>
                <div class="text-center">
                  <a routerLink="/auth/forgot-password" class="text-secondary">Forgot password?</a>
                </div>
                <hr>
                <div class="text-center">
                  <span class="text-medium">Don't have an account?</span>
                  <a routerLink="/auth/register" class="ms-1">Register</a>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {}