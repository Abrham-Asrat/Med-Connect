import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="d-flex flex-column min-vh-100">
      <!-- Public Navbar -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold" href="/">
            <i class="bi bi-heart-pulse me-2"></i>Med-Connect
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#publicNav">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="publicNav">
            <ul class="navbar-nav ms-auto align-items-lg-center gap-2">
              <li class="nav-item"><a class="nav-link text-white" href="/">Home</a></li>
              <li class="nav-item"><a class="nav-link text-white" href="#how-it-works">How It Works</a></li>
              <li class="nav-item"><a class="nav-link text-white" href="#for-patients">For Patients</a></li>
              <li class="nav-item"><a class="nav-link text-white" href="#for-doctors">For Doctors</a></li>
              <li class="nav-item"><a class="nav-link text-white" href="#contact">Contact</a></li>
              <li class="nav-item ms-lg-3">
                <a routerLink="/auth/login" class="btn btn-outline-light btn-sm px-3">Sign In</a>
              </li>
              <li class="nav-item">
                <a routerLink="/auth/register" class="btn btn-warning btn-sm px-3 fw-bold">Register</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <!-- Main Content -->
      <main class="flex-grow-1">
        <router-outlet></router-outlet>
      </main>

      <!-- Public Footer -->
      <footer class="bg-dark text-white py-4" style="background: #04521D !important;">
        <div class="container">
          <div class="row g-3">
            <div class="col-md-4">
              <h6><i class="bi bi-heart-pulse me-2"></i>Med-Connect</h6>
              <small class="opacity-75">Ethiopia's trusted healthcare platform.</small>
            </div>
            <div class="col-md-4">
              <small class="opacity-75">support&#64;medconnect.com</small><br>
              <small class="opacity-75">Addis Ababa, Ethiopia</small>
            </div>
            <div class="col-md-4 text-md-end">
              <small class="opacity-75">&copy; 2026 Med-Connect. All rights reserved.</small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  `
})
export class PublicLayoutComponent {}