import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-star me-2"></i>My Reviews</h4>

      <!-- Submit Review Card -->
      <div class="card mb-4">
        <div class="card-body text-center p-4">
          <h5 class="text-primary">Rate Your Recent Appointment</h5>
          <p class="text-medium">How was your visit with Dr. Sarah Johnson?</p>
          <div class="d-flex justify-content-center gap-1 mb-3" style="font-size:32px">
            @for (s of [1,2,3,4,5]; track s) {
              <i class="bi cursor-pointer" [class.bi-star-fill]="s <= rating()" [class.bi-star]="s > rating()"
                 [class.text-warning]="s <= rating()" [class.text-medium]="s > rating()"
                 (click)="rating.set(s)"></i>
            }
          </div>
          <textarea class="form-control mb-3" rows="3" placeholder="Share your experience..." [ngModel]="reviewText()" (ngModelChange)="reviewText.set($event)"></textarea>
          <button class="btn btn-primary" [disabled]="rating() === 0" (click)="submitReview()">
            @if (submitted()) { ✓ Submitted! } @else { Submit Review }
          </button>
        </div>
      </div>

      <!-- Past Reviews -->
      <h5 class="text-primary mb-3">Your Past Reviews</h5>
      @for (r of reviews(); track r.id) {
        <div class="card mb-2" style="border-left:4px solid #078930">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <strong>{{ r.doctor }}</strong>
                <span class="text-warning ms-2">{{ '⭐'.repeat(r.rating) }}</span>
              </div>
              <small class="text-medium">{{ r.date }}</small>
            </div>
            <p class="mb-0 mt-1">{{ r.text }}</p>
          </div>
        </div>
      }
    </div>
  `
})
export class ReviewsComponent {
  rating = signal(0);
  reviewText = signal('');
  submitted = signal(false);

  reviews = signal([
    { id:'1', doctor:'Dr. Abebe Kebede', rating:5, text:'Excellent neurologist! Very thorough and patient.', date:'Apr 28, 2026' },
    { id:'2', doctor:'Dr. Yonas Tadesse', rating:4, text:'Great with kids. My daughter felt very comfortable.', date:'Mar 15, 2026' },
  ]);

  submitReview(): void {
    this.submitted.set(true);
    setTimeout(() => this.submitted.set(false), 2000);
  }
}