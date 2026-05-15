import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../../core/services/blog.service';
import { AdminService } from '../../../../../core/services/admin.service';

@Component({
  selector: 'app-content-moderation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-flag me-2"></i>Flagged Content</h4>

      @if (successMessage()) { <div class="alert alert-success"><i class="bi bi-check-circle-fill me-2"></i>{{ successMessage() }}</div> }

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-4"><div class="card text-center p-3" style="border-left:4px solid #DA121A"><h3 class="text-danger mb-0">{{ flaggedItems().length }}</h3><small class="text-medium">Flagged Items</small></div></div>
        <div class="col-4"><div class="card text-center p-3" style="border-left:4px solid #FCD116"><h3 class="text-warning-dark mb-0">{{ pendingReview() }}</h3><small class="text-medium">Pending Review</small></div></div>
        <div class="col-4"><div class="card text-center p-3" style="border-left:4px solid #078930"><h3 class="text-primary mb-0">{{ resolvedToday() }}</h3><small class="text-medium">Resolved Today</small></div></div>
      </div>

      @if (isLoading()) { <div class="text-center py-4"><div class="spinner-border text-primary"></div></div> }

      <!-- Info Alert -->
      <div class="alert alert-info d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-info-circle-fill fs-5"></i>
        <div>
          <strong>How moderation works:</strong><br>
          <small>Content is published immediately. Only flagged items appear here for review. 
          Blog posts by verified doctors and patient reviews are trusted by default.</small>
        </div>
      </div>

      <!-- Flagged Items -->
      @for (item of flaggedItems(); track item.id) {
        <div class="card mb-3" style="border-left:4px solid #DA121A">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <span class="badge me-2" [class.bg-danger]="item.type==='blog'" [class.bg-warning]="item.type==='review'" [class.text-white]="item.type==='blog'" [class.text-dark]="item.type==='review'">{{ item.type === 'blog' ? 'Blog Post' : 'Review' }}</span>
                <span class="badge bg-light text-dark">{{ item.flagReason }}</span>
              </div>
              <small class="text-medium">{{ item.flaggedAt | date:'medium' }}</small>
            </div>

            <div class="bg-light rounded p-3 mb-3">
              @if (item.type === 'blog') {
                <h6>{{ item.title }}</h6>
                <small class="text-medium">By Dr. {{ item.authorName }}</small>
                <p class="mt-2 text-medium">{{ item.content?.substring(0, 200) }}...</p>
              }
              @if (item.type === 'review') {
                <div class="d-flex align-items-center gap-2 mb-1">
                  <strong>{{ item.patientName }}</strong>
                  <span class="text-warning">{{ '⭐'.repeat(item.rating || 0) }}</span>
                </div>
                <small class="text-medium">For Dr. {{ item.doctorName }}</small>
                <p class="mt-2">{{ item.text }}</p>
              }
            </div>

            <div class="bg-light rounded p-2 mb-3">
              <small class="text-danger"><i class="bi bi-flag-fill me-1"></i><strong>Flagged by:</strong> {{ item.flaggedBy || 'User' }}</small><br>
              <small class="text-medium"><strong>Reason:</strong> {{ item.flagReason }}</small>
            </div>

            <div class="d-flex gap-2">
              <button class="btn btn-danger btn-sm" (click)="removeContent(item)">
                <i class="bi bi-trash me-1"></i>Remove Content
              </button>
              <button class="btn btn-outline-success btn-sm" (click)="dismissFlag(item)">
                <i class="bi bi-check-lg me-1"></i>Dismiss Flag
              </button>
              @if (item.type === 'blog') {
                <button class="btn btn-outline-primary btn-sm" (click)="viewContent(item)">
                  <i class="bi bi-eye me-1"></i>View Full
                </button>
              }
            </div>
          </div>
        </div>
      }

      @if (!isLoading() && flaggedItems().length === 0) {
        <div class="text-center py-5">
          <i class="bi bi-flag text-primary" style="font-size:48px;opacity:0.3"></i>
          <h5 class="text-medium mt-3">No Flagged Content</h5>
          <p class="text-medium">Everything looks good! Flagged content will appear here.</p>
        </div>
      }
    </div>
  `
})
export class ContentModerationComponent implements OnInit {
  private adminService = inject(AdminService);
  private blogService = inject(BlogService);

  isLoading = signal(false);
  successMessage = signal<string | null>(null);
  flaggedItems = signal<any[]>([]);
  pendingReview = signal(0);
  resolvedToday = signal(0);

  ngOnInit(): void { this.loadFlaggedContent(); }

  loadFlaggedContent(): void {
    this.isLoading.set(true);
    // Fetch flagged blogs + reviews via AdminService
    this.adminService.getFlaggedContent().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const items = response?.data || response || [];
        this.flaggedItems.set(items);
        this.pendingReview.set(items.length);
      },
      error: (e: any) => {
        this.isLoading.set(false);
        console.error('Failed to load flagged content', e);
      }
    });
  }

  removeContent(item: any): void {
    this.adminService.removeFlaggedContent(item.type, item.id).subscribe({
      next: () => {
        this.flaggedItems.update(items => items.filter(i => i.id !== item.id));
        this.successMessage.set('Content removed successfully.');
        this.resolvedToday.update(v => v + 1);
        this.pendingReview.update(v => v - 1);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (e: any) => console.error('Remove error', e)
    });
  }

  dismissFlag(item: any): void {
    this.adminService.dismissFlag(item.type, item.id).subscribe({
      next: () => {
        this.flaggedItems.update(items => items.filter(i => i.id !== item.id));
        this.successMessage.set('Flag dismissed. Content remains visible.');
        this.resolvedToday.update(v => v + 1);
        this.pendingReview.update(v => v - 1);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (e: any) => console.error('Dismiss error', e)
    });
  }

  viewContent(item: any): void {
    console.log('View content:', item);
  }
}