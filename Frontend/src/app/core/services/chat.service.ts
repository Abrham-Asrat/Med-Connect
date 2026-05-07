import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private hubConnection: signalR.HubConnection | undefined;

  // Observable to emit new incoming messages
  private messageReceivedSource = new Subject<any>();
  messageReceived$ = this.messageReceivedSource.asObservable();

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

  // ====== SIGNALR IMPLEMENTATION ====== //

  startConnection(): Promise<void> {
    const token = this.authService.getToken() || localStorage.getItem('token') || '';

    // We map our base api url to the hub url. Example: http://localhost:5000/api -> http://localhost:5000/hub/chat
    const hubUrl = this.apiUrl.replace('/api', '') + '/chathub';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (data: any) => {
      this.messageReceivedSource.next(data);
    });

    return this.hubConnection.start()
      .then(() => console.log('SignalR Chat Hub Connected!'))
      .catch(err => console.error('Error while starting connection with Chat Hub: ' + err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }

  sendMessageToHub(
    conversationId: string,
    messageText: string,
    files: any[] = [],
    type: string = 'text',
    audioUrl: string | null = null,
    audioDuration: string | null = null,
    prescriptionDetails: any = null
  ): Promise<any> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject('Hub connection is not active.');
    }
    // Matches the C# method signature: SendMessage(Guid conversationId, string? messageText, List<CreateFileDto>? files, MessageType type, string? audioUrl, string? audioDuration, CreatePrescriptionDto? prescriptionDetails)
    return this.hubConnection.invoke(
      'SendMessage',
      conversationId,
      messageText,
      files,
      type,
      audioUrl,
      audioDuration,
      prescriptionDetails
    );
  }
}