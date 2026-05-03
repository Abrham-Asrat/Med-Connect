import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReviewService } from '../../../../core/services/review.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-star me-2"></i>My Reviews / የእኔ ግምገማዎች</h4>

      <!-- Submit Review Card -->
    @if (completedDoctors().length > 0) {
      <div class="card mb-4">
        <div class="card-body p-4">
          <h5 class="text-primary text-center mb-3">Rate a Recent Doctor / የቅርብ ጊዜ ሀኪምዎን ይገምግሙ</h5>
          
          <div class="mb-3 mx-auto" style="max-width: 400px;">
             <!-- Allow selecting a doctor from completed appointments -->
             <select class="form-select mb-3" [(ngModel)]="selectedDoctorId" (change)="checkIfReviewed()">
                <option value="">Select a Doctor to Review...</option>
                @for (doc of completedDoctors(); track doc.doctorId) {
                    <option [value]="doc.doctorId">Dr. {{ doc.doctorName }}</option>
                }
             </select>
          </div>

          @if (selectedDoctorId) {
              @if (alreadyReviewed()) {
                 <div class="alert alert-info text-center mx-auto" style="max-width: 400px;">
                    You have already reviewed this doctor.
                 </div>
              } @else {
                 <div class="text-center">
                   <div class="d-flex justify-content-center gap-1 mb-3" style="font-size:32px">
                     @for (s of [1,2,3,4,5]; track s) {
                       <i class="bi cursor-pointer" [class.bi-star-fill]="s <= rating()" [class.bi-star]="s > rating()"
                          [class.text-warning]="s <= rating()" [class.text-medium]="s > rating()"
                          (click)="rating.set(s)"></i>
                     }
                   </div>
                   <textarea class="form-control mb-3 mx-auto" style="max-width: 500px;" rows="3" placeholder="Share your experience... / ተሞክሮዎን ያካፍሉ..." [(ngModel)]="reviewText"></textarea>
                   <button class="btn btn-primary" [disabled]="rating() === 0 || isSubmitting() || !reviewText.trim()" (click)="submitReview()">
                     <i class="bi bi-send me-1"></i> {{ isSubmitting() ? 'Submitting...' : 'Submit Review' }}
                   </button>
                 </div>
              }
          }
        </div>
      </div>
      }

      <!-- Past Reviews -->
      <h5 class="text-primary mb-3 mt-5">Your Past Reviews / ያለፉት ግምገማዎችዎ</h5>
      @if (isLoading()) {
          <div class="text-center py-4"><div class="spinner-border text-primary"></div></div>
      } @else if (reviews().length === 0) {
          <p class="text-muted fst-italic">You have no past reviews.</p>
      } @else {
          @for (r of reviews(); track r.id || $index) {
            <div class="card mb-3 review-card" style="border-left:4px solid #078930">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <strong>Dr. {{ r.doctor?.firstName }} {{ r.doctor?.lastName }}</strong>
                    <span class="text-warning ms-2">{{ getStars(r.starRating) }}</span>
                  </div>
                  <small class="text-medium">{{ r.createdAt | date:'mediumDate' }}</small>
                </div>
                <p class="mb-0 mt-1">{{ r.reviewText }}</p>
              </div>
            </div>
          }
      }
    </div>
  `,
  styles: [`
    .card {
      border: none;
      border-radius: 1rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.03);
      animation: fadeUp 0.5s ease backwards;
    }
    .review-card {
      transition: all 0.3s ease;
    }
    .review-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 30px rgba(7, 137, 48, 0.1);
    }
    .cursor-pointer { cursor: pointer; transition: transform 0.2s; }
    .cursor-pointer:hover { transform: scale(1.2); }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class ReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);

  rating = signal(0);
  reviewText = '';
  isSubmitting = signal(false);
  isLoading = signal(true);

  reviews = signal<any[]>([]);
  completedDoctors = signal<any[]>([]);

  selectedDoctorId = '';
  alreadyReviewed = signal(false);

  ngOnInit(): void {
    this.loadPatientReviews();
    this.loadCompletedAppointmentsForReview();
  }

  loadPatientReviews(): void {
    const patientId = this.authService.currentUser()?.userId || localStorage.getItem('patientId');
    if (!patientId) { this.isLoading.set(false); return; }

    this.reviewService.getPatientReviews(patientId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.reviews.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  loadCompletedAppointmentsForReview(): void {
    const patientId = this.authService.currentUser()?.userId || localStorage.getItem('patientId');
    if (!patientId) return;

    this.appointmentService.getPatientAppointments(patientId).subscribe({
      next: (response: any) => {
        const apps = response?.data || [];
        // Extract unique doctors from completed appointments
        const completed = (Array.isArray(apps) ? apps : []).filter(a => a.status === 'Completed');
        const uniqueDocs = new Map();
        completed.forEach(a => {
          if (!uniqueDocs.has(a.doctorId)) uniqueDocs.set(a.doctorId, { doctorId: a.doctorId, doctorName: a.doctorName });
        });
        this.completedDoctors.set(Array.from(uniqueDocs.values()));
      }
    });
  }

  checkIfReviewed(): void {
    if (!this.selectedDoctorId) return;
    const patientId = this.authService.currentUser()?.userId || localStorage.getItem('patientId');
    if (!patientId) return;

    this.reviewService.checkIfPatientReviewedDoctor(patientId, this.selectedDoctorId).subscribe({
      next: (res: any) => {
        this.alreadyReviewed.set(res?.data === true || res === true);
      }
    });
  }

  submitReview(): void {
    const patientId = this.authService.currentUser()?.userId || localStorage.getItem('patientId');
    if (!patientId || !this.selectedDoctorId) return;

    this.isSubmitting.set(true);

    // Construct DTO
    const reviewData = {
      patientId: patientId,
      doctorId: this.selectedDoctorId,
      starRating: this.rating(),
      reviewText: this.reviewText
    };

    this.reviewService.postReview(reviewData).subscribe({
      next: () => {
        this.reviewText = '';
        this.rating.set(0);
        this.selectedDoctorId = '';
        this.isSubmitting.set(false);
        this.loadPatientReviews(); // Refresh list
        alert('Review Submitted Successfully!');
      },
      error: (err) => {
        console.error('Failed to post review', err);
        this.isSubmitting.set(false);
        alert(err?.error?.message || 'Failed to submit review');
      }
    });
  }

  getStars(rating: number): string {
    return '⭐'.repeat(Math.floor(rating || 0));
  }
}