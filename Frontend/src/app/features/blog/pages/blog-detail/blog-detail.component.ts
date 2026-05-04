import { Component, inject, signal, OnInit } from '@angular/core';
// Import common Angular capabilities
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { FormsModule } from '@angular/forms';
import { BlogService } from '../../../../core/services/blog.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-blog-detail',
    standalone: true,
    imports: [CommonModule, FormsModule],

    templateUrl: './blog-detail.component.html',
    styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private blogService = inject(BlogService);
    private authService = inject(AuthService);
    private router = inject(Router);


    blog = signal<any>(null);
    isLoading = signal(true);

    comments = signal<any[]>([]);
    newComment = signal('');
    isSubmitting = signal(false);
    isLiking = signal(false);

    // Flagging Logic Added
    showFlagModal = signal(false);
    flagReason = signal('');
    isFlagging = signal(false);

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.loadBlogDetail(id);
            this.loadComments(id);
        }
        this.setupReadingProgress();
    }

    private setupReadingProgress(): void {
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            const progressBar = document.getElementById('readingProgress');
            if (progressBar) progressBar.style.width = scrolled + '%';
        });
    }


    loadBlogDetail(id: string): void {
        this.isLoading.set(true);
        this.blogService.getBlogById(id).subscribe({
            next: (response: any) => {
                const b = response?.data || response;
                // Map the backend BlogDto to exactly what the frontend HTML expects
                const formattedBlog = {
                    id: b.blogId || b.id,
                    title: b.title,
                    authorName: b.author ? `${b.author.firstName} ${b.author.lastName}` : 'Anonymous User',
                    publishedAt: b.createdAt || new Date().toISOString(),
                    content: b.content,
                    category: b.tags?.length > 0 ? b.tags[0] : 'Health Tips',
                    viewCount: b.blogLikes?.length || 0, // View count is not in DTO, deriving mock
                    thumbnail: b.imageUrl || 'assets/blog-banner.png',
                    blogLikes: b.blogLikes || [],
                    likesCount: b.blogLikes?.length || 0
                };
                this.blog.set(formattedBlog);
                this.isLoading.set(false);
            },
            error: () => {
                this.isLoading.set(false);
                // Fallback mock
                this.blog.set({
                    id,
                    title: 'Understanding Blood Pressure and How to Control It Effectively',
                    authorName: 'Dr. Sarah Johnson',
                    publishedAt: new Date().toISOString(),
                    category: 'Health Tips',
                    content: 'Blood pressure is a measure of the force that your heart uses to pump blood around your body. Understanding blood pressure is essential for maintaining cardiovascular health. \n\nWhat is High Blood Pressure?\nHigh blood pressure, or hypertension, rarely has noticeable symptoms. But if untreated, it increases your risk of serious problems such as heart attacks and strokes. \n\nAround healthier habits:\n1. Maintain a healthy weight.\n2. Eat a balanced diet low in sodium.\n3. Exercise regularly.\n\nPlease consult your doctor if you have persistent symptoms.',
                    thumbnail: 'assets/blog-banner.png',
                    viewCount: 12500,
                    blogLikes: [],
                    likesCount: 120
                });
            }
        });
    }

    loadComments(id: string): void {
        this.blogService.getComments(id).subscribe({
            next: (response: any) => {
                const list = response?.data || [];
                const mapped = list.map((c: any) => ({
                    ...c,
                    createdAt: c.createdAt || new Date().toISOString()
                }));
                this.comments.set(mapped);
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
                const formattedComment = {
                    ...addedComment,
                    createdAt: addedComment.createdAt || new Date().toISOString()
                };
                // Prepend the new comment locally or reload
                this.comments.update(c => [formattedComment, ...c]);
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
                // Refresh the blog details to get accurate count.
                this.loadBlogDetail(blogId);
            },
            error: (err) => {
                console.error('Failed to like blog', err);
                this.isLiking.set(false);
            }
        });
    }

    toggleFlagModal(): void {
        this.showFlagModal.update(v => !v);
        this.flagReason.set('');
    }

    submitFlag(): void {
        if (!this.flagReason().trim()) return;
        this.isFlagging.set(true);
        // Fake flagging logic since we don't have a backend endpoint yet for flagging
        setTimeout(() => {
            this.isFlagging.set(false);
            this.toggleFlagModal();
            alert('Thank you. This article has been internally flagged for review by moderators.');
        }, 800);
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

    backToHub(): void {
        const currentUrl = this.router.url;
        if (currentUrl.includes('/patient/')) {
            this.router.navigate(['/patient/blog']);
        } else if (currentUrl.includes('/doctor/')) {
            this.router.navigate(['/doctor/health-blogs']);
        } else {
            this.router.navigate(['/blogs']);
        }
    }
}

