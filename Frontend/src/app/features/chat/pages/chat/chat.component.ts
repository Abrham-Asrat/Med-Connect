import { Component, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ReviewService } from '../../../../core/services/review.service';
import { Subscription } from 'rxjs';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file' | 'system' | 'voice' | 'review_prompt';
  read: boolean;
  audioUrl?: string;
  audioDuration?: string;
  rating?: number;
  reviewText?: string;
  prescriptionDetails?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
  };
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
  status?: 'scheduled' | 'active' | 'follow_up' | 'closed';
  otherUserId?: string;
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
  private reviewService = inject(ReviewService);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  newMessage = signal('');
  markAsResolved(): void {
    if (this.userRole !== 'Doctor') return;
    const active = this.activeConversation();
    if (!active) return;
    this.conversations.update(convs => convs.map(c =>
      c.id === active ? { ...c, status: 'follow_up' } : c
    ));
    const now = new Date().toLocaleTimeString();
    this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'system', text: 'You marked this consultation as resolved. The patient has 24 hours to accept or ask follow-up questions.', time: now, type: 'system', read: true }]);
    this.shouldScroll = true;
  }

  togglePrescriptionForm(): void {
    this.showPrescriptionForm.update(v => !v);
  }

  sendPrescription(): void {
    const rx = this.prescriptionModel();
    if (!rx.medication || !rx.dosage) return;

    const activeConvId = this.activeConversation();
    const activeConvEntity = this.activeConv();
    if (!activeConvId || !activeConvEntity) return;

    // Send the structured payload via WebSocket
    this.chatService.sendMessageToHub(
      activeConvId,
      'Official Prescription Issued',
      [],
      'prescription',
      null,
      null,
      {
        medication: rx.medication,
        dosage: rx.dosage,
        frequency: rx.frequency,
        duration: rx.duration
      },
      activeConvEntity.otherUserId
    ).then(() => {
      // Logic managed by inbound socket stream
    }).catch(err => {
      console.error('Prescription delivery failed:', err);
      this.errorMessage.set('Prescription network delivery failed.');
    });

    // Reset state
    this.prescriptionModel.set({ medication: '', dosage: '', frequency: '', duration: '' });
    this.showPrescriptionForm.set(false);
  }

  updatePrescription(field: keyof ReturnType<typeof this.prescriptionModel>, value: string): void {
    this.prescriptionModel.update(m => ({ ...m, [field]: value }));
  }

  blockUser(): void {
    const activeConvId = this.activeConversation();
    if (!activeConvId) return;

    if (confirm('Are you sure you want to permanently block this user? This will lock the consultation interface.')) {
      this.chatService.blockConversation(activeConvId, this.userId).subscribe({
        next: () => {
          this.activeConversation.set(null);
          this.showProfile.set(false);
          this.loadConversations(); // Re-fetch to clear locked states
          this.errorMessage.set('User blocked successfully.');
        },
        error: (err: any) => {
          console.error(err);
          this.errorMessage.set('Failed to block user.');
        }
      });
    }
  }

  // Filter conversations
  searchTerm = signal('');
  activeConversation = signal<string | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showProfile = signal(false);
  showLeftSidebar = signal(true);

  conversations = signal<Conversation[]>([]);
  messages = signal<Message[]>([]);

  userId = this.authService.currentUser()?.userId || localStorage.getItem('userId') || '';
  userRole = (() => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr).role : 'Patient';
    } catch {
      return 'Patient';
    }
  })();

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

  // Prescription state
  showPrescriptionForm = signal(false);
  prescriptionModel = signal({ medication: '', dosage: '', frequency: '', duration: '' });

  // Video Consultation Phase
  isVideoCallActive = signal(false);

  ngOnInit(): void {
    if (!this.userId) {
      this.errorMessage.set('User authentication missing. Running in structurally offline mode.');
      this.conversations.set([]);
      this.messages.set([]);
      return;
    }

    // 🔌 Connect directly to .NET SignalR Hub
    this.chatService.startConnection().then(() => {
      this.loadConversations();

      // Subscribe to real-time incoming websocket pushes
      this.messageSub = this.chatService.messageReceived$.subscribe((data: any) => {
        // Broadcast routing: ensure message belongs to the open chat room
        if (data.conversationId === this.activeConversation()) {
          const newMsg: Message = {
            id: data.messageId || crypto.randomUUID(),
            sender: data.senderId === this.userId ? 'me' : 'them',
            text: data.messageText || '',
            time: new Date(data.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: data.type || 'text', // Resolves standard, voice, prescription, and system types matching our UI enums
            read: false,
            // Safety bindings for complex entities
            audioUrl: data.audioUrl,
            audioDuration: data.audioDuration,
            prescriptionDetails: data.prescriptionDetails
          };
          this.messages.update(msgs => [...msgs, newMsg]);
          this.shouldScroll = true;
        }

        // Auto-refresh sidebar inbox to show latest text globally
        this.loadConversations();
      });
    }).catch(err => {
      console.error('Backend SignalR fully disconnected. Real-time features offline.', err);
      this.errorMessage.set('Warning: Operating offline. Medical Hub not responding.');
    });
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

  // Dummy data fully purged as per user request to use real backend only.

  loadConversations(): void {
    if (!this.userId) return;
    this.isLoading.set(true);

    this.chatService.getUserConversations(this.userId).subscribe({
      next: (res) => {
        const payload = res.data || res;
        if (!payload || payload.length === 0) {
          // DB returned empty array - explicitly set an empty state, do not load mock data
          this.conversations.set([]);
          this.isLoading.set(false);
          return;
        }

        // Map Backend API Schema to Frontend Component Schema
        const mappedConvs: Conversation[] = payload.map((c: any) => {
          const otherMember = c.conversationMemberships?.find((m: any) => m.userId !== this.userId)?.user;
          return {
            id: c.conversationId,
            name: otherMember ? `${otherMember.firstName} ${otherMember.lastName}` : 'Unknown Patient',
            role: otherMember?.role || 'Patient',
            avatar: otherMember ? `${otherMember.firstName?.charAt(0)}${otherMember.lastName?.charAt(0)}` : '?',
            avatarUrl: otherMember?.profilePicture,
            lastMessage: c.messages?.length > 0 ? c.messages[c.messages.length - 1].messageText : '',
            time: c.lastMessageAt ? new Date(c.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'New',
            unread: 0, // Expand logic based on message isRead flag matching membership
            online: false,
            status: c.status || 'active',
            otherUserId: otherMember?.userId
          };
        });

        this.conversations.set(mappedConvs);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load conversations exclusively from API', err);
        this.isLoading.set(false);
        this.errorMessage.set('Could not load chat data. Please check connection.');
      }
    });
  }

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

  toggleVideoCall(): void {
    this.isVideoCallActive.update(v => !v);
  }

  submitReview(msg: Message): void {
    if (!msg.rating) return;

    const activeConvId = this.activeConversation();
    const activeConvEntity = this.activeConv();
    if (!activeConvId || !activeConvEntity) return;

    // Immediately replace the interactive review prompt with a "submitting..." badge so the user can't spam it
    this.messages.update(msgs => msgs.map(m =>
      m.id === msg.id ? { ...m, type: 'system', text: `Submitting your ${msg.rating}-Star review...` } : m
    ));

    // Determine IDs based on role
    const doctorId = this.userRole === 'Doctor' ? this.userId : activeConvEntity.otherUserId;
    const patientId = this.userRole === 'Patient' ? this.userId : activeConvEntity.otherUserId;

    if (!doctorId || !patientId) return;

    const reviewData = {
      doctorId: doctorId,
      patientId: patientId,
      starRating: msg.rating,
      reviewText: msg.reviewText || ''
    };

    this.reviewService.postReview(reviewData).subscribe({
      next: () => {
        // Drop network receipt to active chat stream via Socket
        this.chatService.sendMessageToHub(
          activeConvId,
          `Thank you! You rated your experience ${msg.rating} Stars: "${msg.reviewText || 'No comment'}"`,
          [],
          'system'
        ).then(() => {
          // Remove the "submitting..." placeholder from our local array, hub broadcast will append actual receipt
          this.messages.update(msgs => msgs.filter(m => m.id !== msg.id));
        }).catch(() => {
          // Fallback UI mutation if socket fails but backend SQL push succeeded
          this.messages.update(msgs => msgs.map(m =>
            m.id === msg.id ? { ...m, type: 'system', text: `Success: Review submitted securely.` } : m
          ));
        });
      },
      error: (err) => {
        console.error('Review service failed', err);
        // Inform user of failure
        this.messages.update(msgs => msgs.map(m =>
          m.id === msg.id ? { ...m, type: 'system', text: `Error submitting review. Please try again later.` } : m
        ));
      }
    });
  }

  acceptAndClose(): void {
    const active = this.activeConversation();
    if (!active) return;

    // Update logic to transition to 'closed'
    this.conversations.update(convs => convs.map(c =>
      c.id === active ? { ...c, status: 'closed' } : c
    ));

    const now = new Date().toLocaleTimeString();

    // Push the system resolution message + the review prompt
    this.messages.update(msgs => [
      ...msgs,
      { id: crypto.randomUUID(), sender: 'system', text: 'You confirmed issues are resolved. Consultation Closed.', time: now, type: 'system', read: true },
      { id: crypto.randomUUID(), sender: 'system', text: 'Please rate your experience with the doctor.', time: now, type: 'review_prompt', read: true }
    ]);

    this.shouldScroll = true;
  }

  loadMessages(conversationId: string): void {
    if (!this.userId) return;

    // 🔌 Live Network Request
    this.chatService.getMessages(conversationId).subscribe({
      next: (res) => {
        const payload = res.data || res;

        const mappedMsgs: Message[] = payload.map((m: any) => ({
          id: m.messageId,
          sender: m.senderId === this.userId ? 'me' : 'them',
          text: m.messageText || '',
          time: new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: m.type || (m.audioUrl ? 'voice' : 'text'),
          read: m.isRead || false,
          audioUrl: m.audioUrl,
          audioDuration: m.audioDuration,
          prescriptionDetails: m.prescriptionDetails
        }));

        this.messages.set(mappedMsgs);
        this.shouldScroll = true;
      },
      error: (err) => {
        console.warn('Live message fetch failed. Hub disconnected.', err);
      }
    });
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;

    this.isRecording.set(false);
    this.newMessage.set('');
    this.errorMessage.set(null);

    const activeConvId = this.activeConversation();
    if (!activeConvId) return;

    // 🔌 Live Network Request: Send through connected SignalR Socket
    this.chatService.sendMessageToHub(activeConvId, text, [])
      .then(() => {
        // We do not append locally anymore! The hub handles broadcast propagation.
        // It will trigger messageReceived$.subscribe(data => this.messages.update()) natively!
      })
      .catch(err => {
        console.error('SignalR Hub routing failed:', err);
        this.errorMessage.set('Connection error: Message delivery failed.');
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