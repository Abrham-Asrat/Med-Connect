import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ThemeToggleComponent } from '../../../../shared/components/theme-toggle/theme-toggle.component';

@Component({
    selector: 'app-doctor-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, ThemeToggleComponent],
    templateUrl: './doctor-settings.component.html',
    styleUrls: ['./doctor-settings.component.scss']
})
export class DoctorSettingsComponent implements OnInit {
    private authService = inject(AuthService);
    private profileService = inject(ProfileService);
    private fb = inject(FormBuilder);
    private sanitizer = inject(DomSanitizer);

    user = this.authService.currentUser;
    activeTab = signal('personal');
    isLoading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Personal form
    personalForm: FormGroup = this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: [{ value: '', disabled: true }],
        phone: ['', Validators.required],
        gender: ['', Validators.required],
        dateOfBirth: ['', Validators.required],
        address: ['', Validators.required],
    });

    selectedFile: File | null = null;
    previewUrl = signal<string | null>(null);

    private clearMessageAfter(ms: number) {
        setTimeout(() => {
            this.successMessage.set(null);
            this.errorMessage.set(null);
        }, ms);
    }

    // Professional form
    professionalForm: FormGroup = this.fb.group({
        biography: ['', Validators.required],
        qualifications: ['', Validators.required],
        doctorStatus: ['Active', Validators.required],
        specialties: ['', Validators.required], // Comma separated string for simplicity in UI initially
    });

    // Clinic / appointment preferences form
    preferencesForm: FormGroup = this.fb.group({
        acceptsOnline: [true],
        acceptsInPerson: [true],
        clinicName: [''],
        clinicAddress: [''],
        clinicCity: [''],
        onlineAppointmentFee: [500, [Validators.required, Validators.min(0)]],
        inPersonAppointmentFee: [800, [Validators.required, Validators.min(0)]],
    });

    // Availabilities block
    availabilitiesForm: FormGroup = this.fb.group({
        availabilities: this.fb.array([])
    });

    daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    cvFile = signal<File | null>(null);

    ngOnInit(): void {
        this.loadProfile();
    }

    loadProfile(): void {
        this.isLoading.set(true);
        this.profileService.getProfile().subscribe({
            next: (response: any) => {
                this.isLoading.set(false);
                const profile = response?.data || response;
                if (profile) {
                    this.personalForm.patchValue({
                        firstName: profile.firstName || '',
                        lastName: profile.lastName || '',
                        email: profile.email || '',
                        phone: profile.phone || '',
                        gender: profile.gender || '',
                        dateOfBirth: profile.dateOfBirth || '',
                        address: profile.address || '',
                    });

                    if (profile.profilePicture && profile.profilePicture.trim() !== '') {
                        const pic = profile.profilePicture;
                        this.previewUrl.set(pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`);
                    } else {
                        this.previewUrl.set(null);
                    }

                    this.professionalForm.patchValue({
                        biography: profile.biography || '',
                        qualifications: profile.qualifications || '',
                        doctorStatus: profile.doctorStatus || 'Active',
                        specialties: profile.specialties ? profile.specialties.join(', ') : '',
                    });

                    this.preferencesForm.patchValue({
                        acceptsOnline: profile.acceptsOnline !== false,
                        acceptsInPerson: profile.acceptsInPerson !== false,
                        clinicName: profile.clinicName || '',
                        clinicAddress: profile.clinicAddress || '',
                        clinicCity: profile.clinicCity || '',
                        onlineAppointmentFee: profile.onlineAppointmentFee ?? 500,
                        inPersonAppointmentFee: profile.inPersonAppointmentFee ?? 800,
                    });

                    // Clear and reload availabilities
                    while (this.availabilities.length !== 0) {
                        this.availabilities.removeAt(0);
                    }

                    if (profile.availabilities && profile.availabilities.length > 0) {
                        profile.availabilities.forEach((avail: any) => {
                            this.addAvailability(avail.availableDay, avail.startTime, avail.endTime);
                        });
                    } else {
                        this.addAvailability();
                    }

                    // Sync fresh server data into the local session so it persists on refresh
                    this.authService.updateUser(profile);
                }
            },
            error: () => this.isLoading.set(false)
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
            }
        });
    }

    get availabilities() {
        return this.availabilitiesForm.get('availabilities') as FormArray;
    }

    addAvailability(day: string = '', start: string = '09:00', end: string = '17:00'): void {
        this.availabilities.push(this.fb.group({
            availableDay: [day, Validators.required],
            startTime: [start, Validators.required],
            endTime: [end, Validators.required]
        }));
    }

    removeAvailability(index: number): void {
        if (this.availabilities.length > 1) {
            this.availabilities.removeAt(index);
        }
    }

    onCvSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            this.cvFile.set(file);
        }
    }

    /** Returns a sanitized Google Maps embed URL built from the current clinic form values. */
    getClinicMapEmbedUrl(): SafeResourceUrl | null {
        const f = this.preferencesForm.value;
        const parts = [f.clinicName, f.clinicAddress, f.clinicCity]
            .filter((s: string) => s && s.trim());
        if (!parts.length) return null;
        const q = encodeURIComponent(parts.join(', '));
        return this.sanitizer.bypassSecurityTrustResourceUrl(
            `https://maps.google.com/maps?q=${q}&output=embed&z=15`
        );
    }

    /** Returns a Google Maps search link for the current clinic address. */
    getClinicMapsLink(): string {
        const f = this.preferencesForm.value;
        const parts = [f.clinicName, f.clinicAddress, f.clinicCity]
            .filter((s: string) => s && s.trim());
        if (!parts.length) return '';
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts.join(', '))}`;
    }

    saveProfile(): void {
        const form = this.activeTab() === 'personal' ? this.personalForm
            : this.activeTab() === 'preferences' ? this.preferencesForm
                : this.professionalForm;
        if (form.invalid) {
            this.errorMessage.set('Please fill all required fields correctly.');
            return;
        }

        this.isLoading.set(true);
        this.successMessage.set(null);
        this.errorMessage.set(null);

        const personalData = this.personalForm.getRawValue();
        const prefData = this.preferencesForm.value;
        const values = {
            ...personalData,
            ...this.professionalForm.value,
            ...prefData,
            availabilities: this.availabilitiesForm.getRawValue().availabilities
        };

        const data: any = {
            ...values,
            userId: this.user()?.userId || JSON.parse(localStorage.getItem('user') || '{}').userId,
            specialties: values.specialties ? values.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : []
        };

        const submitData = () => {
            this.profileService.updateProfile(data).subscribe({
                next: (response: any) => {
                    this.isLoading.set(false);
                    if (response?.success) {
                        this.successMessage.set('Profile updated successfully.');

                        // Sync with session using returned profile
                        const updatedProfile = response?.data || response;
                        if (updatedProfile) {
                            this.authService.updateUser(updatedProfile);

                            // Re-patch forms with confirmed server values
                            this.personalForm.patchValue({
                                firstName: updatedProfile.firstName || '',
                                lastName: updatedProfile.lastName || '',
                                email: updatedProfile.email || '',
                                phone: updatedProfile.phone || '',
                                gender: updatedProfile.gender || '',
                                dateOfBirth: updatedProfile.dateOfBirth || '',
                                address: updatedProfile.address || '',
                            });
                            this.professionalForm.patchValue({
                                biography: updatedProfile.biography || '',
                                qualifications: updatedProfile.qualifications || '',
                                doctorStatus: updatedProfile.doctorStatus || 'Active',
                                specialties: updatedProfile.specialties ? updatedProfile.specialties.join(', ') : '',
                            });
                            if (updatedProfile.profilePicture && updatedProfile.profilePicture.trim() !== '') {
                                const pic = updatedProfile.profilePicture;
                                this.previewUrl.set(pic.startsWith('data:') || pic.startsWith('http') ? pic : `data:image/png;base64,${pic}`);
                            }
                        }

                        this.clearMessageAfter(3000);
                    }
                },
                error: (error: any) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(error?.error?.message || 'Failed to update profile.');
                }
            });
        };

        const file = this.cvFile();
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                data.cv = {
                    fileName: file.name,
                    mimeType: file.type || 'application/pdf',
                    fileDataBase64: base64String
                };
                submitData();
            };
            reader.readAsDataURL(file);
        } else {
            submitData();
        }
    }
}
