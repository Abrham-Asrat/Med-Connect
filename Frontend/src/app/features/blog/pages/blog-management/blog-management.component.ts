import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-pencil-square me-2"></i>My Blog Posts</h4>
        <button class="btn btn-primary" (click)="showEditor.set(!showEditor())">
          @if (showEditor()) { Cancel } @else { <i class="bi bi-plus me-1"></i> New Post }
        </button>
      </div>

      <!-- Stats -->
      <div class="row g-3 mb-4">
        <div class="col-4"><div class="card text-center p-3"><h4 class="text-primary mb-0">12</h4><small class="text-medium">Published</small></div></div>
        <div class="col-4"><div class="card text-center p-3"><h4 class="text-warning-dark mb-0">3</h4><small class="text-medium">Drafts</small></div></div>
        <div class="col-4"><div class="card text-center p-3"><h4 class="text-secondary mb-0">45K</h4><small class="text-medium">Views</small></div></div>
      </div>

      <!-- Editor -->
      @if (showEditor()) {
        <div class="card mb-4 border-primary">
          <div class="card-body">
            <input class="form-control mb-3" placeholder="Post title...">
            <select class="form-select mb-3"><option>Health Tips</option><option>Medical News</option><option>Patient Education</option></select>
            <textarea class="form-control mb-3" rows="6" placeholder="Write your post..."></textarea>
            <div class="d-flex gap-2">
              <button class="btn btn-primary">Submit for Review</button>
              <button class="btn btn-outline-secondary">Save Draft</button>
            </div>
          </div>
        </div>
      }

      <!-- Posts List -->
      @for (post of posts(); track post.id) {
        <div class="card mb-2" style="border-left:4px solid #078930">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">{{ post.title }}</h6>
              <small class="text-medium">{{ post.date }} · {{ post.category }} · <span [class.text-primary]="post.status==='Published'" [class.text-warning-dark]="post.status==='Draft'">{{ post.status }}</span></small>
            </div>
            <small class="text-primary">{{ post.views }} views</small>
          </div>
        </div>
      }
    </div>
  `
})
export class BlogManagementComponent {
  showEditor = signal(false);
  posts = signal([
    { id:'1', title:'Understanding Blood Pressure: A Complete Guide', date:'May 10, 2026', category:'Health Tips', status:'Published', views:'12.5K' },
    { id:'2', title:'The Importance of Regular Check-ups', date:'May 5, 2026', category:'Patient Education', status:'Published', views:'8.2K' },
    { id:'3', title:'Heart Disease Prevention Tips', date:'May 1, 2026', category:'Medical News', status:'Draft', views:'-' },
  ]);
}