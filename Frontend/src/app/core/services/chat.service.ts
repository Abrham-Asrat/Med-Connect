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

  blockConversation(conversationId: string, userId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversations/${conversationId}/block`, { userId });
  }

  updateConversationStatus(conversationId: string, userId: string, status: 'follow_up' | 'closed'): Observable<any> {
    return this.http.patch(`${this.apiUrl}/conversations/${conversationId}/status`, { userId, status });
  }

  // ====== SIGNALR IMPLEMENTATION ====== //

  startConnection(): Promise<void> {
    // If already connected, reuse the existing connection
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connected
    ) {
      return Promise.resolve();
    }

    // If connecting, wait for it rather than creating a duplicate
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Connecting
    ) {
      return new Promise((resolve, reject) => {
        const check = setInterval(() => {
          if (!this.hubConnection) { clearInterval(check); reject('Connection lost'); return; }
          if (this.hubConnection.state === signalR.HubConnectionState.Connected) { clearInterval(check); resolve(); }
          if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) { clearInterval(check); reject('Connection failed'); }
        }, 100);
      });
    }

    // If still tearing down, wait for it to fully stop before rebuilding
    if (
      this.hubConnection &&
      this.hubConnection.state === signalR.HubConnectionState.Disconnecting
    ) {
      return this.hubConnection.stop().then(() => this.startConnection());
    }

    // Use a factory so the token is read fresh at connection/reconnection time
    const hubUrl = this.apiUrl.replace('/api', '') + '/chathub';

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.authService.getToken() || localStorage.getItem('token') || ''
      })
      .withAutomaticReconnect()
      .build();

    // The hub broadcasts a MessageDto object as a single argument
    this.hubConnection.on('ReceiveMessage', (data: any) => {
      this.messageReceivedSource.next(data);
    });

    return this.hubConnection.start()
      .then(() => console.log('SignalR Chat Hub Connected!'))
      .catch(err => console.error('Error while starting connection with Chat Hub: ' + err));
  }

  stopConnection(): void {
    if (
      this.hubConnection &&
      this.hubConnection.state !== signalR.HubConnectionState.Disconnected &&
      this.hubConnection.state !== signalR.HubConnectionState.Disconnecting
    ) {
      this.hubConnection.stop();
    }
  }

  // Maps frontend type strings to the C# MessageType enum integer values
  private readonly messageTypeMap: Record<string, number> = {
    text: 0,
    voice: 1,
    system: 2,
    review_prompt: 3,
    prescription: 4,
    image: 5
  };

  sendMessageToHub(
    conversationId: string,
    messageText: string | null,
    files: any[] = [],
    type: string = 'text',
    audioUrl: string | null = null,
    audioDuration: string | null = null,
    prescriptionDetails: any = null,
    targetUserId: string | null = null
  ): Promise<any> {
    if (!this.hubConnection || this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject('Hub connection is not active.');
    }

    // C# enum must be sent as an integer — SignalR JSON cannot deserialize a string into an enum
    const typeValue: number = this.messageTypeMap[type] ?? 0;

    // Pass null instead of empty array so the C# nullable List<CreateFileDto>? binds correctly
    const filesPayload = files && files.length > 0 ? files : null;

    // Matches the C# method signature: SendMessage(Guid conversationId, string? messageText, List<CreateFileDto>? files, MessageType type, string? audioUrl, string? audioDuration, CreatePrescriptionDto? prescriptionDetails, Guid? targetUserId)
    return this.hubConnection.invoke(
      'SendMessage',
      conversationId,
      messageText,
      filesPayload,
      typeValue,
      audioUrl,
      audioDuration,
      prescriptionDetails,
      targetUserId
    );
  }
}