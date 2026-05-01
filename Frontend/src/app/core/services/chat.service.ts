import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // GET /api/conversations/users/{userId}
  getUserConversations(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/users/${userId}`);
  }

  // GET /api/conversations/messages/{conversationId}
  getMessages(conversationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/messages/${conversationId}`);
  }

  // POST /api/conversations
  createConversation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations`, data);
  }

  // GET /api/conversations/all
  getAllConversations(): Observable<any> {
    return this.http.get(`${this.apiUrl}/conversations/all`);
  }

  // DELETE /api/conversations/message/{messageId}
  deleteMessage(messageId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/conversations/message/${messageId}`);
  }
}