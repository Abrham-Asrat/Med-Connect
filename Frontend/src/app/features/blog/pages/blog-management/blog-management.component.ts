import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/auth/auth.service';

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
  private authService = inject(AuthService);

  get userId(): string {
    return this.authService.currentUser()?.userId
      || localStorage.getItem('userId')
      || JSON.parse(localStorage.getItem('user') || '{}').userId
      || '';
  }

  blogs = signal<any[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  showEditor = signal(false);
  editMode = signal(false);
  editingBlogId = signal<string | null>(null);

  // Form — plain properties for ngModel compatibility
  title = '';
  content = '';
  category = 'Health Tips';
  tags = '';
  imageFile: File | null = null;
  imagePreview = signal<string | null>(null);

  // Like & Comment
  selectedBlogId = signal<string | null>(null);
  comments = signal<any[]>([]);
  showComments = signal(false);
  newComment = '';

  // Edit comment
  editingCommentId = signal<string | null>(null);
  editCommentText = '';

  categories = ['Health Tips', 'Medical News', 'Patient Education', 'Research', 'Wellness'];

  ngOnInit(): void { this.loadBlogs(); }

  loadBlogs(): void {
    if (!this.userId) return;
    this.isLoading.set(true);
    // Load only this doctor's blogs
    this.blogService.getBlogsByAuthor(this.userId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        const mapped = (Array.isArray(data) ? data : []).map((b: any) => ({
          ...b,
          likeCount: b.blogLikes?.length || 0,
          commentCount: b.comments?.length || 0,
          isLiked: b.blogLikes?.some((l: any) => l.userId === this.userId) || false,
        }));
        this.blogs.set(mapped);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void { this.imageFile = null; this.imagePreview.set(null); }

  openEditor(blog?: any): void {
    if (blog) {
      this.editMode.set(true);
      this.editingBlogId.set(blog.blogId || blog.id);
      this.title = blog.title || '';
      this.content = blog.content || '';
      this.category = blog.category || (blog.tags?.[0]) || 'Health Tips';
      this.tags = blog.tags?.join(', ') || '';
      this.imagePreview.set(blog.imageUrl || null);
    } else {
      this.editMode.set(false);
      this.editingBlogId.set(null);
      this.title = '';
      this.content = '';
      this.category = 'Health Tips';
      this.tags = '';
      this.imageFile = null;
      this.imagePreview.set(null);
    }
    this.showEditor.set(true);
  }

  closeEditor(): void {
    this.showEditor.set(false);
    this.editMode.set(false);
    this.editingBlogId.set(null);
  }

  saveBlog(): void {
    if (!this.title.trim() || this.title.trim().length < 5) {
      this.errorMessage.set('Title must be at least 5 characters.');
      return;
    }
    if (!this.content.trim() || this.content.trim().length < 100) {
      this.errorMessage.set(`Content must be at least 100 characters (now: ${this.content.trim().length}).`);
      return;
    }
    if (!this.userId) {
      this.errorMessage.set('User not found. Please login again.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // 1. Check if there's a new image to upload
    if (this.imageFile) {
      this.blogService.uploadImage(this.imageFile).subscribe({
        next: (res: any) => {
          const imageId = res?.data?.imageId || res?.imageId;
          this.executeSave(imageId);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.errorMessage.set('Failed to upload image. Please try again.');
          console.error(err);
        }
      });
    } else {
      this.executeSave();
    }
  }

  private executeSave(imageId?: string): void {
    const data: any = {
      authorId: this.userId,
      title: this.title.trim(),
      content: this.content.trim(),
      tags: this.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t),
    };

    if (imageId) data.imageId = imageId;

    const request = this.editMode() && this.editingBlogId()
      ? this.blogService.updateBlog(this.editingBlogId()!, data)
      : this.blogService.createBlog(data);

    request.subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        if (response?.success !== false) {
          this.successMessage.set(this.editMode() ? 'Blog updated!' : 'Blog published!');
          this.closeEditor();
          this.loadBlogs();
          setTimeout(() => this.successMessage.set(null), 3000);
        } else {
          this.errorMessage.set(response?.message || 'Failed.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          error?.error?.errors?.Content?.[0]
          || error?.error?.errors?.Title?.[0]
          || error?.error?.message
          || 'Failed to save blog.'
        );
      }
    });
  }

  deleteBlog(blogId: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (!confirm('Delete this blog post? This cannot be undone.')) return;

    this.blogService.deleteBlog(blogId).subscribe({
      next: () => {
        this.successMessage.set('Blog deleted.');
        this.loadBlogs();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (e: any) => this.errorMessage.set(e?.error?.message || 'Failed to delete.')
    });
  }

  // Like
  likeBlog(blogId: string, event?: Event): void {
    if (event) event.stopPropagation();
    this.blogService.likeBlog(blogId).subscribe({
      next: () => this.loadBlogs(),
      error: (e: any) => console.error('Like failed:', e)
    });
  }

  // Comments
  toggleComments(blogId: string, event?: Event): void {
    if (event) event.stopPropagation();
    if (this.selectedBlogId() === blogId && this.showComments()) {
      this.showComments.set(false);
    } else {
      this.selectedBlogId.set(blogId);
      this.showComments.set(true);
      this.loadComments(blogId);
    }
  }

  loadComments(blogId: string): void {
    this.blogService.getComments(blogId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.comments.set(Array.isArray(data) ? data : []);
      },
      error: (e: any) => console.error('Error loading comments:', e)
    });
  }

  addComment(blogId: string): void {
    if (!this.newComment.trim()) return;
    this.blogService.addComment({
      blogId,
      senderId: this.userId,
      commentText: this.newComment.trim()
    }).subscribe({
      next: () => {
        this.loadComments(blogId);
        this.newComment = '';
      },
      error: (e: any) => console.error('Comment failed:', e)
    });
  }

  startEditComment(comment: any): void {
    this.editingCommentId.set(comment.blogCommentId);
    this.editCommentText = comment.commentText;
  }

  saveEditComment(comment: any): void {
    if (!this.editCommentText.trim()) return;
    this.blogService.updateComment(comment.blogCommentId, { commentText: this.editCommentText }).subscribe({
      next: () => {
        comment.commentText = this.editCommentText;
        this.editingCommentId.set(null);
        this.editCommentText = '';
      },
      error: (e: any) => console.error('Edit failed:', e)
    });
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editCommentText = '';
  }

  deleteComment(commentId: string, blogId: string): void {
    if (!confirm('Delete this comment?')) return;
    this.blogService.deleteComment(commentId).subscribe({
      next: () => this.loadComments(blogId),
      error: (e: any) => console.error('Delete comment failed:', e)
    });
  }

  // Stats
  publishedCount(): number { return this.blogs().length; }  // all returned are published
  totalLikes(): number { return this.blogs().reduce((s, b) => s + (b.likeCount || 0), 0); }
  totalComments(): number { return this.blogs().reduce((s, b) => s + (b.commentCount || 0), 0); }

  getAuthorName(comment: any): string {
    if (comment?.sender?.firstName) {
      return `${comment.sender.firstName} ${comment.sender.lastName || ''}`.trim();
    }
    return 'User';
  }
}
