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
  styleUrls: ['./settings.component.scss']
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
    gender: ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    address: ['', Validators.required],
    emergencyContactName: [''],
    emergencyContactPhone: [''],
  });

  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);

  // Password form
  passwordForm: FormGroup = this.fb.group({
    currentPassword: ['', Validators.required],
    newPassword: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    ]],
    confirmPassword: ['', Validators.required],
  });

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  // Notification prefs — persisted in localStorage
  notifications = signal([
    { key: 'appointment_reminders', label: 'Appointment reminders / የቀጠሮ ማሳሰቢያዎች', enabled: true },
    { key: 'new_messages',          label: 'New messages / አዳዲስ መልዕክቶች',           enabled: true },
    { key: 'payment_receipts',      label: 'Payment receipts / የክፍያ ደረሰኞች',        enabled: true },
    { key: 'review_requests',       label: 'Review requests / የግምገማ ጥያቄዎች',       enabled: true },
    { key: 'marketing_emails',      label: 'Marketing emails / የማስተዋወቂያ ኢሜይሎች',  enabled: false },
  ]);

  // Help Center FAQs
  faqs = signal([
    {
      question: 'How do I schedule a new appointment? / ቀጠሮ እንዴት መያዝ እችላለሁ?',
      answer: 'Go to the "Doctors" section, find your preferred doctor, select an available time slot, and confirm your booking.',
      open: false
    },
    {
      question: 'Can I cancel or reschedule an appointment? / ቀጠሮ መቀየር ወይም መሰረዝ እችላለሁ?',
      answer: 'Yes, you can manage your appointments from the dashboard. Cancellations must be made at least 24 hours in advance.',
      open: false
    },
    {
      question: 'How do I pay for my consultation? / ለምክክር አገልግሎት እንዴት እከፍላለሁ?',
      answer: 'We support various payment methods including TeleBirr, Chapa, and Bank Transfers. You can pay directly after booking.',
      open: false
    },
    {
      question: 'Is my medical history private? / የጤና ታሪኬ ሚስጥራዊነቱ የተጠበቀ ነው?',
      answer: 'Absolutely. We use industry-standard encryption to ensure your data is only accessible by you and authorized medical professionals.',
      open: false
    }
  ]);

  toggleFaq(index: number): void {
    this.faqs.update(f => f.map((item, i) =>
      i === index ? { ...item, open: !item.open } : item
    ));
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadNotificationPrefs();
  }

  loadNotificationPrefs(): void {
    try {
      const saved = localStorage.getItem('notificationPrefs');
      if (saved) {
        const prefs: Record<string, boolean> = JSON.parse(saved);
        this.notifications.update(n => n.map(item => ({
          ...item,
          enabled: prefs[item.key] !== undefined ? prefs[item.key] : item.enabled
        })));
      }
    } catch { /* ignore */ }
  }

  saveNotificationPrefs(): void {
    const prefs: Record<string, boolean> = {};
    this.notifications().forEach(n => { prefs[n.key] = n.enabled; });
    localStorage.setItem('notificationPrefs', JSON.stringify(prefs));
    this.successMessage.set('Notification preferences saved!');
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  loadProfile(): void {
    // Always fetch fresh data from the API as the source of truth
    this.profileService.getProfile().subscribe({
      next: (response: any) => {
        const profile = response?.data || response;
        if (profile) {
          this.profileForm.patchValue({
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            gender: profile.gender || '',
            dateOfBirth: profile.dateOfBirth || '',
            address: profile.address || '',
            emergencyContactName: profile.emergencyContactName || '',
            emergencyContactPhone: profile.emergencyContactPhone || '',
          });
          if (profile.profilePicture && profile.profilePicture.trim() !== '') {
            const pic = profile.profilePicture;
            this.previewUrl.set(pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`);
          } else {
            this.previewUrl.set(null);
          }
          // Sync the fresh server data into the local session so it persists on refresh
          this.authService.updateUser(profile);
        }
      },
      error: () => {
        // Fallback to cached session data if API is unavailable
        const user = this.user();
        if (user) {
          this.profileForm.patchValue({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: (user as any).phone || '',
            gender: (user as any).gender || '',
            dateOfBirth: (user as any).dateOfBirth || '',
            address: (user as any).address || '',
          });
          if ((user as any).profilePicture) {
            const pic = (user as any).profilePicture;
            this.previewUrl.set(pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`);
          }
        }
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl.set(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadPicture(): void {
    if (!this.selectedFile) return;

    this.isLoading.set(true);
    this.profileService.uploadProfilePicture(this.selectedFile).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set('Profile picture updated!');

        // Update user session
        if (res?.data?.profilePicture) {
          this.authService.updateUser({ profilePicture: res.data.profilePicture });
        }

        setTimeout(() => this.successMessage.set(null), 3000);
        this.selectedFile = null;
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to upload picture.');
      }
    });
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.errorMessage.set('Please fill all required fields correctly.');
      return;
    }

    this.isLoading.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const data = this.profileForm.getRawValue();
    const user = this.user();
    data.userId = user?.userId || JSON.parse(localStorage.getItem('user') || '{}').userId;

    this.profileService.updateProfile(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        this.successMessage.set('Profile updated successfully!');

        // Sync the full returned profile into the session so it persists on refresh
        const updatedProfile = response?.data || response;
        if (updatedProfile) {
          this.authService.updateUser(updatedProfile);
          // Re-patch the form with the confirmed server values
          this.profileForm.patchValue({
            firstName: updatedProfile.firstName || '',
            lastName: updatedProfile.lastName || '',
            email: updatedProfile.email || '',
            phone: updatedProfile.phone || '',
            gender: updatedProfile.gender || '',
            dateOfBirth: updatedProfile.dateOfBirth || '',
            address: updatedProfile.address || '',
            emergencyContactName: updatedProfile.emergencyContactName || '',
            emergencyContactPhone: updatedProfile.emergencyContactPhone || '',
          });
        }

        setTimeout(() => this.successMessage.set(null), 3000);
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