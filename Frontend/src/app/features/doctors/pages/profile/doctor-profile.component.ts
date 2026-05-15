import { Component, signal, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DoctorService } from '../../../../core/services/doctor.service';
import { ReviewService } from '../../../../core/services/review.service';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

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
  private sanitizer = inject(DomSanitizer);
  private cdr = inject(ChangeDetectorRef);

  likeReview(review: any) {
    if (!review.reviewId && !review.id) return;
    const rid = review.reviewId || review.id;
    this.reviewService.markAsHelpful(rid).subscribe({
      next: (res) => {
        if (res.success) {
          review.helpfulCount = res.data.helpfulCount;
        }
      }
    });
  }

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
      next: (res: any) => {
        const doctor = res?.data || res;
        if (doctor) {
          // Normalize fields from backend DoctorProfileDto
          const normalized = {
            ...doctor,
            isVerified: doctor.isVerified,
            experience: doctor.experienceYears || doctor.experience || 0,
            patientCount: doctor.patientCount || 0,
            satisfaction: doctor.rating ? Math.round((doctor.rating / 5) * 100) : 100,
            onlineFee: doctor.onlineAppointmentFee ?? doctor.onlineFee ?? 500,
            inPersonFee: doctor.inPersonAppointmentFee ?? doctor.inPersonFee ?? 800,
            acceptsOnline: doctor.acceptsOnline !== false,
            acceptsInPerson: doctor.acceptsInPerson !== false,
            clinic: {
              name: doctor.clinicName || null,
              address: doctor.clinicAddress || null,
              city: doctor.clinicCity || null,
            },
            specialties: Array.isArray(doctor.specialties)
              ? doctor.specialties.map((s: any) => typeof s === 'string' ? s : s.name || s.specialtyName || '')
              : [],
            // Mapping education/experience lists
            education: (doctor.educations || []).map((e: any) => `${e.degree} - ${e.institution} (${new Date(e.graduationDate).getFullYear()})`),
            experienceList: (doctor.experiences || []).map((e: any) => `${e.position} at ${e.institution} (${new Date(e.startDate).getFullYear()} - ${e.endDate ? new Date(e.endDate).getFullYear() : 'Present'})`)
          };
          this.doctor.set(normalized);
        }
        this.isLoading.set(false);
        this.loadReviews(doctorId);
        this.loadAvailabilities(doctorId);
      },
      error: () => {
        // Fallback to mock if API fails
        this.doctor.set(this.getMockDoctor());
        this.isLoading.set(false);
        this.loadReviews(doctorId);
      }
    });
  }

  loadReviews(doctorId: string): void {
    // 1. Get stats
    this.reviewService.getReviewStats(doctorId).subscribe({
      next: (res: any) => {
        const stats = res?.data || res;
        if (stats) {
          this.ratingStats.set(stats);
        }
      },
      error: (err) => console.error('Error fetching review stats:', err)
    });

    // 2. Get review list
    this.reviewService.getReviewsByDoctor(doctorId).subscribe({
      next: (res: any) => {
        const list = res?.data || res || [];
        this.reviews.set(Array.isArray(list) ? list : []);
      },
      error: (err) => console.error('Error fetching reviews:', err)
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

  /** Builds a Google Maps embed src from clinic address fields. */
  getClinicMapEmbedUrl(): SafeResourceUrl | null {
    const d = this.doctor();
    const parts = [d?.clinic?.name, d?.clinic?.address, d?.clinic?.city]
      .filter(Boolean).join(', ');
    if (!parts) return null;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(parts)}&output=embed&z=15`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  /** Builds a Google Maps search link that opens in a new tab. */
  getClinicMapsLink(): string {
    const d = this.doctor();
    const parts = [d?.clinic?.name, d?.clinic?.address, d?.clinic?.city]
      .filter(Boolean).join(', ');
    if (!parts) return '';
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parts)}`;
  }
}