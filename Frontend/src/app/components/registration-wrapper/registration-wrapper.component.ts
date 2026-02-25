import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RegistrationService, RegistrationStep } from '../../services/registration.service';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-wrapper',
  imports: [
    CommonModule,
    RouterOutlet,
    MatStepperModule
  ],
  template: `
    <div class="registration-wrapper">
      <!-- Progress Steps -->
      <div class="progress-container">
        <mat-horizontal-stepper [selectedIndex]="currentStep - 1" #stepper>
          <mat-step *ngFor="let step of steps" [label]="step.title" [completed]="step.completed">
          </mat-step>
        </mat-horizontal-stepper>
      </div>

      <!-- Step Content -->
      <div class="step-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    .registration-wrapper {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .progress-container {
      margin-bottom: 30px;
    }
    
    .step-content {
      min-height: 400px;
    }
    
    mat-horizontal-stepper {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `]
})
export class RegistrationWrapperComponent implements OnInit {
  currentStep: number = 1;
  steps: RegistrationStep[] = [];

  constructor(
    private router: Router,
    private registrationService: RegistrationService
  ) {}

  ngOnInit(): void {
    console.log('[Registration Wrapper] Component initialization started');
    console.log('[Registration Wrapper] Current URL:', this.router.url);
    
    this.steps = this.registrationService.steps;
    
    // Subscribe to step changes
    this.registrationService.currentStep$.subscribe(step => {
      console.log('[Registration Wrapper] Step changed to:', step);
      this.currentStep = step;
    });

    // Handle route changes to sync with registration service
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      console.log('[Registration Wrapper] Navigation event:', event);
      const url = event.urlAfterRedirects;
      console.log('[Registration Wrapper] URL after redirects:', url);
      
      // Check if there's an Auth0 error in the URL
      if (url.includes('error=')) {
        console.log('[Registration Wrapper] Auth0 error detected in URL, not changing step');
        return;
      }
      
      if (url.includes('/register/step1')) {
        console.log('[Registration Wrapper] Setting step to 1 based on route');
        this.registrationService.setCurrentStep(1);
      } else if (url.includes('/register/step2')) {
        console.log('[Registration Wrapper] Setting step to 2 based on route');
        this.registrationService.setCurrentStep(2);
      }
    });

    // Initialize current step based on route
    const currentUrl = this.router.url;
    console.log('[Registration Wrapper] Initializing step based on current URL:', currentUrl);
    if (currentUrl.includes('/register/step1')) {
      console.log('[Registration Wrapper] Initializing step 1');
      this.registrationService.setCurrentStep(1);
    } else if (currentUrl.includes('/register/step2')) {
      console.log('[Registration Wrapper] Initializing step 2');
      this.registrationService.setCurrentStep(2);
    }
    
    console.log('[Registration Wrapper] Component initialization completed');
  }
}