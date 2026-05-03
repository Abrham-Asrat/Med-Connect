import { Component, inject, signal, OnInit } from '@angular/core';
// Import common Angular capabilities
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-blog-detail',
    standalone: true,
    imports: [CommonModule, RouterLink, FormsModule],
    templateUrl: './blog-detail.component.html',
    styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private authService = inject(AuthService);

    blog = signal<any>(null);
    isLoading = signal(true);

    comments = signal<any[]>([]);
    newComment = signal('');
    isSubmitting = signal(false);
    isLiking = signal(false);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadBlogDetail(id);
            this.loadComments(id);
        }
    }

    loadBlogDetail(id: string): void {
        this.isLoading.set(true);
        this.blogService.getBlogById(id).subscribe({
            next: (response: any) => {
                this.blog.set(response?.data || response);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                // Fallback mock
                this.blog.set({
                    id,
                    title: 'Understanding Blood Pressure',
                    authorName: 'Dr. Sarah Johnson',
                    publishedAt: new Date().toISOString(),
                    category: 'Health Tips',
                    content: 'Full article content would go here...',
                    thumbnail: 'assets/blog-banner.png',
                    viewCount: 12500,
                    blogLikes: []
                });
            }
        });
    }

    loadComments(id: string): void {
        this.blogService.getComments(id).subscribe({
            next: (response: any) => {
                this.comments.set(response?.data || []);
            },
            error: (err) => {
                console.error('Failed to load comments', err);
            }
        });
    }

    submitComment(): void {
        if (!this.newComment().trim() || !this.blog()) return;

        const senderId = this.authService.currentUser()?.userId;
        if (!senderId) {
            // Need login logic (just prompt or show error)
            alert('You must be logged in to comment.');
            return;
        }

        this.isSubmitting.set(true);
        const commentData = {
            blogId: this.blog().blogId || this.blog().id,
            senderId,
            commentText: this.newComment()
        };

        this.blogService.addComment(commentData).subscribe({
            next: (response: any) => {
                const addedComment = response?.data || response;
                // Prepend the new comment locally or reload
                this.comments.update(c => [addedComment, ...c]);
                this.newComment.set('');
                this.isSubmitting.set(false);
            },
            error: (err) => {
                console.error('Failed to add comment', err);
                this.isSubmitting.set(false);
            }
        });
    }

    toggleLike(): void {
        if (!this.blog() || this.isLiking()) return;

        const blogId = this.blog().blogId || this.blog().id;
        const currentUserId = this.authService.currentUser()?.userId;

        if (!currentUserId) {
            alert('You must be logged in to like this post.');
            return;
        }

        this.isLiking.set(true);
        this.blogService.likeBlog(blogId).subscribe({
            next: (response: any) => {
                this.isLiking.set(false);
                // If the response tells us it's liked or unliked, we can toggle local state.
                // We'll just refresh the blog details to get accurate count.
                this.loadBlogDetail(blogId);
            },
            error: (err) => {
                console.error('Failed to like blog', err);
                this.isLiking.set(false);
            }
        });
    }

    get likesCount(): number {
        if (!this.blog()) return 0;
        return this.blog().blogLikes?.length || this.blog().likesCount || 0;
    }

    get hasLiked(): boolean {
        if (!this.blog()) return false;
        const currentUserId = this.authService.currentUser()?.userId;
        if (!currentUserId || !this.blog().blogLikes) return false;
        return this.blog().blogLikes.some((like: any) => like.userId === currentUserId);
    }
}
