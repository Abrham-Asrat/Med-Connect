import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styles: [`
    .section-card { border-left: 4px solid #078930; }
    .section-card.danger { border-left-color: #DA121A; }
  `]
})
export class SettingsComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private fb = inject(FormBuilder);

  user = this.authService.currentUser;
  activeTab = signal('profile');
  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Profile form
  profileForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: [{ value: '', disabled: true }],
    phone: ['', Validators.required],
    gender: [''],
    dateOfBirth: [''],
    address: [''],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  });

  // Password form
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  // Notification prefs
  notifications = signal([
    { label: 'Appointment reminders', enabled: true },
    { label: 'New messages', enabled: true },
    { label: 'Payment receipts', enabled: true },
    { label: 'Review requests', enabled: true },
    { label: 'Marketing emails', enabled: false },
  ]);

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
      });
    }

    // Try loading full profile from API
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const profile = response?.data || response;
        if (profile) {
          this.profileForm.patchValue({
            firstName: profile.firstName || user?.firstName || '',
            lastName: profile.lastName || user?.lastName || '',
            email: profile.email || user?.email || '',
            phone: profile.phone || user?.phone || '',
            gender: profile.gender || user?.gender || '',
            dateOfBirth: profile.dateOfBirth || user?.dateOfBirth || '',
            address: profile.address || user?.address || '',
            emergencyContactName: profile.emergencyContactName || '',
            emergencyContactPhone: profile.emergencyContactPhone || '',
          });
        }
      },
      error: (err) => console.log('Profile API not available, using local data')
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const data = this.profileForm.getRawValue();

    this.profileService.updateProfile(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.successMessage.set('Profile updated successfully!');
          setTimeout(() => this.successMessage.set(null), 3000);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Failed to update profile.');
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    
    const pw = this.passwordForm.value;
    if (pw.newPassword !== pw.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    this.profileService.changePassword({
      currentPassword: pw.currentPassword,
      newPassword: pw.newPassword,
      confirmPassword: pw.confirmPassword,
    }).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.successMessage.set('Password changed successfully!');
          this.passwordForm.reset();
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.message || 'Failed to change password.');
      }
    });
  }

  toggleNotification(index: number): void {
    this.notifications.update(n => n.map((item, i) => 
      i === index ? { ...item, enabled: !item.enabled } : item
    ));
  }

  deleteAccount(): void {
    if (confirm('Are you sure? This cannot be undone!')) {
      const userId = JSON.parse(localStorage.getItem('user') || '{}').userId;
      if (userId) {
        this.profileService.deleteAccount(userId).subscribe({
          next: () => { this.authService.logout(); },
          error: (e: any) => console.error('Error:', e)
        });
      }
    }
  }
  
}