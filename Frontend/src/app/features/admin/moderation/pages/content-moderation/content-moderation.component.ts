import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-shield me-2"></i>Content Moderation</h4>

      <!-- Tabs -->
      <ul class="nav nav-pills mb-4">
        <li class="nav-item"><a class="nav-link active bg-primary" href="#">Blog Posts ({{ pendingPosts().length }})</a></li>
        <li class="nav-item"><a class="nav-link text-primary" href="#">Reviews ({{ pendingReviews().length }})</a></li>
        <li class="nav-item"><a class="nav-link text-primary" href="#">Flagged Content (2)</a></li>
      </ul>

      <div class="row g-4">
        <!-- Blog Posts -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header bg-white"><h5 class="text-primary mb-0"><i class="bi bi-file-text me-2"></i>Blog Posts Pending Review</h5></div>
            <div class="card-body">
              @for (post of pendingPosts(); track post.id) {
                <div class="border rounded p-3 mb-2">
                  <div class="d-flex justify-content-between">
                    <strong>{{ post.title }}</strong>
                    <span class="badge bg-warning-light text-warning-dark">Pending</span>
                  </div>
                  <small class="text-medium">By Dr. {{ post.author }} · {{ post.category }} · {{ post.date }}</small>
                  <p class="mt-2 text-medium">{{ post.preview }}</p>
                  <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm" (click)="approvePost(post.id)">Approve</button>
                    <button class="btn btn-outline-warning btn-sm">Request Edits</button>
                    <button class="btn btn-outline-danger btn-sm" (click)="rejectPost(post.id)">Reject</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Reviews -->
        <div class="col-lg-6">
          <div class="card">
            <div class="card-header bg-white"><h5 class="text-primary mb-0"><i class="bi bi-star me-2"></i>Reviews Pending Moderation</h5></div>
            <div class="card-body">
              @for (review of pendingReviews(); track review.id) {
                <div class="border rounded p-3 mb-2">
                  <div class="d-flex justify-content-between">
                    <div>
                      <strong>{{ review.patientName }}</strong>
                      <span class="text-warning ms-2">{{ '⭐'.repeat(review.rating) }}</span>
                    </div>
                    <small class="text-medium">{{ review.date }}</small>
                  </div>
                  <small class="text-medium">For Dr. {{ review.doctorName }}</small>
                  <p class="mt-2">{{ review.text }}</p>
                  <div class="d-flex gap-2">
                    <button class="btn btn-primary btn-sm">Approve</button>
                    <button class="btn btn-outline-danger btn-sm">Reject</button>
                    <button class="btn btn-outline-warning btn-sm">Flag</button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ContentModerationComponent {
  pendingPosts = signal([
    { id:'1', title:'Understanding Blood Pressure', author:'Sarah Johnson', category:'Health Tips', date:'May 10, 2026', preview:'A comprehensive guide to understanding blood pressure readings and what they mean for your health...' },
    { id:'2', title:'The Importance of Vaccination', author:'Yonas Tadesse', category:'Patient Education', date:'May 11, 2026', preview:'Vaccines save millions of lives each year. Here\'s why staying up to date is crucial...' },
  ]);

  pendingReviews = signal([
    { id:'1', patientName:'Abebe Tesfaye', doctorName:'Sarah Johnson', rating:5, date:'May 15, 2026', text:'Excellent doctor! Very thorough and professional. Highly recommended.' },
    { id:'2', patientName:'Sara Tadesse', doctorName:'Abebe Kebede', rating:2, date:'May 14, 2026', text:'Had to wait too long. Not satisfied with the consultation.' },
  ]);

  approvePost(id: string): void {
    this.pendingPosts.update(posts => posts.filter(p => p.id !== id));
  }

  rejectPost(id: string): void {
    this.pendingPosts.update(posts => posts.filter(p => p.id !== id));
  }
}