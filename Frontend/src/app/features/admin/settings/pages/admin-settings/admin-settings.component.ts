import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../../../../core/auth/auth.service';


@Component({
    selector: 'app-admin-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
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

    activeTab = signal<'profile' | 'security' | 'system'>('profile');
    isLoading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Profile Logic
    profileForm = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
        phone: [''],
        address: ['']
    });

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
        // Fallback for Admin Profile
        setTimeout(() => {
            this.profileForm.patchValue({
                firstName: 'System',
                lastName: 'Administrator',
                email: 'admin@medconnect.com',
                phone: '+251 900 000000',
                address: 'Addis Ababa, Ethiopia'
            });
            this.isLoading.set(false);
        }, 500);
    }

    saveProfile(): void {
        if (this.profileForm.invalid) return;
        this.isLoading.set(true);
        // Simulate API call
        setTimeout(() => {
            this.successMessage.set('Profile updated successfully.');
            this.isLoading.set(false);
            this.clearMessageAfter(3000);
        }, 1000);
    }

    changePassword(): void {
        if (this.passwordForm.invalid) return;
        const newPassword = this.passwordForm.get('newPassword')?.value;
        const confirmPassword = this.passwordForm.get('confirmPassword')?.value;
        if (newPassword !== confirmPassword) {
            this.errorMessage.set('New passwords do not match!');
            this.clearMessageAfter(3000);
            return;
        }
        this.isLoading.set(true);
        setTimeout(() => {
            this.successMessage.set('Password successfully changed.');
            this.passwordForm.reset();
            this.isLoading.set(false);
            this.clearMessageAfter(3000);
        }, 1000);
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
