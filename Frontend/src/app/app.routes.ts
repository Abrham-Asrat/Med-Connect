import { Routes } from '@angular/router';
import { RegistrationWrapperComponent } from './components/registration-wrapper/registration-wrapper.component';
import { RoleAuthStepComponent } from './components/role-auth-step/role-auth-step.component';
import { PersonalInfoStepComponent } from './components/personal-info-step/personal-info-step.component';

export const routes: Routes = [
  {
    path: 'register',
    component: RegistrationWrapperComponent,
    children: [
      { path: 'step1', component: RoleAuthStepComponent },
      { path: 'step2', component: PersonalInfoStepComponent },
      { path: '', redirectTo: 'step1', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/register/step1', pathMatch: 'full' },
  { path: '**', redirectTo: '/register/step1' }
];
