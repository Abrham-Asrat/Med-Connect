import { Injectable, inject, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { Subject, Observable } from 'rxjs';

export interface SignalRNotification {
  type: 'appointment' | 'message' | 'payment' | 'review' | 'system' | 'approval';
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private authService = inject(AuthService);
  private hubUrl = environment.signalRHub;

  connectionState = signal<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');

  private chatHubConnection!: signalR.HubConnection;
  private notificationHubConnection!: signalR.HubConnection;

  // Observables
  messageReceived$ = new Subject<{ conversationId: string; senderId: string; message: string; timestamp: Date }>();
  notificationReceived$ = new Subject<SignalRNotification>();
  typingReceived$ = new Subject<{ conversationId: string; userId: string; isTyping: boolean }>();
  userStatusChanged$ = new Subject<{ userId: string; isOnline: boolean }>();

  activeConversations = signal<string[]>([]);

  async startConnection(): Promise<void> {
    this.connectionState.set('connecting');

    try {
      this.chatHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.hubUrl}/chathub`, {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      this.notificationHubConnection = new signalR.HubConnectionBuilder()
        .withUrl(`${this.hubUrl}/notificationhub`, {
          accessTokenFactory: () => this.authService.getToken() || ''
        })
        .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
        .build();

      this.registerChatHandlers();
      this.registerNotificationHandlers();

      await Promise.all([
        this.chatHubConnection.start(),
        this.notificationHubConnection.start()
      ]);

      this.connectionState.set('connected');
      console.log('✅ SignalR connected');
    } catch (error) {
      this.connectionState.set('disconnected');
      console.error('❌ SignalR connection failed:', error);
    }
  }

  private registerChatHandlers(): void {
    this.chatHubConnection.on('ReceiveMessage', (conversationId: string, senderId: string, message: string, timestamp: string) => {
      this.messageReceived$.next({ conversationId, senderId, message, timestamp: new Date(timestamp) });
    });

    this.chatHubConnection.on('UserTyping', (conversationId: string, userId: string) => {
      this.typingReceived$.next({ conversationId, userId, isTyping: true });
    });

    this.chatHubConnection.on('UserStoppedTyping', (conversationId: string, userId: string) => {
      this.typingReceived$.next({ conversationId, userId, isTyping: false });
    });

    this.chatHubConnection.on('UserOnline', (userId: string) => {
      this.userStatusChanged$.next({ userId, isOnline: true });
    });

    this.chatHubConnection.on('UserOffline', (userId: string) => {
      this.userStatusChanged$.next({ userId, isOnline: false });
    });

    this.chatHubConnection.onreconnecting(() => this.connectionState.set('reconnecting'));
    this.chatHubConnection.onreconnected(() => { this.connectionState.set('connected'); this.rejoinConversations(); });
    this.chatHubConnection.onclose(() => this.connectionState.set('disconnected'));
  }

  private registerNotificationHandlers(): void {
    this.notificationHubConnection.on('AppointmentUpdate', (data: any) => {
      this.notificationReceived$.next({ type: 'appointment', title: data.confirmed ? 'Appointment Confirmed' : 'Appointment Update', message: data.message, data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('NewMessageNotification', (data: any) => {
      this.notificationReceived$.next({ type: 'message', title: `New message from ${data.senderName}`, message: data.preview, data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('PaymentUpdate', (data: any) => {
      this.notificationReceived$.next({ type: 'payment', title: data.success ? 'Payment Successful' : 'Payment Failed', message: data.message, data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('ReviewRequest', (data: any) => {
      this.notificationReceived$.next({ type: 'review', title: 'Rate Your Appointment', message: `How was your visit with ${data.doctorName}?`, data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('DoctorApproved', (data: any) => {
      this.notificationReceived$.next({ type: 'approval', title: 'Account Approved! 🎉', message: 'Your account has been approved.', data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('NewDoctorRegistration', (data: any) => {
      this.notificationReceived$.next({ type: 'system', title: 'New Doctor Registration', message: `${data.doctorName} needs approval.`, data, timestamp: new Date() });
    });

    this.notificationHubConnection.on('ReceiveNotification', (data: any) => {
      this.notificationReceived$.next({
        type: data.type || 'system',
        title: data.title || 'New Notification',
        message: data.message || '',
        data: data.data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date()
      });
    });
  }

  async joinConversation(conversationId: string): Promise<void> {
    if (this.chatHubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatHubConnection.invoke('JoinConversation', conversationId);
      this.activeConversations.update(convs => [...convs, conversationId]);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (this.chatHubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatHubConnection.invoke('LeaveConversation', conversationId);
      this.activeConversations.update(convs => convs.filter(c => c !== conversationId));
    }
  }

  async sendMessage(conversationId: string, message: string): Promise<void> {
    if (this.chatHubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatHubConnection.invoke('SendMessage', conversationId, message);
    }
  }

  async sendTypingIndicator(conversationId: string, isTyping: boolean): Promise<void> {
    if (this.chatHubConnection?.state === signalR.HubConnectionState.Connected) {
      await this.chatHubConnection.invoke(isTyping ? 'StartTyping' : 'StopTyping', conversationId);
    }
  }

  private async rejoinConversations(): Promise<void> {
    for (const convId of this.activeConversations()) {
      await this.joinConversation(convId);
    }
  }

  async stopConnection(): Promise<void> {
    if (this.chatHubConnection) await this.chatHubConnection.stop();
    if (this.notificationHubConnection) await this.notificationHubConnection.stop();
    this.connectionState.set('disconnected');
  }
}