import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/auth.service';
import { ProfileService } from '../../../../../core/services/profile.service';
import { ThemeToggleComponent } from '../../../../../shared/components/theme-toggle/theme-toggle.component';


@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeToggleComponent],
    templateUrl: './admin-settings.component.html',
    styles: [`
    .settings-nav .nav-link {
       color: #6c757d;
       border-radius: 0.5rem;
       padding: 0.75rem 1.25rem;
       font-weight: 500;
       transition: all 0.2s;
    }
    .settings-nav .nav-link:hover {
       background-color: #f8f9fa;
       color: #0d6efd;
    }
    .settings-nav .nav-link.active {
       background-color: #0d6efd;
       color: white;
       box-shadow: 0 4px 10px rgba(13,110,253,0.2);
    }
    .avatar-upload {
       position: relative;
       width: 120px;
       height: 120px;
       border-radius: 50%;
       overflow: hidden;
       border: 3px solid #fff;
       box-shadow: 0 4px 15px rgba(0,0,0,0.1);
       cursor: pointer;
    }
    .avatar-upload:hover .avatar-overlay {
       opacity: 1;
    }
    .avatar-overlay {
       position: absolute;
       top: 0; left: 0; right: 0; bottom: 0;
       background: rgba(0,0,0,0.5);
       display: flex;
       align-items: center;
       justify-content: center;
       opacity: 0;
       transition: 0.2s ease-in-out;
       color: white;
    }
    .form-switch .form-check-input {
      width: 2.5em;
      height: 1.25em;
      cursor: pointer;
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private profileService = inject(ProfileService);

    user = this.authService.currentUser;
    activeTab = signal<'profile' | 'security' | 'system'>('profile');
    isLoading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Profile Logic
    profileForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        phone: ['', Validators.required],
        gender: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        address: ['', Validators.required]
    });

    selectedFile: File | null = null;
    previewUrl = signal<string | null>(null);

    // Security / Password Logic
    passwordForm = this.fb.group({
        currentPassword: ['', Validators.required],
        newPassword: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required]
    });

    // System Defaults (Mock)
    systemSettings = {
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true,
        maxUploadSize: 10,
        twoFactorAuth: false
    };

    ngOnInit(): void {
        this.loadAdminProfile();
    }

    loadAdminProfile(): void {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (response: any) => {
                this.isLoading.set(false);
                const profile = response?.data || response;
                if (profile) {
                    this.profileForm.patchValue({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        gender: profile.gender || '',
                        dateOfBirth: profile.dateOfBirth || '',
                        address: profile.address || ''
                    });

                    if (profile.profilePicture && profile.profilePicture.trim() !== '') {
                        const pic = profile.profilePicture;
                        this.previewUrl.set(pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`);
                    } else {
                        this.previewUrl.set(null);
                    }
                }
            },
            error: (err) => {
                this.isLoading.set(false);
                console.error('Failed to load admin profile', err);
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

                // Update session
                if (res?.data?.profilePicture) {
                    this.authService.updateUser({ profilePicture: res.data.profilePicture });
                }

                this.selectedFile = null;
                this.clearMessageAfter(3000);
            },
            error: (err) => {
                this.isLoading.set(false);
                this.errorMessage.set('Failed to upload picture.');
                this.clearMessageAfter(3000);
            }
        });
    }

    saveProfile(): void {
        if (this.profileForm.invalid) return;
        this.isLoading.set(true);
        this.successMessage.set(null);
        this.errorMessage.set(null);

        const profileData = this.profileForm.getRawValue();
        const data = {
            ...profileData,
            userId: this.user()?.userId || JSON.parse(localStorage.getItem('user') || '{}').userId
        };

        this.profileService.updateProfile(data).subscribe({
            next: (response: any) => {
                this.isLoading.set(false);
                if (response?.success) {
                    this.successMessage.set('Profile updated successfully.');

                    // Sync with session using returned profile
                    const updatedProfile = response?.data || response;
                    if (updatedProfile) {
                        this.authService.updateUser(updatedProfile);
                    }

                    this.clearMessageAfter(3000);
                }
            },
            error: (error: any) => {
                this.isLoading.set(false);
                this.errorMessage.set(error?.error?.message || 'Failed to update profile.');
                this.clearMessageAfter(3000);
            }
        });
    }

    changePassword(): void {
        if (this.passwordForm.invalid) return;
        const pw = this.passwordForm.value;
        if (pw.newPassword !== pw.confirmPassword) {
            this.errorMessage.set('New passwords do not match!');
            this.clearMessageAfter(3000);
            return;
        }

        this.isLoading.set(true);
        this.profileService.changePassword({
            currentPassword: pw.currentPassword!,
            newPassword: pw.newPassword!,
            confirmPassword: pw.confirmPassword!
        }).subscribe({
            next: (response: any) => {
                this.isLoading.set(false);
                if (response?.success) {
                    this.successMessage.set('Password successfully changed.');
                    this.passwordForm.reset();
                    this.clearMessageAfter(3000);
                }
            },
            error: (error: any) => {
                this.isLoading.set(false);
                this.errorMessage.set(error?.error?.message || 'Failed to change password.');
                this.clearMessageAfter(3000);
            }
        });
    }

    saveSystemSettings(): void {
        this.isLoading.set(true);
        setTimeout(() => {
            this.successMessage.set('System configuration saved. Settings will propagate shortly.');
            this.isLoading.set(false);
            this.clearMessageAfter(3000);
        }, 1000);
    }

    setTab(tab: 'profile' | 'security' | 'system'): void {
        this.activeTab.set(tab);
        this.successMessage.set(null);
        this.errorMessage.set(null);
    }

    private clearMessageAfter(ms: number) {
        setTimeout(() => {
            this.successMessage.set(null);
            this.errorMessage.set(null);
        }, ms);
    }
}
