import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../../core/services/chat.service';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file';
  read: boolean;
}

interface PatientConversation {
  id: string;
  name: string;
  reason: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

@Component({
  selector: 'app-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './doctor-chat.component.html',
  styleUrls: ['../chat.component.scss']
})
export class DoctorChatComponent implements OnInit {
  private chatService = inject(ChatService);

  userId = JSON.parse(localStorage.getItem('user') || '{}').userId || '';
  activeConversation = signal<string | null>(null);
  newMessage = signal('');
  searchTerm = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  conversations = signal<PatientConversation[]>([]);
  messages = signal<Message[]>([]);

  ngOnInit(): void {
    if (this.userId) this.loadConversations();
  }

  loadConversations(): void {
    this.isLoading.set(true);
    this.chatService.getUserConversations(this.userId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        if (Array.isArray(data) && data.length > 0) {
          this.conversations.set(data.map((c: any) => ({
            id: c.conversationId || c.id,
            name: c.participantName || 'Patient',
            reason: c.participantRole || '',
            avatar: (c.participantName || 'P').charAt(0),
            lastMessage: c.lastMessage || 'Start conversation',
            time: c.lastMessageTime ? new Date(c.lastMessageTime).toLocaleTimeString() : '',
            unread: c.unreadCount || 0,
            online: c.isOnline || false
          })));
          if (this.conversations().length > 0) this.selectConversation(this.conversations()[0].id);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error:', error);
        this.loadMockData();
      }
    });
  }

  loadMockData(): void {
    this.conversations.set([
      { id: '1', name: 'Abebe Tesfaye', reason: 'Hypertension', avatar: 'AT', lastMessage: 'Thank you doctor', time: '10:30 AM', unread: 2, online: true },
      { id: '2', name: 'Meron Haile', reason: 'Migraine', avatar: 'MH', lastMessage: 'Should I continue?', time: 'Yesterday', unread: 0, online: false },
    ]);
    if (this.conversations().length > 0) this.selectConversation(this.conversations()[0].id);
  }

  selectConversation(id: string): void {
    this.activeConversation.set(id);
    this.loadMessages(id);
  }

  loadMessages(conversationId: string): void {
    this.chatService.getMessages(conversationId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.messages.set(Array.isArray(data) ? data.map((m: any) => ({
          id: m.messageId || m.id,
          sender: m.senderId === this.userId ? 'me' : 'them',
          text: m.content || m.text || '',
          time: m.sentAt ? new Date(m.sentAt).toLocaleTimeString() : '',
          type: m.messageType === 'file' ? 'file' : 'text',
          read: m.isRead || false
        })) : []);
      },
      error: () => this.messages.set([])
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;
    const now = new Date().toLocaleTimeString();
    this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'me', text, time: now, type: 'text', read: false }]);
    this.newMessage.set('');
  }

  activeConv(): PatientConversation | undefined { return this.conversations().find(c => c.id === this.activeConversation()); }
  filteredConversations(): PatientConversation[] {
    const t = this.searchTerm().toLowerCase();
    return t ? this.conversations().filter(c => c.name.toLowerCase().includes(t)) : this.conversations();
  }
}