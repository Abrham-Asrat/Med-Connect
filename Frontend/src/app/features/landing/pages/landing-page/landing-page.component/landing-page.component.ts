import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="min-vh-100 bg-gradient-green text-white">
      <nav class="navbar navbar-dark">
        <div class="container">
          <span class="navbar-brand mb-0 h3">
            <i class="bi bi-heart-pulse me-2"></i>Med-Connect
          </span>
          <div class="d-flex gap-2">
            <a routerLink="/auth/login" class="btn btn-outline-light btn-sm">Sign In</a>
            <a routerLink="/auth/register" class="btn btn-warning btn-sm">Register</a>
          </div>
        </div>
      </nav>
      <div class="container text-center py-5 mt-5">
        <h1 class="display-4 fw-bold mb-3">Your Health, Our Priority</h1>
        <p class="lead mb-4">Connect with verified Ethiopian doctors.<br>Book appointments online or in person.</p>
        <a routerLink="/auth/register" class="btn btn-warning btn-lg px-5 fw-bold">
          Get Started
        </a>
        <div class="mt-4">
          <small>2000+ Verified Doctors | 50,000+ Patients</small>
        </div>
      </div>
    </div>
  `
})
export class LandingPageComponent {}