import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';
import { Auth0Service } from '../../services/auth0.service';
import { RegistrationService } from '../../services/registration.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-role-auth-step',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ],
  template: `
    <div class="registration-step">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Step 1: Role & Authentication</mat-card-title>
          <mat-card-subtitle>Select your role and authenticate with Auth0</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="roleForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Select Role</mat-label>
              <mat-select formControlName="role" required>
                <mat-option value="Patient">Patient</mat-option>
                <mat-option value="Doctor">Doctor</mat-option>
                <mat-option value="Admin">Admin</mat-option>
              </mat-select>
              <mat-error *ngIf="roleForm.get('role')?.hasError('required')">
                Role is required
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" required>
              <mat-error *ngIf="roleForm.get('email')?.hasError('required')">
                Email is required
              </mat-error>
              <mat-error *ngIf="roleForm.get('email')?.hasError('email')">
                Please enter a valid email
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="fill" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" required>
              <mat-error *ngIf="roleForm.get('password')?.hasError('required')">
                Password is required
              </mat-error>
              <mat-error *ngIf="roleForm.get('password')?.hasError('minlength')">
                Password must be at least 6 characters
              </mat-error>
            </mat-form-field>

            <div class="button-row">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit"
                [disabled]="!roleForm.valid">
                Authenticate with Auth0
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
    
    .button-row {
      display: flex;
      justify-content: center;
      margin-top: 20px;
    }
    
    mat-card {
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
  `]
})
export class RoleAuthStepComponent implements OnInit {
  roleForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private auth0Service: Auth0Service,
    private registrationService: RegistrationService,
    private router: Router
  ) {
    this.roleForm = this.fb.group({
      role: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    // Load any existing data
    const existingData = this.registrationService.getRegistrationData();
    if (existingData.role || existingData.email) {
      this.roleForm.patchValue({
        role: existingData.role,
        email: existingData.email
      });
    }
  }

  onSubmit(): void {
    console.log('[Step 1] Form submission started');
    
    if (this.roleForm.valid) {
      console.log('[Step 1] Form is valid, processing...');
      const formData = this.roleForm.value;
      
      console.log('[Step 1] Saving form data:', {
        role: formData.role,
        email: formData.email
      });
      
      // Save role and email to registration service
      this.registrationService.updateRegistrationData({
        role: formData.role,
        email: formData.email
      });

      console.log('[Step 1] Marking step 1 as complete');
      // Complete this step
      this.registrationService.completeStep(1);
      
      console.log('[Step 1] Setting registration step flag in localStorage');
      // Set a flag to indicate we should navigate to step 2 after auth
      localStorage.setItem('registrationStep', '1');
      
      console.log('[Step 1] Initiating Auth0 login redirect');
      // Authenticate with Auth0
      this.auth0Service.login();
      
      console.log('[Step 1] Auth0 login initiated - user should be redirected');
    } else {
      console.error('[Step 1] Form validation failed:', this.roleForm.errors);
      console.log('[Step 1] Invalid fields:', {
        role: this.roleForm.get('role')?.errors,
        email: this.roleForm.get('email')?.errors,
        password: this.roleForm.get('password')?.errors
      });
    }
  }
}