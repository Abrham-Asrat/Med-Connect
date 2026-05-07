import { Component, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
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
  type: 'text' | 'file' | 'system' | 'voice';
  read: boolean;
  audioUrl?: string;
  audioDuration?: string;
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
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  newMessage = signal('');
  activeConversation = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showProfile = signal(false);
  showLeftSidebar = signal(true);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);

  userId = this.authService.currentUser()?.userId || localStorage.getItem('userId') || '';

  private messageSub: Subscription | undefined;
  private shouldScroll = false;

  // Expose Math to template
  readonly Math = Math;

  // Voice recording state
  isRecording = signal(false);
  recordingSeconds = signal(0);
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private recordingTimer: any = null;

  ngOnInit(): void {
    // 🔌 PREVIEW MODE — disconnected from backend
    this.loadDummyData();
  }

  ngOnDestroy(): void {
    if (this.messageSub) this.messageSub.unsubscribe();
  }

  ngAfterViewChecked(): void {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch (e) { /* ignore */ }
  }

  loadDummyData(): void {
    const dummyConvs: Conversation[] = [
      {
        id: '1',
        name: 'Dr. Abrham Asrat',
        role: 'Cardiologist',
        avatar: 'DA',
        avatarUrl: undefined,
        lastMessage: 'Your test results look great! Keep it up.',
        time: '10:32 AM',
        unread: 0,
        online: true
      },
      {
        id: '2',
        name: 'Dr. Sara Mohammed',
        role: 'General Physician',
        avatar: 'SM',
        avatarUrl: undefined,
        lastMessage: 'Let me know if you feel any nausea.',
        time: 'Yesterday',
        unread: 2,
        online: false
      },
      {
        id: '3',
        name: 'Dr. Yonas Tadesse',
        role: 'Neurologist',
        avatar: 'YT',
        avatarUrl: undefined,
        lastMessage: 'Please take your medication on time.',
        time: 'Mon',
        unread: 0,
        online: true
      },
      {
        id: '4',
        name: 'Med-Connect Support',
        role: 'Help Center',
        avatar: 'MC',
        avatarUrl: undefined,
        lastMessage: 'How can we help you today?',
        time: '2 days ago',
        unread: 1,
        online: true
      }
    ];
    this.conversations.set(dummyConvs);
    this.selectConversation('1');
  }

  loadConversations(): void { /* disabled in preview mode */ }

  selectConversation(id: string): void {
    this.activeConversation.set(id);
    this.showProfile.set(false);
    this.loadMessages(id);
  }

  toggleProfile(): void {
    this.showProfile.update(v => !v);
  }

  toggleLeftSidebar(): void {
    this.showLeftSidebar.update(v => !v);
  }

  loadMessages(conversationId: string): void {
    const allMessages: Record<string, Message[]> = {
      '1': [
        { id: 'm0', sender: 'system', text: 'Today, May 7 2026', time: '', type: 'system', read: true },
        { id: 'm1', sender: 'them', text: 'Good morning! How have you been feeling since our last visit?', time: '10:00 AM', type: 'text', read: true },
        { id: 'm2', sender: 'me', text: 'Much better, thank you doctor! The chest pains have reduced significantly.', time: '10:05 AM', type: 'text', read: true },
        { id: 'm3', sender: 'them', text: 'That\'s great to hear! Your ECG results from yesterday\'s scan were also very encouraging.', time: '10:10 AM', type: 'text', read: true },
        { id: 'm4', sender: 'me', text: 'That really put my mind at ease. Should I continue with the same medication?', time: '10:20 AM', type: 'text', read: true },
        { id: 'm5', sender: 'them', text: 'Yes, please continue Amlodipine 5mg once a day. Avoid salty foods and try to walk 30 minutes daily.', time: '10:25 AM', type: 'text', read: true },
        { id: 'm6', sender: 'me', text: 'Understood! I will follow that strictly.', time: '10:28 AM', type: 'text', read: true },
        { id: 'm7', sender: 'them', text: 'Your test results look great! Keep it up. See you in two weeks. 😊', time: '10:32 AM', type: 'text', read: true },
      ],
      '2': [
        { id: 'm8', sender: 'system', text: 'Yesterday', time: '', type: 'system', read: true },
        { id: 'm9', sender: 'them', text: 'I have reviewed your prescription. The antibiotic course is for 7 days.', time: '09:00 AM', type: 'text', read: true },
        { id: 'm10', sender: 'me', text: 'Should I take it with food?', time: '09:10 AM', type: 'text', read: true },
        { id: 'm11', sender: 'them', text: 'Yes, always take it with food to avoid stomach upset.', time: '09:15 AM', type: 'text', read: true },
        { id: 'm12', sender: 'them', text: 'Let me know if you feel any nausea or allergic reactions.', time: '09:20 AM', type: 'text', read: false },
      ],
      '3': [
        { id: 'm13', sender: 'system', text: 'Monday, May 5', time: '', type: 'system', read: true },
        { id: 'm14', sender: 'them', text: 'Hello! I have reviewed your MRI scan. There are no major abnormalities noted.', time: '02:00 PM', type: 'text', read: true },
        { id: 'm15', sender: 'me', text: 'Such a relief to hear! What about the occasional headaches?', time: '02:10 PM', type: 'text', read: true },
        { id: 'm16', sender: 'them', text: 'They could be tension-related. Try to stay hydrated and reduce screen time.', time: '02:15 PM', type: 'text', read: true },
        { id: 'm17', sender: 'them', text: 'Please take your medication on time. Book a follow-up in 4 weeks.', time: '02:30 PM', type: 'text', read: true },
      ],
      '4': [
        { id: 'm18', sender: 'system', text: 'Welcome to Med-Connect!', time: '', type: 'system', read: true },
        { id: 'm19', sender: 'them', text: 'Hi there! 👋 Welcome to Med-Connect Support.', time: '2 days ago', type: 'text', read: true },
        { id: 'm20', sender: 'them', text: 'How can we help you today?', time: '2 days ago', type: 'text', read: false },
      ]
    };
    this.messages.set(allMessages[conversationId] || []);
    this.shouldScroll = true;
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;

    // Local echo — no backend
    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text',
      read: false
    };
    this.messages.update(msgs => [...msgs, newMsg]);
    this.newMessage.set('');
    this.shouldScroll = true;

    // Update sidebar preview
    this.conversations.update(convs => convs.map(c =>
      c.id === this.activeConversation() ? { ...c, lastMessage: text, time: 'Just now', unread: 0 } : c
    ));
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

  // ── Voice Recording ──────────────────────────────────────────────────────────

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(blob);
        const duration = this.formatTime(this.recordingSeconds());

        const voiceMsg: Message = {
          id: Date.now().toString(),
          sender: 'me',
          text: '',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'voice',
          read: false,
          audioUrl,
          audioDuration: duration
        };

        this.messages.update(msgs => [...msgs, voiceMsg]);
        this.conversations.update(convs => convs.map(c =>
          c.id === this.activeConversation() ? { ...c, lastMessage: '🎤 Voice message', time: 'Just now' } : c
        ));
        this.shouldScroll = true;

        // Stop all tracks to release the microphone
        stream.getTracks().forEach(t => t.stop());
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingSeconds.set(0);

      this.recordingTimer = setInterval(() => {
        this.recordingSeconds.update(s => s + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access is required to send voice messages.');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    clearInterval(this.recordingTimer);
    this.isRecording.set(false);
    this.recordingSeconds.set(0);
  }

  cancelRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.ondataavailable = null; // discard data
      this.mediaRecorder.onstop = null;
      this.mediaRecorder.stop();
    }
    clearInterval(this.recordingTimer);
    this.isRecording.set(false);
    this.recordingSeconds.set(0);
    this.audioChunks = [];
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}