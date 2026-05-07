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

    // Dispatched to mock directly for telemedicine frontend workflow demonstration
    setTimeout(() => {
      const mockDoc = this.getMockDoctor();
      // Emulate dynamic behavior if looking up specific IDs
      if (doctorId === '00000000-0000-0000-0000-000000000002') {
        mockDoc.firstName = 'Abrham';
        mockDoc.lastName = 'Asrat';
        mockDoc.specialties = ['Cardiology'];
      }
      this.doctor.set(mockDoc);
      this.isLoading.set(false);
      this.loadReviews(doctorId);
    }, 500);
  }

  loadReviews(doctorId: string): void {
    // Generate dummy reviews populated from the Telemedicine Chat Workflow
    setTimeout(() => {
      this.ratingStats.set({
        averageRating: 4.8,
        totalReviews: 24,
        fiveStarReviews: 18,
        fourStarReviews: 5,
        threeStarReviews: 1,
        twoStarReviews: 0,
        oneStarReviews: 0
      });

      this.reviews.set([
        {
          id: 'rev1',
          starRating: 5,
          reviewText: 'Dr. Abrham was very helpful and professional. Reassured me regarding my chest pains via the telemedicine chat.',
          createdAt: new Date().toISOString(),
          helpfulCount: 12,
          patient: { firstName: 'Abebe', lastName: 'Tesfaye', profilePicture: null }
        },
        {
          id: 'rev2',
          starRating: 5,
          reviewText: 'Excellent service. The telemedicine chat allowed me to get my prescription renewed instantly without leaving my house.',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          helpfulCount: 5,
          patient: { firstName: 'Meron', lastName: 'Haile', profilePicture: null }
        },
        {
          id: 'rev3',
          starRating: 4,
          reviewText: 'Great doctor, minor wait time to get the consultation started but the medical advice was spot on.',
          createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          helpfulCount: 2,
          patient: { firstName: 'Samuel', lastName: 'G.', profilePicture: null }
        }
      ]);
    }, 500);
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