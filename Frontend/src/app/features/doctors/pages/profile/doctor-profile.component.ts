import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../../core/services/doctor.service';
import { ReviewService } from '../../../../core/services/review.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './doctor-profile.component.html',
  styleUrls: ['./doctor-profile.component.scss']
})
export class DoctorProfileComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);

  doctor = signal<any>(null);
  reviews = signal<any[]>([]);
  ratingStats = signal<any>(null);
  availabilities = signal<any[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  // UI signals
  activeTab = signal<'about' | 'reviews' | 'availability'>('about');
  showAllReviews = signal(false);
  selectedDate = signal<string>('');
  selectedTime = signal<string | null>(null);
  morningSlots = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM'];
  afternoonSlots = ['1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM'];
  bookedSlots: string[] = []; // you can populate from appointments if needed

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadDoctor(id);
    } else {
      this.errorMessage.set('Doctor ID not found.');
      this.isLoading.set(false);
    }
  }

  loadDoctor(doctorId: string): void {
    this.isLoading.set(true);
    this.doctorService.getDoctorById(doctorId).subscribe({
      next: (response: any) => {
        console.log('Profile Response for ID ' + doctorId + ':', response);
        const doctor = response?.data || (response?.doctorId ? response : null);

        if (doctor && (doctor.doctorId || doctor.userId)) {
          // Map education and experience models to display strings if they are objects
          if (doctor.educations && Array.isArray(doctor.educations)) {
            doctor.education = doctor.educations.map((e: any) => `${e.degree} - ${e.institution}, ${new Date(e.graduationDate).getFullYear()}`);
          }
          if (doctor.experiences && Array.isArray(doctor.experiences)) {
            doctor.experienceList = doctor.experiences.map((ex: any) => `${ex.position} at ${ex.institution} (${new Date(ex.startDate).getFullYear()} - ${ex.endDate ? new Date(ex.endDate).getFullYear() : 'Present'})`);
          }
          this.doctor.set(doctor);
          this.isLoading.set(false);
          this.loadReviews(doctorId);
        } else {
          console.warn('Doctor data not found in response:', response);
          this.errorMessage.set('Doctor profile not found / የሀኪሙ መገለጫ አልተገኘም።');
          this.isLoading.set(false);
        }
      },
      error: (err) => {
        console.error('API Error loading doctor ' + doctorId + ':', err);
        this.errorMessage.set('Failed to connect to server. Please try again. / ከሰርቨር ጋር መገናኘት አልተቻለም።');
        this.isLoading.set(false);
      }
    });
  }

  loadReviews(doctorId: string): void {
    this.reviewService.getReviewsByDoctor(doctorId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.reviews.set(Array.isArray(data) ? data : []);
      },
      error: () => console.log('Reviews not available')
    });
    this.reviewService.getReviewStats(doctorId).subscribe({
      next: (response: any) => {
        this.ratingStats.set(response?.data || response);
      },
      error: () => console.log('Stats not available')
    });
  }

  loadAvailabilities(doctorId: string): void {
    this.doctorService.getDoctorAvailabilities(doctorId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.availabilities.set(Array.isArray(data) ? data : []);
      },
      error: () => console.log('Availabilities not available')
    });
  }

  // Mock fallback (if backend doesn't return a match)
  private getMockDoctor(): any {
    return {
      doctorId: '',
      firstName: 'Sarah',
      lastName: 'Johnson',
      specialties: ['Cardiology'],
      qualifications: 'MD, Board Certified in Cardiology, FACC',
      experience: 12,
      rating: 4.8,
      reviewCount: 124,
      patientCount: 2500,
      satisfaction: 97,
      onlineFee: 500,
      inPersonFee: 800,
      biography: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience…',
      languages: ['English', 'Amharic', 'Tigrinya'],
      education: [
        'MD - Addis Ababa University, 2012',
        'Fellowship - Black Lion Hospital, 2016'
      ],
      memberships: ['Ethiopian Medical Association', 'World Heart Federation'],
      awards: ['Best Cardiologist 2024', 'Patient Choice Award 2023'],
      clinic: {
        name: 'Addis Cardiac Center',
        address: 'Bole Road, Addis Ababa, Ethiopia',
        phone: '+251-111-234567',
        hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM'
      }
    };
  }

  // Helpers
  getStars(rating: number): string {
    return '★'.repeat(Math.floor(rating || 0));
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set(null);
  }

  selectTime(time: string): void {
    if (!this.bookedSlots.includes(time)) {
      this.selectedTime.set(time);
    }
  }

  isBooked(time: string): boolean {
    return this.bookedSlots.includes(time);
  }

  getRatingCount(star: number): number {
    if (!this.ratingStats()) return 0;
    const stats = this.ratingStats();
    switch (star) {
      case 5: return stats.fiveStarReviews || 0;
      case 4: return stats.fourStarReviews || 0;
      case 3: return stats.threeStarReviews || 0;
      case 2: return stats.twoStarReviews || 0;
      case 1: return stats.oneStarReviews || 0;
      default: return 0;
    }
  }

  getRatingPercentage(star: number): number {
    if (!this.ratingStats()) return 0;
    const total = this.ratingStats().totalReviews || 1;
    return (this.getRatingCount(star) / total) * 100;
  }
}