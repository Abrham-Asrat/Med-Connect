import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';

@Component({
  selector: 'app-blog-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './blog-management.component.html',
  styles: [`
    .blog-card { border-left: 4px solid #078930; transition: all 0.2s; }
    .blog-card:hover { box-shadow: 0 4px 16px rgba(7,137,48,0.12); }
    .blog-card.draft { border-left-color: #FCD116; }
    .blog-image { width: 100%; max-height: 200px; object-fit: cover; border-radius: 8px; }
    .image-preview { max-width: 300px; max-height: 200px; object-fit: cover; border-radius: 8px; }
    .comment-section { background: #F8F9FA; border-top: 1px solid #E5E7EB; }
    .upload-zone { cursor: pointer; border: 2px dashed #E5E7EB; border-radius: 8px; transition: all 0.3s; }
    .upload-zone:hover { border-color: #078930; background: #E8F5EC; }
  `]
})
export class BlogManagementComponent implements OnInit {
  private blogService = inject(BlogService);

  userId = JSON.parse(localStorage.getItem('user') || '{}').userId || '';
  blogs = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showEditor = signal(false);
  editMode = signal(false);
  editingBlogId = signal<string | null>(null);

  // Form
  title = signal('');
  content = signal('');
  category = signal('Health Tips');
  tags = signal('');
  imageFile = signal<File | null>(null);
  imagePreview = signal<string | null>(null);

  // Like & Comment
  selectedBlogId = signal<string | null>(null);
  comments = signal<any[]>([]);
  showComments = signal(false);
  newComment = signal('');

  categories = ['Health Tips', 'Medical News', 'Patient Education', 'Research', 'Wellness'];

  ngOnInit(): void { this.loadBlogs(); }

  loadBlogs(): void {
    this.isLoading.set(true);
    this.blogService.getAllBlogs().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        this.blogs.set(Array.isArray(data) ? data : []);
      },
      error: (error: any) => { this.isLoading.set(false); console.error('Error:', error); }
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.imageFile.set(file);
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void { this.imageFile.set(null); this.imagePreview.set(null); }

  openEditor(blog?: any): void {
    if (blog) {
      this.editMode.set(true);
      this.editingBlogId.set(blog.blogId || blog.id);
      this.title.set(blog.title || '');
      this.content.set(blog.content || '');
      this.category.set(blog.category || 'Health Tips');
      this.tags.set(blog.tags?.join(', ') || '');
      this.imagePreview.set(blog.imageUrl || null);
    } else {
      this.editMode.set(false); this.editingBlogId.set(null);
      this.title.set(''); this.content.set(''); this.category.set('Health Tips');
      this.tags.set(''); this.imageFile.set(null); this.imagePreview.set(null);
    }
    this.showEditor.set(true);
  }

  closeEditor(): void {
    this.showEditor.set(false); this.editMode.set(false); this.editingBlogId.set(null);
  }

  saveBlog(): void {
    if (!this.title().trim() || this.title().trim().length < 5) { this.errorMessage.set('Title must be 5-100 characters.'); return; }
    if (!this.content().trim() || this.content().trim().length < 100) { this.errorMessage.set(`Content must be 100-10000 characters (now: ${this.content().trim().length}).`); return; }
    if (!this.userId) { this.errorMessage.set('User not found. Please login again.'); return; }

    const data: any = {
      authorId: this.userId,
      title: this.title().trim(),
      content: this.content().trim(),
      tags: this.tags().split(',').map(t => t.trim()).filter(t => t),
    };

    this.isLoading.set(true); this.errorMessage.set(null); this.successMessage.set(null);

    const request = this.editMode() && this.editingBlogId()
      ? this.blogService.updateBlog(this.editingBlogId()!, data)
      : this.blogService.createBlog(data);

    request.subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success) {
          this.successMessage.set(this.editMode() ? 'Blog updated!' : 'Blog published!');
          this.closeEditor(); this.loadBlogs();
          setTimeout(() => this.successMessage.set(null), 3000);
        } else { this.errorMessage.set(response?.message || 'Failed.'); }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(error?.error?.errors?.Content?.[0] || error?.error?.errors?.Title?.[0] || error?.error?.message || 'Failed.');
      }
    });
  }

  // Like
  likeBlog(blogId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.blogService.likeBlog(blogId).subscribe({ next: () => this.loadBlogs(), error: (e) => console.error('Like failed:', e) });
  }

  // Comments
  toggleComments(blogId: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.selectedBlogId() === blogId && this.showComments()) {
      this.showComments.set(false);
    } else {
      this.selectedBlogId.set(blogId); this.showComments.set(true); this.loadComments(blogId);
    }
  }

  loadComments(blogId: string): void {
    this.blogService.getComments(blogId).subscribe({
      next: (response: any) => { const data = response?.data || response || []; this.comments.set(Array.isArray(data) ? data : []); },
      error: (e) => console.error('Error:', e)
    });
  }

  addComment(blogId: string): void {
    if (!this.newComment().trim()) return;
    this.blogService.addComment({ blogId, senderId: this.userId, commentText: this.newComment().trim() }).subscribe({
      next: () => { this.loadComments(blogId); this.newComment.set(''); },
      error: (e) => console.error('Comment failed:', e)
    });
  }

  getStatusClass(status: string): string { return status === 'Published' ? 'published' : 'draft'; }
  publishedCount(): number { return this.blogs().filter(b => b.status === 'Published').length; }
  draftCount(): number { return this.blogs().filter(b => b.status !== 'Published').length; }
  totalViews(): number { return this.blogs().reduce((s, b) => s + (b.viewCount || 0), 0); }
}