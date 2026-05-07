import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/blogs/all
  getAllBlogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/blogs/all`);
  }

  // GET /api/blogs/{blogId}
  getBlogById(blogId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/blogs/${blogId}`);
  }

  // POST /api/blogs
  createBlog(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/blogs`, data);
  }

  // PUT /api/blogs/{blogId}
  updateBlog(blogId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/blogs/${blogId}`, data);
  }

  // POST /api/blogs/comment
  addComment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/blogs/comment`, data);
  }

  // GET /api/blogs/{blogId}/comments
  getComments(blogId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/blogs/${blogId}/comments`);
  }

  // POST /api/blogs/{id}/like
  likeBlog(blogId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/blogs/${blogId}/like`, {});
  }

  // PUT /api/blogs/comment/{id}
  updateComment(commentId: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/blogs/comment/${commentId}`, data);
  }

  // DELETE /api/blogs/comment/{id}
  deleteComment(commentId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/blogs/comment/${commentId}`);
  }
}