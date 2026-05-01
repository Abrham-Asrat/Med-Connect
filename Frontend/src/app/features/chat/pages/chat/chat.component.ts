import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';

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
  avatar: string;
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
  styles: [`
    .chat-container { height: calc(100vh - 140px); }
    .conversation-list { width: 340px; min-width: 340px; }
    .chat-area { flex: 1; min-width: 0; }
    .conv-item { cursor: pointer; transition: all 0.2s; border-left: 3px solid transparent; }
    .conv-item:hover, .conv-item.active { background: #E8F5EC; border-left-color: #078930; }
    .msg-sent { background: #078930; color: white; border-radius: 16px 16px 4px 16px; max-width: 75%; }
    .msg-received { background: #F8F9FA; border: 1px solid #E5E7EB; border-radius: 16px 16px 16px 4px; max-width: 75%; }
    .msg-system { background: #FFF8E1; border-radius: 12px; font-size: 13px; }
    .online-dot { width: 10px; height: 10px; border-radius: 50%; background: #078930; position: absolute; bottom: 0; right: 0; border: 2px solid white; }
  `]
})
export class ChatComponent implements OnInit {
  private chatService = inject(ChatService);

  newMessage = signal('');
  activeConversation = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);
  userId = localStorage.getItem('userId') || '';

  ngOnInit(): void {
    this.loadConversations();
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
        
        this.conversations.set(convs.map((c: any) => ({
          id: c.conversationId || c.id,
          name: c.participantName || 'User',
          role: c.participantRole || '',
          avatar: (c.participantName || 'U').charAt(0),
          lastMessage: c.lastMessage || 'Start a conversation',
          time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString() : '',
          unread: c.unreadCount || 0,
          online: c.isOnline || false
        })));

        if (convs.length > 0) {
          this.selectConversation(this.conversations()[0].id);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading conversations:', error);
        // Show mock data if API fails
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    this.conversations.set([
      { id: '1', name: 'Dr. Sarah Johnson', role: 'Cardiologist', avatar: 'SJ', lastMessage: 'Your results are normal', time: '2:30 PM', unread: 2, online: true },
      { id: '2', name: 'Dr. Abebe Kebede', role: 'Neurologist', avatar: 'AK', lastMessage: 'Schedule a follow-up', time: 'Yesterday', unread: 0, online: false },
    ]);
    if (this.conversations().length > 0) {
      this.selectConversation(this.conversations()[0].id);
    }
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
        // Mock messages
        this.messages.set([
          { id: '1', sender: 'them', text: 'Hello! How can I help you?', time: '2:15 PM', type: 'text', read: true },
          { id: '2', sender: 'me', text: 'Hi, I have a question about my appointment.', time: '2:18 PM', type: 'text', read: true },
        ]);
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    const convId = this.activeConversation();
    if (!text || !convId) return;

    // Add locally immediately
    const now = new Date().toLocaleTimeString();
    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(),
      sender: 'me', text, time: now, type: 'text', read: false
    }]);
    this.newMessage.set('');
  }

  activeConv(): Conversation | undefined {
    return this.conversations().find(c => c.id === this.activeConversation());
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }
}