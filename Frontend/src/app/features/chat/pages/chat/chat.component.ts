import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { Subscription } from 'rxjs';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file' | 'system';
  read: boolean;
}

interface Conversation {
  id: string;
  name: string;
  role: string;
  avatar: string;       // initials fallback
  avatarUrl?: string;    // actual profile picture URL
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  newMessage = signal('');
  activeConversation = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);

  userId = this.authService.currentUser()?.userId || localStorage.getItem('userId') || '';

  private messageSub: Subscription | undefined;

  ngOnInit(): void {
    // 1. Initial Load
    this.loadConversations();

    // 2. Establish Real-time SignalR Connection
    this.chatService.startConnection().then(() => {
      console.log("Chat Hooked Up");
    });

    // 3. Listen for Incoming Live Messages
    this.messageSub = this.chatService.messageReceived$.subscribe((incomingMsg: any) => {
      // If the incoming message belongs to the current open thread, push it to UI
      if (incomingMsg.conversationId === this.activeConversation()) {
        this.messages.update(msgs => [...msgs, {
          id: incomingMsg.messageId || incomingMsg.id,
          sender: incomingMsg.senderId === this.userId ? 'me' : 'them',
          text: incomingMsg.content || incomingMsg.text,
          time: new Date(incomingMsg.sentAt || Date.now()).toLocaleTimeString(),
          type: incomingMsg.messageType === 'file' ? 'file' : 'text',
          read: incomingMsg.isRead || false
        }]);
      }

      // Update the conversations sidebar preview text dynamically
      this.conversations.update(convs => convs.map(c => {
        if (c.id === incomingMsg.conversationId) {
          return { ...c, lastMessage: incomingMsg.content, time: new Date().toLocaleTimeString() };
        }
        return c;
      }));
    });
  }

  ngOnDestroy(): void {
    if (this.messageSub) this.messageSub.unsubscribe();
    this.chatService.stopConnection();
  }

  loadConversations(): void {
    if (!this.userId) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.chatService.getUserConversations(this.userId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        const convs = Array.isArray(data) ? data : [];

        this.conversations.set(convs.map((c: any) => {
          // participants is an array; pick the one that is NOT the current user
          const participants: any[] = c.participants || [];
          const other = participants.find((p: any) => p.userId !== this.userId) || participants[0] || {};
          const fullName = `${other.firstName || ''} ${other.lastName || ''}`.trim() || 'User';
          return {
            id: c.conversationId || c.id,
            name: fullName,
            role: other.role || other.specialization || '',
            avatar: this.getInitials(fullName),
            avatarUrl: other.profilePictureUrl || other.profilePicture || null,
            lastMessage: c.lastMessage || 'Start a conversation',
            time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            unread: c.unreadCount || 0,
            online: false
          };
        }));

        if (convs.length > 0) {
          this.selectConversation(this.conversations()[0].id);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading conversations:', error);
      }
    });
  }

  selectConversation(id: string): void {
    this.activeConversation.set(id);
    this.loadMessages(id);
  }

  loadMessages(conversationId: string): void {
    this.chatService.getMessages(conversationId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        const msgs = Array.isArray(data) ? data : [];
        this.messages.set(msgs.map((m: any) => ({
          id: m.messageId || m.id,
          sender: m.senderId === this.userId ? 'me' : 'them',
          text: m.content || m.text,
          time: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : '',
          type: m.messageType === 'file' ? 'file' : 'text',
          read: m.isRead || false
        })));
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.errorMessage.set('Failed to load thread history.');
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    const convId = this.activeConversation();
    if (!text || !convId) return;

    // Send through SignalR WebSockets (Instant, No standard HTTP Request blocking)
    this.chatService.sendMessageToHub(convId, text, [])
      .then(() => {
        // We don't manually push it here anymore! 
        // The backend Hub acknowledges creation and bounces the 'ReceiveMessage' event back to us and the other person simultaneously.
        // Our `.subscribe()` from `ngOnInit` will naturally catch it and render it.
        this.newMessage.set('');
      })
      .catch((err) => {
        console.error("Failed to send message via SignalR:", err);
      });
  }

  activeConv(): Conversation | undefined {
    return this.conversations().find(c => c.id === this.activeConversation());
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}