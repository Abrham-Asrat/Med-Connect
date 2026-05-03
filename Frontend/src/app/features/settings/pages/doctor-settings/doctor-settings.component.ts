import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
    selector: 'app-doctor-settings',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './doctor-settings.component.html',
    styleUrls: ['./doctor-settings.component.scss']
})
export class DoctorSettingsComponent implements OnInit {
    private authService = inject(AuthService);
    private profileService = inject(ProfileService);
    private fb = inject(FormBuilder);

    user = this.authService.currentUser;
    activeTab = signal('profile');
    isLoading = signal(false);
    successMessage = signal<string | null>(null);
    errorMessage = signal<string | null>(null);

    // Professional form
    professionalForm: FormGroup = this.fb.group({
        biography: ['', Validators.required],
        qualifications: ['', Validators.required],
        doctorStatus: ['Active', Validators.required],
        specialties: ['', Validators.required], // Comma separated string for simplicity in UI initially
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
                    this.professionalForm.patchValue({
                        biography: profile.biography || '',
                        qualifications: profile.qualifications || '',
                        doctorStatus: profile.doctorStatus || 'Active',
                        specialties: profile.specialties ? profile.specialties.join(', ') : '',
                    });

                    if (profile.availabilities && profile.availabilities.length > 0) {
                        profile.availabilities.forEach((avail: any) => {
                            this.addAvailability(avail.availableDay, avail.startTime, avail.endTime);
                        });
                    } else {
                        // Default blank one if nothing
                        this.addAvailability();
                    }
                }
            },
            error: () => this.isLoading.set(false)
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

    saveProfessionalProfile(): void {
        if (this.professionalForm.invalid) return;

        this.isLoading.set(true);
        this.successMessage.set(null);
        this.errorMessage.set(null);

        const values = this.professionalForm.value;
        const availValues = this.availabilitiesForm.getRawValue().availabilities;

        const data: any = {
            userId: this.user()?.userId || JSON.parse(localStorage.getItem('user') || '{}').userId,
            biography: values.biography,
            qualifications: values.qualifications,
            doctorStatus: values.doctorStatus,
            specialties: values.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0),
            availabilities: availValues
        };

        const submitData = () => {
            this.profileService.updateProfile(data).subscribe({
                next: (response: any) => {
                    this.isLoading.set(false);
                    if (response?.success) {
                        this.successMessage.set('Professional profile updated successfully!');
                        setTimeout(() => this.successMessage.set(null), 3000);
                    }
                },
                error: (error: any) => {
                    this.isLoading.set(false);
                    this.errorMessage.set(error?.error?.message || 'Failed to update professional profile.');
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
