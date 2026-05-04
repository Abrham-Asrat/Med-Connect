import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-0">
      <!-- Hero Header -->
      <section class="about-hero bg-primary text-white py-5 position-relative overflow-hidden">
        <div class="container py-4 position-relative" style="z-index: 2; max-width: 1000px;">
          <h6 class="text-warning fw-bold text-uppercase mb-3 animate-fade-in">Established 2024</h6>
          <h1 class="display-4 fw-bold mb-4 animate-slide-up">Transforming the <span class="text-warning">Pulse</span> of Ethiopian Healthcare</h1>
          <p class="lead opacity-90 mb-0" style="max-width: 600px;">
            Med-Connect is a pioneer in digital health integration, dedicated to bridging the accessibility gap between world-class medical professionals and the people of Ethiopia.
          </p>
        </div>
        <div class="hero-pattern"></div>
      </section>

      <div class="container py-5" style="max-width: 1000px;">
        <!-- Our Story Section -->
        <div class="row g-5 align-items-center mb-5 pb-lg-5">
          <div class="col-lg-6">
            <h2 class="fw-bold mb-4 text-primary">Our Story <br><span class="fs-5 text-muted fw-normal">ታሪካችን - ከሐሳብ ወደ ትግበራ</span></h2>
            <p class="text-muted mb-4 lead" style="text-align: justify;">
              Med-Connect was born out of a simple observation: the healthcare journey in Ethiopia was fragmented. Patients struggled to find trusted specialists, while medical records were often lost in paper trails. 
            </p>
            <p class="text-muted mb-4" style="text-align: justify;">
              Founded by a team of visionary technologists and medical consultants, we set out to build a platform that doesn't just book appointments, but fosters a lifelong partnership between doctors and patients. Today, we are proud to serve thousands, ensuring that no one is more than a click away from professional care.
            </p>
            <div class="d-flex gap-4">
              <div class="text-center">
                <h4 class="fw-bold text-primary mb-0">50+</h4>
                <small class="text-muted">Partener Clinics</small>
              </div>
              <div class="vr"></div>
              <div class="text-center">
                <h4 class="fw-bold text-primary mb-0">500+</h4>
                <small class="text-muted">Verified MDs</small>
              </div>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="about-card p-2 rounded-4 shadow-lg bg-white rotate-right">
              <img src="assets/about-team.png" alt="Med-Connect Founders" class="img-fluid rounded-4">
            </div>
          </div>
        </div>

        <!-- Core Values Section -->
        <div class="text-center mb-5">
          <h3 class="fw-bold text-primary">Our Core Values</h3>
          <p class="text-muted">The principles that drive every line of code we write.</p>
        </div>
        <div class="row g-4 mb-5 pb-5">
          @for (value of coreValues; track value.title) {
            <div class="col-md-4">
              <div class="value-card h-100 p-4 rounded-4 border bg-white shadow-sm hover-lift">
                <div class="value-icon mb-3 bg-primary-light text-primary d-inline-flex p-3 rounded-circle">
                  <i class="bi {{ value.icon }} fs-3"></i>
                </div>
                <h5 class="fw-bold">{{ value.title }}</h5>
                <p class="text-muted small mb-0">{{ value.desc }}</p>
              </div>
            </div>
          }
        </div>

        <!-- Data Safety Section -->
        <div class="data-safety-box p-5 rounded-4 text-white mb-5 position-relative overflow-hidden" 
             style="background: linear-gradient(135deg, #04521D 0%, #078930 100%);">
          <div class="row align-items-center position-relative" style="z-index: 2;">
            <div class="col-md-2 text-center text-md-start mb-3 mb-md-0">
              <i class="bi bi-shield-lock-fill display-3 text-warning"></i>
            </div>
            <div class="col-md-10">
              <h4 class="fw-bold mb-2">Hospital-Grade Data Security</h4>
              <p class="mb-0 opacity-90">
                We take your privacy seriously. Every medical record, chat message, and appointment detail is encrypted using AES-256 standards, ensuring your private health data remains between you and your doctor.
              </p>
            </div>
          </div>
          <div class="safety-bg-pattern"></div>
        </div>

        <!-- Leadership Section -->
        <div class="text-center mb-5 mt-5">
          <h3 class="fw-bold text-primary">Leadership Team</h3>
          <p class="text-muted">Guided by experience and fueled by innovation.</p>
        </div>
        <div class="row g-4 justify-content-center">
          <div class="col-md-4">
            <div class="text-center p-3">
              <div class="rounded-circle bg-light border mb-3 mx-auto" style="width: 120px; height: 120px; overflow: hidden;">
                <img src="assets/ceo-avatar.png" alt="CEO" class="img-fluid opacity-50" style="filter: grayscale(1);">
              </div>
              <h6 class="fw-bold mb-0">Dr. Elias Samuel</h6>
              <small class="text-primary fw-bold">Chief Medical Officer</small>
            </div>
          </div>
          <div class="col-md-4">
            <div class="text-center p-3">
              <div class="rounded-circle bg-light border mb-3 mx-auto" style="width: 120px; height: 120px; overflow: hidden;">
                <img src="assets/cto-avatar.png" alt="CTO" class="img-fluid opacity-50" style="filter: grayscale(1);">
              </div>
              <h6 class="fw-bold mb-0">Solomon Tekle</h6>
              <small class="text-primary fw-bold">CTO & Founder</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .about-hero { min-height: 300px; }
    .hero-pattern { position: absolute; top: 0; right: 0; width: 50%; height: 100%; background: url('https://www.transparenttextures.com/patterns/cubes.png'); opacity: 0.1; }
    .bg-primary-light { background: #E8F5EC; }
    .about-card.rotate-right { transform: rotate(2deg); transition: transform 0.3s ease; }
    .about-card.rotate-right:hover { transform: rotate(0deg); }
    .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
    .hover-lift:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.05) !important; }
    .safety-bg-pattern { position: absolute; bottom: -20px; right: -20px; font-size: 15rem; color: rgba(255,255,255,0.03); transform: rotate(-15deg); font-family: 'Bootstrap-icons'; content: "\\F53E"; }
    .animate-slide-up { animation: slideUp 0.8s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class AboutUsComponent {
  coreValues = [
    { title: 'Integrity', icon: 'bi-patch-check', desc: 'Every doctor on our platform is hand-verified for credentials and ethics.' },
    { title: 'Accessibility', icon: 'bi-universal-access', desc: 'Breaking down barriers to ensure every Ethiopian has a MD at their fingertips.' },
    { title: 'Innovation', icon: 'bi-gpu-card', desc: 'Leveraging AI and modern data standards to provide seamless health management.' }
  ];
}
