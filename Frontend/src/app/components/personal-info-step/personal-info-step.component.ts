import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Auth0Service } from '../../services/auth0.service';
import { RegistrationService } from '../../services/registration.service';
import { UserService } from '../../services/user.service';
import { RegisterUserDto } from '../../models/user.model';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-info-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="registration-step">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Step 2: Personal Information</mat-card-title>
          <mat-card-subtitle>Complete your profile information</mat-card-subtitle>
        </mat-card-header>
        
        <!-- Auth0 Error Display -->
        <div *ngIf="authError" class="auth-error">
          <mat-error>
            {{ authError }}
          </mat-error>
          <button mat-button color="primary" (click)="authError = null">Dismiss</button>
        </div>
        
        <mat-card-content>
          <form [formGroup]="personalForm" (ngSubmit)="onSubmit()">
            <div class="form-row">
              <mat-form-field appearance="fill" class="half-width">
                <mat-label>First Name</mat-label>
                <input matInput formControlName="firstName" required>
                <mat-error *ngIf="personalForm.get('firstName')?.hasError('required')">
                  First name is required
                </mat-error>
                <mat-error *ngIf="personalForm.get('firstName')?.hasError('minlength')">
                  First name must be at least 1 character
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="half-width">
                <mat-label>Last Name</mat-label>
                <input matInput formControlName="lastName" required>
                <mat-error *ngIf="personalForm.get('lastName')?.hasError('required')">
                  Last name is required
                </mat-error>
                <mat-error *ngIf="personalForm.get('lastName')?.hasError('minlength')">
                  Last name must be at least 1 character
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Phone Number</mat-label>
              <input matInput formControlName="phone" required>
              <mat-error *ngIf="personalForm.get('phone')?.hasError('required')">
                Phone number is required
              </mat-error>
              <mat-error *ngIf="personalForm.get('phone')?.hasError('minlength')">
                Phone number must be at least 4 characters
              </mat-error>
              <mat-error *ngIf="personalForm.get('phone')?.hasError('maxlength')">
                Phone number must be at most 20 characters
              </mat-error>
            </mat-form-field>

            <div class="form-row">
              <mat-form-field appearance="fill" class="half-width">
                <mat-label>Gender</mat-label>
                <mat-select formControlName="gender" required>
                  <mat-option value="Male">Male</mat-option>
                  <mat-option value="Female">Female</mat-option>
                  <mat-option value="Other">Other</mat-option>
                </mat-select>
                <mat-error *ngIf="personalForm.get('gender')?.hasError('required')">
                  Gender is required
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="fill" class="half-width">
                <mat-label>Date of Birth</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateOfBirth" required>
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="personalForm.get('dateOfBirth')?.hasError('required')">
                  Date of birth is required
                </mat-error>
              </mat-form-field>
            </div>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Address</mat-label>
              <textarea matInput formControlName="address" rows="3" required></textarea>
              <mat-error *ngIf="personalForm.get('address')?.hasError('required')">
                Address is required
              </mat-error>
              <mat-error *ngIf="personalForm.get('address')?.hasError('maxlength')">
                Address must be at most 500 characters
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Profile Picture URL (Optional)</mat-label>
              <input matInput formControlName="profilePictureUrl">
            </mat-form-field>

            <div class="button-row">
              <button 
                mat-button 
                type="button" 
                (click)="onBack()"
                class="back-button">
                Back
              </button>
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="!personalForm.valid || isSubmitting">
                {{ isSubmitting ? 'Submitting...' : 'Complete Registration' }}
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .registration-step {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .full-width {
      width: 100%;
      margin-bottom: 20px;
    }
    
    .half-width {
      width: 48%;
      margin-bottom: 20px;
    }
    
    .form-row {
      display: flex;
      gap: 20px;
    }
    
    .button-row {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .back-button {
      color: #666;
    }
    
    mat-card {
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
      }
      
      .half-width {
        width: 100%;
      }
    }
  `]
})
export class PersonalInfoStepComponent implements OnInit, OnDestroy {
  personalForm: FormGroup;
  isSubmitting = false;
  authError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private auth0Service: Auth0Service,
    private registrationService: RegistrationService,
    private userService: UserService,
    private router: Router
  ) {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      gender: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      address: ['', [Validators.required, Validators.maxLength(500)]],
      profilePictureUrl: ['']
    });
  }

  private authSubscription: any;

  ngOnInit(): void {
    console.log('[Step 2] Component initialization started');
    
    // Check for Auth0 errors in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('error')) {
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      this.authError = `Auth0 Error: ${error} - ${errorDescription}`;
      console.error('[Step 2] Auth0 error detected:', this.authError);
    }
    
    // Check if we're coming from step 1 after Auth0 authentication
    const registrationStep = localStorage.getItem('registrationStep');
    console.log('[Step 2] Registration step flag:', registrationStep);
    
    // Load existing data first
    console.log('[Step 2] Loading existing registration data');
    const existingData = this.registrationService.getRegistrationData();
    console.log('[Step 2] Existing data:', existingData);
    
    this.personalForm.patchValue({
      firstName: existingData.firstName,
      lastName: existingData.lastName,
      phone: existingData.phone,
      gender: existingData.gender,
      dateOfBirth: existingData.dateOfBirth,
      address: existingData.address,
      profilePictureUrl: existingData.profilePictureUrl
    });
    
    // Check if user is authenticated
    this.authSubscription = this.auth0Service.isAuthenticated$().subscribe(isAuthenticated => {
      console.log('[Step 2] Auth state changed - isAuthenticated:', isAuthenticated);
      
      if (!isAuthenticated && registrationStep !== '1') {
        console.log('[Step 2] User not authenticated and not coming from step 1 - redirecting to step 1');
        // Redirect to step 1 if not authenticated and not coming from step 1
        this.router.navigate(['/register/step1']);
      } else if (isAuthenticated && registrationStep === '1') {
        console.log('[Step 2] User authenticated and came from step 1 - clearing flag and staying on step 2');
        // User is authenticated and came from step 1, clear the flag
        localStorage.removeItem('registrationStep');
        // Stay on step 2 and continue with registration
        this.registrationService.setCurrentStep(2);
      } else if (isAuthenticated) {
        console.log('[Step 2] User authenticated - normal step 2 access');
        this.registrationService.setCurrentStep(2);
      } else if (!isAuthenticated && registrationStep === '1') {
        console.log('[Step 2] User not authenticated but has step 1 flag - this is expected during Auth0 flow');
        console.log('[Step 2] Component will wait for authentication to complete');
        // Don't redirect - user is in the middle of Auth0 authentication flow
        // Component should remain on step 2 and wait for isAuthenticated to become true
      }
    });
    
    console.log('[Step 2] Component initialization completed');
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  onBack(): void {
    this.router.navigate(['/register/step1']);
  }

  onSubmit(): void {
    console.log('[Step 2] Form submission started');
    
    if (this.personalForm.valid && !this.isSubmitting) {
      console.log('[Step 2] Form is valid and not submitting, processing...');
      this.isSubmitting = true;
      
      const formData = this.personalForm.value;
      console.log('[Step 2] Form data:', formData);
      
      // Save to registration service
      console.log('[Step 2] Saving form data to registration service');
      this.registrationService.updateRegistrationData({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        profilePictureUrl: formData.profilePictureUrl
      });

      console.log('[Step 2] Requesting access token from Auth0');
      // Get access token and send to backend
      this.auth0Service.getAccessToken().subscribe({
        next: (token) => {
          console.log('[Step 2] Access token received:', token ? 'Token available' : 'No token');
          
          if (token) {
            // Create complete registration data
            const registrationData: RegisterUserDto = {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: this.registrationService.getRegistrationData().email || '',
              phone: formData.phone,
              gender: formData.gender,
              dateOfBirth: formData.dateOfBirth,
              address: formData.address,
              role: this.registrationService.getRegistrationData().role || ''
            };

            console.log('[Step 2] Sending registration data to backend:', registrationData);

            // Send to backend
            this.userService.initializeProfile(registrationData).subscribe({
              next: (response) => {
                console.log('[Step 2] Backend response received:', response);
                
                if (response.success) {
                  console.log('[Step 2] Registration successful');
                  // Complete registration
                  this.registrationService.completeStep(2);
                  this.registrationService.reset();
                  
                  console.log('[Step 2] Navigating to dashboard');
                  // Navigate to dashboard or profile page
                  this.router.navigate(['/dashboard']);
                } else {
                  console.error('[Step 2] Registration failed:', response.message);
                  console.log('[Step 2] Response details:', response);
                  this.isSubmitting = false;
                  // Show error message to user
                }
              },
              error: (error) => {
                console.error('[Step 2] Registration error occurred:', error);
                console.log('[Step 2] Error details:', {
                  status: error.status,
                  message: error.message,
                  error: error.error
                });
                this.isSubmitting = false;
                // Show error message to user
              }
            });
          } else {
            console.error('[Step 2] No access token available');
            this.isSubmitting = false;
          }
        },
        error: (error) => {
          console.error('[Step 2] Failed to get access token:', error);
          console.log('[Step 2] Token error details:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          this.isSubmitting = false;
        }
      });
    } else {
      console.log('[Step 2] Form validation status:', {
        valid: this.personalForm.valid,
        isSubmitting: this.isSubmitting,
        errors: this.personalForm.errors
      });
      
      if (!this.personalForm.valid) {
        console.log('[Step 2] Invalid fields:', {
          firstName: this.personalForm.get('firstName')?.errors,
          lastName: this.personalForm.get('lastName')?.errors,
          phone: this.personalForm.get('phone')?.errors,
          gender: this.personalForm.get('gender')?.errors,
          dateOfBirth: this.personalForm.get('dateOfBirth')?.errors,
          address: this.personalForm.get('address')?.errors
        });
      }
    }
  }
}