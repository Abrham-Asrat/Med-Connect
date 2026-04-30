export interface BlogPost {
  postId: string;
  doctorId: string;
  doctorName: string;
  title: string;
  content: string;
  category: string;
  featuredImage?: string;
  status: 'Draft' | 'UnderReview' | 'Published' | 'Rejected';
  viewCount: number;
  likeCount: number;
  rejectionReason?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  category: string;
  featuredImage?: File;
}

export interface UpdateBlogPostRequest {
  title?: string;
  content?: string;
  category?: string;
  featuredImage?: File;
}

export interface BlogPostListResponse {
  success: boolean;
  data: BlogPost[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface BlogCategory {
  id: string;
  name: string;
  postCount: number;
}