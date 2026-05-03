import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../../../core/services/blog.service';

@Component({
    selector: 'app-blog-list',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './blog-list.component.html',
    styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {
    private blogService = inject(BlogService);

    blogs = signal<any[]>([]);
    isLoading = signal(true);
    categories = ['All', 'Health Tips', 'Medical News', 'Wellness', 'Patient Education'];
    selectedCategory = signal('All');

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
                    viewCount: b.blogLikes?.length || 0, // Using likes as metric if views aren't available
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
}
