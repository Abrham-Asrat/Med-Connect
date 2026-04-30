import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../../core/services/signalr.service';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file' | 'system';
  fileName?: string;
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
    .msg-sent .file-attachment { border: 1px solid rgba(255,255,255,0.3); }
    .msg-received .file-attachment { border: 1px solid #E5E7EB; }
    .file-attachment { border-radius: 8px; padding: 10px; }
    .typing-dot { width: 8px; height: 8px; border-radius: 50%; background: #078930; display: inline-block; animation: typingBounce 1.4s infinite ease-in-out; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-10px); } }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private subscriptions: Subscription[] = [];

  newMessage = signal('');
  activeConversation = signal<string | null>('1');
  connectionState = this.signalRService.connectionState;
  isTyping = signal(false);
  typingTimeout: any;

  conversations = signal<Conversation[]>([
    { id: '1', name: 'Dr. Sarah Johnson', role: 'Cardiologist', avatar: 'SJ', lastMessage: 'Your test results are normal', time: '2:30 PM', unread: 2, online: true },
    { id: '2', name: 'Dr. Abebe Kebede', role: 'Neurologist', avatar: 'AK', lastMessage: 'Please schedule a follow-up', time: 'Yesterday', unread: 0, online: false },
    { id: '3', name: 'Dr. Tirunesh Desta', role: 'Dermatologist', avatar: 'TD', lastMessage: 'The cream should help with...', time: 'Apr 15', unread: 0, online: true },
    { id: '4', name: 'Dr. Yonas Tadesse', role: 'Pediatrician', avatar: 'YT', lastMessage: 'Remember the vaccination schedule', time: 'Apr 10', unread: 1, online: false },
  ]);

  messages = signal<Message[]>([
    { id: '1', sender: 'them', text: 'Hello! How can I help you today?', time: '2:15 PM', type: 'text', read: true },
    { id: '2', sender: 'me', text: 'Hi Dr. Johnson, I received my test results but I\'m not sure I understand them.', time: '2:18 PM', type: 'text', read: true },
    { id: '3', sender: 'them', text: 'I\'d be happy to explain. Your blood work looks normal overall. Your cholesterol is slightly elevated but still within acceptable range.', time: '2:20 PM', type: 'text', read: true },
    { id: '4', sender: 'me', text: 'That\'s reassuring. Should I make any lifestyle changes?', time: '2:25 PM', type: 'text', read: true },
    { id: '5', sender: 'them', text: 'I\'d recommend 30 minutes of walking daily and reducing red meat intake. Here\'s a diet plan I recommend:', time: '2:28 PM', type: 'text', read: true },
    { id: '6', sender: 'them', text: 'Diet_Plan.pdf', time: '2:28 PM', type: 'file', fileName: 'Diet_Plan.pdf', read: true },
    { id: '7', sender: 'system', text: '📋 Appointment confirmed for May 15, 2026 at 2:30 PM', time: '2:30 PM', type: 'system', read: true },
  ]);

  ngOnInit(): void {
    // Subscribe to real-time messages
    this.subscriptions.push(
      this.signalRService.messageReceived$.subscribe(msg => {
        if (msg.conversationId === this.activeConversation()) {
          this.messages.update(msgs => [...msgs, {
            id: crypto.randomUUID(),
            sender: 'them',
            text: msg.message,
            time: msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text',
            read: true
          }]);
          this.updateLastMessage(msg.conversationId, msg.message);
        } else {
          // Increment unread count for other conversations
          this.conversations.update(convs =>
            convs.map(c => c.id === msg.conversationId
              ? { ...c, unread: c.unread + 1, lastMessage: msg.message, time: 'Just now' }
              : c
            )
          );
        }
      })
    );

    // Subscribe to typing indicators
    this.subscriptions.push(
      this.signalRService.typingReceived$.subscribe(typing => {
        if (typing.conversationId === this.activeConversation()) {
          this.isTyping.set(typing.isTyping);
        }
      })
    );

    // Subscribe to user online/offline status
    this.subscriptions.push(
      this.signalRService.userStatusChanged$.subscribe(status => {
        this.conversations.update(convs =>
          convs.map(c => c.id === status.userId ? { ...c, online: status.isOnline } : c)
        );
      })
    );

    // Join initial conversation
    if (this.activeConversation()) {
      this.signalRService.joinConversation(this.activeConversation()!);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    if (this.activeConversation()) {
      this.signalRService.leaveConversation(this.activeConversation()!);
    }
  }

  selectConversation(id: string): void {
    if (this.activeConversation() === id) return;

    // Leave old conversation
    if (this.activeConversation()) {
      this.signalRService.leaveConversation(this.activeConversation()!);
    }

    this.activeConversation.set(id);

    // Join new conversation
    this.signalRService.joinConversation(id);

    // Mark as read
    this.conversations.update(convs =>
      convs.map(c => c.id === id ? { ...c, unread: 0 } : c)
    );
  }

  activeConv(): Conversation | undefined {
    return this.conversations().find(c => c.id === this.activeConversation());
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    const convId = this.activeConversation();
    if (!text || !convId) return;

    // Send via SignalR to backend
    this.signalRService.sendMessage(convId, text);

    // Add to local messages immediately (optimistic update)
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(),
      sender: 'me',
      text,
      time: timeStr,
      type: 'text',
      read: false
    }]);

    this.newMessage.set('');

    // Stop typing indicator
    this.signalRService.sendTypingIndicator(convId, false);
    clearTimeout(this.typingTimeout);

    // Update conversation last message
    this.updateLastMessage(convId, text);
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onTyping(): void {
    const convId = this.activeConversation();
    if (!convId) return;

    // Send typing indicator
    this.signalRService.sendTypingIndicator(convId, true);

    // Auto-stop typing after 2 seconds of inactivity
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => {
      this.signalRService.sendTypingIndicator(convId, false);
    }, 2000);
  }

  sendFile(): void {
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx';
    input.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const convId = this.activeConversation();
        if (!convId) return;

        // Add file message locally
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        this.messages.update(msgs => [...msgs, {
          id: crypto.randomUUID(),
          sender: 'me',
          text: file.name,
          time: timeStr,
          type: 'file',
          fileName: file.name,
          read: false
        }]);

        // Send file info via SignalR
        this.signalRService.sendMessage(convId, `📎 Shared file: ${file.name}`);
        this.updateLastMessage(convId, `📎 ${file.name}`);
      }
    };
    input.click();
  }

  private updateLastMessage(convId: string, message: string): void {
    const truncated = message.length > 30 ? message.substring(0, 30) + '...' : message;
    this.conversations.update(convs =>
      convs.map(c => c.id === convId
        ? { ...c, lastMessage: truncated, time: 'Just now' }
        : c
      )
    );
  }
}