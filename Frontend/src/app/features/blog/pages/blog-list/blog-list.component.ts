import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { BlogService } from '../../../../core/services/blog.service';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-blog-list',
    standalone: true,
    imports: [CommonModule, FormsModule],

    templateUrl: './blog-list.component.html',
    styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {
    private blogService = inject(BlogService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);


    blogs = signal<any[]>([]);
    isLoading = signal(true);
    categories = ['All', 'Health Tips', 'Medical News', 'Wellness', 'Patient Education'];
    selectedCategory = signal('All');

    // Social interaction states
    userId = localStorage.getItem('userId') || '';
    activeCommentBlogId = signal<string | null>(null);
    commentText = signal('');
    isSubmittingComment = signal(false);

    // Reply and Edit states
    replyingToCommentId = signal<string | null>(null);
    editingCommentId = signal<string | null>(null);
    editCommentText = signal('');

    ngOnInit(): void {
        this.loadBlogs();
    }

    loadBlogs(): void {
        this.isLoading.set(true);
        this.blogService.getAllBlogs().subscribe({
            next: (response: any) => {
                const data = response?.data || response || [];
                const parsedData = Array.isArray(data) ? data : [];

                // Map backend DTO to frontend requirements
                const formattedBlogs = parsedData.map((b: any) => ({
                    id: b.blogId || b.id,
                    title: b.title,
                    authorName: b.author ? `${b.author.firstName} ${b.author.lastName}` : 'Anonymous User',
                    publishedAt: b.createdAt || new Date().toISOString(),
                    content: b.content,
                    category: b.tags?.length > 0 ? b.tags[0] : 'Health Tips',
                    likeCount: b.blogLikes?.length || 0,
                    isLiked: b.blogLikes?.some((like: any) => like.userId === this.userId),
                    commentCount: b.comments?.length || 0,
                    comments: b.comments || [],
                    thumbnail: b.imageUrl || 'assets/blog-banner.png'
                }));
                this.blogs.set(formattedBlogs);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load blogs', err);
                this.isLoading.set(false);
                this.blogs.set([]); // Empty list on error
            }
        });
    }

    filterByCategory(category: string): void {
        this.selectedCategory.set(category);
    }

    get filteredBlogs() {
        if (this.selectedCategory() === 'All') return this.blogs();
        return this.blogs().filter(b => b.category === this.selectedCategory());
    }

    get featuredBlog() {
        return this.blogs().length > 0 ? this.blogs()[0] : null;
    }

    get remainingBlogs() {
        return this.blogs().slice(1);
    }


    navigateToBlog(blogId: string): void {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/patient/')) {
            this.router.navigate(['/patient/blog', blogId]);
        } else if (currentUrl.includes('/doctor/')) {
            this.router.navigate(['/doctor/health-blogs', blogId]);
        } else {
            this.router.navigate(['/blogs', blogId]);
        }
    }

    toggleLike(blog: any, event: Event): void {
        event.stopPropagation();
        if (!this.userId) {
            alert('Please login to like this blog');
            return;
        }

        this.blogService.likeBlog(blog.id).subscribe({
            next: () => {
                // Optimistic update
                const currentBlogs = this.blogs();
                const index = currentBlogs.findIndex(b => b.id === blog.id);
                if (index !== -1) {
                    const b = currentBlogs[index];
                    b.isLiked = !b.isLiked;
                    b.likeCount += b.isLiked ? 1 : -1;
                    this.blogs.set([...currentBlogs]);
                }
            },
            error: (err) => console.error('Error liking blog', err)
        });
    }

    toggleCommentInput(blogId: string, event: Event): void {
        event.stopPropagation();
        if (this.activeCommentBlogId() === blogId) {
            this.activeCommentBlogId.set(null);
            this.commentText.set('');
        } else {
            this.activeCommentBlogId.set(blogId);
            this.commentText.set('');
        }
    }

    submitComment(blog: any): void {
        if (!this.userId) {
            alert('Please login to comment');
            return;
        }

        if (!this.commentText().trim()) return;

        this.isSubmittingComment.set(true);
        const commentData = {
            blogId: blog.id,
            senderId: this.userId,
            commentText: this.commentText(),
            parentCommentId: this.replyingToCommentId()
        };

        this.blogService.addComment(commentData).subscribe({
            next: (res) => {
                const newComment = res?.data || res;
                if (this.replyingToCommentId()) {
                    const parent = this.findCommentById(blog.comments, this.replyingToCommentId()!);
                    if (parent) {
                        if (!parent.replies) parent.replies = [];
                        parent.replies.push(newComment);
                    }
                } else {
                    if (!blog.comments) blog.comments = [];
                    blog.comments.unshift(newComment);
                }

                blog.commentCount++;
                this.commentText.set('');
                this.replyingToCommentId.set(null);
                this.isSubmittingComment.set(false);
            },
            error: (err) => {
                console.error('Error adding comment', err);
                this.isSubmittingComment.set(false);
            }
        });
    }

    private findCommentById(comments: any[], id: string): any {
        for (const c of comments) {
            if (c.blogCommentId === id) return c;
            if (c.replies?.length) {
                const found = this.findCommentById(c.replies, id);
                if (found) return found;
            }
        }
        return null;
    }

    startReply(commentId: string, event: Event): void {
        event.stopPropagation();
        this.replyingToCommentId.set(commentId);
        this.commentText.set('');
    }

    cancelReply(): void {
        this.replyingToCommentId.set(null);
        this.commentText.set('');
    }

    startEdit(comment: any, event: Event): void {
        event.stopPropagation();
        this.editingCommentId.set(comment.blogCommentId);
        this.editCommentText.set(comment.commentText);
    }

    saveEdit(comment: any, event: Event): void {
        event.stopPropagation();
        if (!this.editCommentText().trim()) return;

        this.blogService.updateComment(comment.blogCommentId, { commentText: this.editCommentText() }).subscribe({
            next: (res) => {
                const updated = res?.data || res;
                comment.commentText = updated.commentText;
                this.cancelEdit();
            },
            error: (err) => console.error('Error updating comment', err)
        });
    }

    cancelEdit(): void {
        this.editingCommentId.set(null);
        this.editCommentText.set('');
    }

    deleteComment(commentId: string, blog: any, event: Event): void {
        event.stopPropagation();
        if (!confirm('Are you sure you want to delete this comment?')) return;

        this.blogService.deleteComment(commentId).subscribe({
            next: () => {
                this.removeCommentFromList(blog, commentId);
                blog.commentCount--;
            },
            error: (err) => console.error('Error deleting comment', err)
        });
    }

    private removeCommentFromList(blog: any, id: string): void {
        // Remove from top level
        const originalLength = blog.comments.length;
        blog.comments = blog.comments.filter((c: any) => c.blogCommentId !== id);

        // If not found in top level, check replies
        if (blog.comments.length === originalLength) {
            blog.comments.forEach((c: any) => {
                if (c.replies) {
                    c.replies = c.replies.filter((r: any) => r.blogCommentId !== id);
                }
            });
        }
    }

    onCommentInputClick(event: Event): void {
        event.stopPropagation();
    }
}

