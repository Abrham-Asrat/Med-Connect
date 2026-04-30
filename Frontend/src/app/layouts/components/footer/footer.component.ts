import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="bg-dark text-white py-5" style="background: #04521D !important;">
      <div class="container">
        <div class="row g-4">
          <!-- Brand -->
          <div class="col-lg-4">
            <h5 class="mb-3"><i class="bi bi-heart-pulse me-2"></i>Med-Connect</h5>
            <p class="opacity-75" style="font-size: 14px;">
              Ethiopia's trusted healthcare platform connecting patients with verified medical professionals.
            </p>
            <div class="d-flex gap-3 mt-3">
              <a href="#" class="text-white fs-5"><i class="bi bi-facebook"></i></a>
              <a href="#" class="text-white fs-5"><i class="bi bi-twitter-x"></i></a>
              <a href="#" class="text-white fs-5"><i class="bi bi-instagram"></i></a>
              <a href="#" class="text-white fs-5"><i class="bi bi-telegram"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="col-6 col-lg-2">
            <h6 class="text-warning mb-3">Quick Links</h6>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Home</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Find Doctors</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Book Appointment</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">For Doctors</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">About Us</a>
          </div>

          <!-- Support -->
          <div class="col-6 col-lg-2">
            <h6 class="text-warning mb-3">Support</h6>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Help Center</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Privacy Policy</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Terms of Service</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">FAQs</a>
            <a href="#" class="text-white text-decoration-none d-block mb-2 opacity-75" style="font-size:14px;">Accessibility</a>
          </div>

          <!-- Contact -->
          <div class="col-lg-4">
            <h6 class="text-warning mb-3">Contact Us</h6>
            <p class="mb-1 opacity-75" style="font-size:14px;">
              <i class="bi bi-envelope me-2"></i>support&#64;medconnect.com
            </p>
            <p class="mb-1 opacity-75" style="font-size:14px;">
              <i class="bi bi-telephone me-2"></i>+251-XXX-XXX-XXX
            </p>
            <p class="mb-1 opacity-75" style="font-size:14px;">
              <i class="bi bi-geo-alt me-2"></i>Addis Ababa, Ethiopia
            </p>
            <p class="text-danger mt-2" style="font-size:14px;">
              <i class="bi bi-exclamation-triangle me-1"></i>Emergency: Call 907
            </p>
          </div>
        </div>

        <hr class="my-4 opacity-25">
        <div class="text-center opacity-75">
          <small>&copy; 2026 Med-Connect. All rights reserved. Built in Ethiopia 🇪🇹</small>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}