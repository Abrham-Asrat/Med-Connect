import { Component, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-onboarding-tour',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (showTour()) {
      <div class="position-fixed top-0 start-0 w-100 h-100" style="z-index: 9999; background: rgba(0,0,0,0.6);">
        <div class="position-absolute bg-white rounded-4 shadow-lg p-4" style="top: 50%; left: 50%; transform: translate(-50%, -50%); max-width: 420px; width: 90%;">
          <div class="text-center mb-3">
            @switch (currentStep()) {
              @case (1) { <i class="bi bi-house-door text-primary" style="font-size: 48px;"></i> }
              @case (2) { <i class="bi bi-search text-primary" style="font-size: 48px;"></i> }
              @case (3) { <i class="bi bi-calendar-check text-primary" style="font-size: 48px;"></i> }
              @case (4) { <i class="bi bi-chat-dots text-primary" style="font-size: 48px;"></i> }
            }
          </div>
          
          <h5 class="text-primary text-center mb-2">{{ steps()[currentStep() - 1].title }}</h5>
          <p class="text-medium text-center mb-3">{{ steps()[currentStep() - 1].description }}</p>
          
          <!-- Progress -->
          <div class="d-flex justify-content-center gap-1 mb-4">
            @for (s of steps(); track $index) {
              <div class="rounded-pill" style="width:24px;height:4px" 
                   [class.bg-primary]="$index < currentStep()" [class.bg-light]="$index >= currentStep()"></div>
            }
          </div>

          <div class="d-flex justify-content-between">
            <button class="btn btn-link text-medium" (click)="skipTour()">Skip Tour</button>
            <div>
              @if (currentStep() > 1) {
                <button class="btn btn-outline-primary me-2" (click)="prevStep()">Back</button>
              }
              @if (currentStep() < steps().length) {
                <button class="btn btn-primary" (click)="nextStep()">Next</button>
              } @else {
                <button class="btn btn-primary" (click)="finishTour()">Get Started!</button>
              }
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class OnboardingTourComponent {
  @Input() role: 'patient' | 'doctor' = 'patient';
  showTour = signal(true);
  currentStep = signal(1);

  steps = signal([
    { title: 'Welcome to Med-Connect! 👋', description: 'Your trusted Ethiopian healthcare platform. Let us show you around.' },
    { title: 'Find Your Doctor 🔍', description: 'Search verified doctors by specialty, rating, and availability. All doctors are admin-verified.' },
    { title: 'Book Appointments 📅', description: 'Schedule online or in-person appointments with just a few clicks. Choose your preferred time slot.' },
    { title: 'Stay Connected 💬', description: 'Chat with your doctor, access medical records, and get real-time notifications about your appointments.' },
  ]);

  nextStep(): void { this.currentStep.update(v => v + 1); }
  prevStep(): void { this.currentStep.update(v => Math.max(1, v - 1)); }
  skipTour(): void { this.showTour.set(false); localStorage.setItem('onboardingComplete', 'true'); }
  finishTour(): void { this.showTour.set(false); localStorage.setItem('onboardingComplete', 'true'); }
}