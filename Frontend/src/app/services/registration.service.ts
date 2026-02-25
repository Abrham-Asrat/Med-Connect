import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { RegisterUserDto } from '../models/user.model';

export interface RegistrationStep {
  step: number;
  title: string;
  completed: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
  private currentStep = new BehaviorSubject<number>(1);
  private registrationData = new BehaviorSubject<Partial<RegisterUserDto>>({});

  steps: RegistrationStep[] = [
    { step: 1, title: 'Role & Authentication', completed: false },
    { step: 2, title: 'Personal Information', completed: false }
  ];

  currentStep$ = this.currentStep.asObservable();
  registrationData$ = this.registrationData.asObservable();

  getCurrentStep(): number {
    return this.currentStep.value;
  }

  setCurrentStep(step: number): void {
    console.log('[Registration Service] Setting current step to:', step);
    this.currentStep.next(step);
  }

  getRegistrationData(): Partial<RegisterUserDto> {
    return this.registrationData.value;
  }

  updateRegistrationData(data: Partial<RegisterUserDto>): void {
    console.log('[Registration Service] Updating registration data:', data);
    const currentData = this.registrationData.value;
    console.log('[Registration Service] Current data before update:', currentData);
    const newData = { ...currentData, ...data };
    console.log('[Registration Service] New data after update:', newData);
    this.registrationData.next(newData);
  }

  completeStep(step: number): void {
    console.log('[Registration Service] Completing step:', step);
    console.log('[Registration Service] Steps before completion:', this.steps);
    this.steps = this.steps.map(s => 
      s.step === step ? { ...s, completed: true } : s
    );
    console.log('[Registration Service] Steps after completion:', this.steps);
  }

  reset(): void {
    console.log('[Registration Service] Resetting registration service');
    console.log('[Registration Service] Current state before reset:', {
      currentStep: this.currentStep.value,
      registrationData: this.registrationData.value,
      steps: this.steps
    });
    
    this.currentStep.next(1);
    this.registrationData.next({});
    this.steps = this.steps.map(s => ({ ...s, completed: false }));
    
    console.log('[Registration Service] State after reset:', {
      currentStep: this.currentStep.value,
      registrationData: this.registrationData.value,
      steps: this.steps
    });
  }

  isStepValid(step: number): boolean {
    const data = this.registrationData.value;
    
    switch (step) {
      case 1:
        return !!(data.role && data.email);
      case 2:
        return !!(data.firstName && data.lastName && data.phone && data.gender && data.dateOfBirth && data.address);
      default:
        return false;
    }
  }
}