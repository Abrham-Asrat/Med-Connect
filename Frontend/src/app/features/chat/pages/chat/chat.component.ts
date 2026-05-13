import { Component, signal, inject, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewChecked, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../../../core/services/chat.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ReviewService } from '../../../../core/services/review.service';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file' | 'system' | 'voice' | 'review_prompt' | 'image';
  read: boolean;
  audioUrl?: string;
  audioDuration?: string;
  waveformHeights?: number[];
  imageUrl?: string;
  imageFileName?: string;
  rating?: number;
  reviewText?: string;
  prescriptionDetails?: {
    medication: string;
    dosage: string;
    frequency: string;
    duration: string;
    doctorName?: string;      // filled at map time from conversation participant data
    doctorSpecialty?: string; // filled at map time if available
    issuedAt?: string;        // human-readable date string
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);
  private reviewService = inject(ReviewService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('messagesContainer') private messagesContainer!: ElementRef;

  newMessage = signal('');
  markAsResolved(): void {
    if (this.userRole !== 'Doctor') return;
    const activeConvId = this.activeConversation();
    if (!activeConvId) return;

    // Optimistically update UI immediately
    this.conversations.update(convs => convs.map(c =>
      c.id === activeConvId ? { ...c, status: 'follow_up' } : c
    ));

    // Persist to backend — this also broadcasts the system message to the patient via SignalR
    this.chatService.updateConversationStatus(activeConvId, this.userId, 'follow_up').subscribe({
      next: () => {
        // System message arrives via SignalR broadcast from the server — no local append needed
      },
      error: (err: any) => {
        console.error('Failed to mark as resolved:', err);
        // Roll back optimistic update
        this.conversations.update(convs => convs.map(c =>
          c.id === activeConvId ? { ...c, status: 'active' } : c
        ));
        this.errorMessage.set(err?.error?.message || 'Failed to mark consultation as resolved. Please try again.');
      }
    });
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

  /** Conversations filtered by the search term */
  filteredConversations = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.conversations();
    return this.conversations().filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.lastMessage.toLowerCase().includes(term) ||
      c.role.toLowerCase().includes(term)
    );
  });

  /** Total unread message count across all conversations */
  totalUnread = computed(() =>
    this.conversations().reduce((sum, c) => sum + (c.unread || 0), 0)
  );

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
  private activeStream: MediaStream | null = null; // kept so cancelRecording can stop tracks

  // Per-message playing state — tracks which message audio is currently playing
  playingMessageId = signal<string | null>(null);

  // Prescription state
  showPrescriptionForm = signal(false);
  prescriptionModel = signal({ medication: '', dosage: '', frequency: '', duration: '' });

  // Video Consultation Phase
  isVideoCallActive = signal(false);

  // Image lightbox
  lightboxUrl = signal<string | null>(null);
  openImagePreview(url: string): void { this.lightboxUrl.set(url); }
  closeImagePreview(): void { this.lightboxUrl.set(null); }

  // Normalize a raw profilePicture value (base64 string, URL, or empty) into
  // a valid <img src> value. Returns undefined if there's nothing to show.
  private normalizeAvatar(raw: string | null | undefined): string | undefined {
    if (!raw || raw.trim() === '') return undefined;

    // Already a full URL (http/https) or data URI — use as-is
    if (raw.startsWith('http') || raw.startsWith('data:')) return raw;

    // Raw base64 — detect MIME type from the magic bytes at the start of the string
    // PNG starts with iVBOR, JPEG starts with /9j/, GIF starts with R0lG, WebP starts with UklG
    let mime = 'image/jpeg'; // safe default
    if (raw.startsWith('iVBOR')) mime = 'image/png';
    else if (raw.startsWith('R0lG')) mime = 'image/gif';
    else if (raw.startsWith('UklG')) mime = 'image/webp';
    else if (raw.startsWith('/9j/')) mime = 'image/jpeg';

    return `data:${mime};base64,${raw}`;
  }

  /** Generate stable waveform bar heights once per voice message to avoid NG0100. */
  private generateWaveform(bars = 12): number[] {
    return Array.from({ length: bars }, () => Math.random() * 16 + 6);
  }

  private mapMessageType(raw: any): Message['type'] {
    if (typeof raw === 'string') {
      const lower = raw.toLowerCase();
      if (lower === 'voice') return 'voice';
      if (lower === 'image') return 'image';
      if (lower === 'system') return 'system';
      if (lower === 'review_prompt') return 'review_prompt';
      if (lower === 'prescription') return 'text'; // prescription rendered via prescriptionDetails
      return 'text';
    }
    // Numeric enum: text=0, voice=1, system=2, review_prompt=3, prescription=4
    switch (Number(raw)) {
      case 1: return 'voice';
      case 2: return 'system';
      case 3: return 'review_prompt';
      default: return 'text';
    }
  }

  ngOnInit(): void {
    // Re-read userId here in case it wasn't available at field init time
    if (!this.userId) {
      this.userId = this.authService.currentUser()?.userId || localStorage.getItem('userId') || '';
    }

    if (!this.userId) {
      this.errorMessage.set('User authentication missing. Please log in again.');
      this.conversations.set([]);
      this.messages.set([]);
      return;
    }

    // Capture ?startChatWith once and clear from URL immediately
    const startChatWith = this.route.snapshot.queryParamMap.get('startChatWith');
    const appointmentId  = this.route.snapshot.queryParamMap.get('appointmentId');
    if (startChatWith) {
      this.pendingStartChatWith = startChatWith;
      if (appointmentId) this.pendingAppointmentId = appointmentId;
      this.router.navigate([], {
        queryParams: { startChatWith: null, appointmentId: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    // Connect to SignalR hub
    this.chatService.startConnection().then(() => {
      this.loadConversations();

      // Subscribe to real-time incoming messages
      this.messageSub = this.chatService.messageReceived$.subscribe((data: any) => {
        const incomingConvId: string = data.conversationId || data.ConversationId || '';
        const senderId: string = data.senderId || data.SenderId || '';

        // 1. Append to active chat if it belongs to the open conversation
        if (incomingConvId && incomingConvId === this.activeConversation()) {
          const msgType = this.mapMessageType(data.type ?? data.Type);

          // For voice messages, reconstruct audioUrl from file data if not directly provided
          let audioUrl = data.audioUrl || data.AudioUrl;
          if (msgType === 'voice' && !audioUrl) {
            const files: any[] = data.files || data.Files || [];
            const audioFile = files[0];
            if (audioFile) {
              const mime = audioFile.mimeType || audioFile.MimeType || 'audio/webm';
              const b64 = audioFile.fileDataBase64 || audioFile.FileDataBase64 || '';
              if (b64) audioUrl = `data:${mime};base64,${b64}`;
            }
          }

          // For image messages, reconstruct imageUrl from file data
          let imageUrl: string | undefined;
          let imageFileName: string | undefined;
          if (msgType === 'image') {
            const files: any[] = data.files || data.Files || [];
            const imgFile = files[0];
            if (imgFile) {
              const mime = imgFile.mimeType || imgFile.MimeType || 'image/jpeg';
              const b64 = imgFile.fileDataBase64 || imgFile.FileDataBase64 || '';
              if (b64) imageUrl = `data:${mime};base64,${b64}`;
              imageFileName = imgFile.fileName || imgFile.FileName;
            }
          }

          const newMsg: Message = {
            id: data.messageId || data.MessageId || crypto.randomUUID(),
            sender: senderId === this.userId ? 'me' : 'them',
            text: data.messageText || data.MessageText || '',
            time: new Date(data.createdAt || data.CreatedAt || Date.now())
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: msgType,
            read: false,
            audioUrl,
            audioDuration: data.audioDuration || data.AudioDuration,
            waveformHeights: msgType === 'voice' ? this.generateWaveform() : undefined,
            imageUrl,
            imageFileName,
            prescriptionDetails: (() => {
              const raw = data.prescriptionDetails || data.PrescriptionDetails;
              if (!raw) return undefined;
              return {
                medication: raw.medication || raw.Medication || '',
                dosage: raw.dosage || raw.Dosage || '',
                frequency: raw.frequency || raw.Frequency || '',
                duration: raw.duration || raw.Duration || '',
                doctorName: this.resolveDoctorName(),
                issuedAt: new Date(data.createdAt || data.CreatedAt || Date.now())
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              };
            })()
          };
          this.messages.update(msgs => [...msgs, newMsg]);
          this.shouldScroll = true;
        }

        // 2. Update sidebar last-message preview locally — no HTTP call needed
        if (incomingConvId) {
          const preview = data.messageText || data.MessageText || '📎 Attachment';
          const timeStr = new Date(data.createdAt || data.CreatedAt || Date.now())
            .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // If the server broadcast a status change alongside the system message, sync it
          const broadcastStatus = data.conversationStatus || data.ConversationStatus;

          this.conversations.update(convs =>
            convs.map(c => {
              if (c.id !== incomingConvId) return c;
              const updated: typeof c = {
                ...c,
                lastMessage: preview,
                time: timeStr,
                unread: c.id !== this.activeConversation() ? (c.unread || 0) + 1 : 0
              };
              if (broadcastStatus) updated.status = broadcastStatus as typeof c.status;
              return updated;
            })
          );
        }
      });
    }).catch(err => {
      console.error('SignalR connection failed:', err);
      this.errorMessage.set('Warning: Real-time features offline. Messages may be delayed.');
      // Still load conversations via HTTP even if SignalR fails
      this.loadConversations();
    });
  }

  ngOnDestroy(): void {
    if (this.messageSub) this.messageSub.unsubscribe();
    this.chatService.stopConnection();
    clearInterval(this.recordingTimer);
    // Release microphone if still recording
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(t => t.stop());
      this.activeStream = null;
    }
    // Release all audio instances
    this.disposeAudioInstances();
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

  // Captured once in ngOnInit so repeated loadConversations calls don't re-trigger it
  private pendingStartChatWith: string | null = null;
  private pendingAppointmentId: string | null = null;

  loadConversations(autoSelectUserId?: string): void {
    if (!this.userId) return;
    this.isLoading.set(true);

    this.chatService.getUserConversations(this.userId).subscribe({
      next: (res) => {
        const payload = res.data || res;
        if (!payload || payload.length === 0) {
          this.conversations.set([]);
          this.isLoading.set(false);
          this.handleStartChatWith(null, autoSelectUserId);
          return;
        }

        // Map Backend API Schema → Frontend Conversation shape
        // API returns: { conversationId, participants: [{userId, firstName, lastName, profilePicture, role, ...}], lastMessageAt, status }
        const mappedConvs: Conversation[] = payload.map((c: any) => {
          const participants: any[] = c.participants || [];
          const otherMember = participants.find((p: any) =>
            (p.userId || p.UserId)?.toString() !== this.userId
          );
          const uid = otherMember?.userId || otherMember?.UserId;
          const rawPic = otherMember?.profilePicture || otherMember?.ProfilePicture;
          return {
            id: c.conversationId || c.ConversationId,
            name: otherMember
              ? `${otherMember.firstName || otherMember.FirstName} ${otherMember.lastName || otherMember.LastName}`
              : 'Unknown',
            role: otherMember?.role || otherMember?.Role || 'Patient',
            avatar: otherMember
              ? `${(otherMember.firstName || otherMember.FirstName || '?').charAt(0)}${(otherMember.lastName || otherMember.LastName || '').charAt(0)}`
              : '?',
            avatarUrl: this.normalizeAvatar(rawPic),
            lastMessage: '',   // populated by real-time updates or message history
            time: c.lastMessageAt || c.LastMessageAt
              ? new Date(c.lastMessageAt || c.LastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : 'New',
            unread: 0,
            online: false,
            status: (c.status || c.Status || 'active') as Conversation['status'],
            otherUserId: uid?.toString()
          };
        });

        this.conversations.set(mappedConvs);
        this.isLoading.set(false);
        this.handleStartChatWith(mappedConvs, autoSelectUserId);
      },
      error: (err) => {
        console.error('Failed to load conversations:', err);
        this.isLoading.set(false);
        this.errorMessage.set('Could not load chat data. Please check your connection.');
      }
    });
  }

  private handleStartChatWith(mappedConvs: Conversation[] | null, forceSelectUserId?: string): void {
    // Priority 1: explicit auto-select after conversation creation
    if (forceSelectUserId && mappedConvs) {
      const existing = mappedConvs.find(c => c.otherUserId === forceSelectUserId);
      if (existing) {
        this.selectConversation(existing.id);
        return;
      }
    }

    // Priority 2: ?startChatWith query param — only consumed once
    const targetUserId = this.pendingStartChatWith;
    if (!targetUserId) return;

    // Consume it so it doesn't fire again on subsequent loadConversations calls
    this.pendingStartChatWith = null;
    const appointmentId = this.pendingAppointmentId;
    this.pendingAppointmentId = null;

    const existing = mappedConvs ? mappedConvs.find(c => c.otherUserId === targetUserId) : null;
    if (existing) {
      // Existing conversation found — if it's closed and we have a new appointmentId,
      // call createConversation so the backend reopens it, then select it.
      if (existing.status === 'closed' && appointmentId) {
        const payload: any = { participants: [this.userId, targetUserId], appointmentId };
        this.chatService.createConversation(payload).subscribe({
          next: () => this.loadConversations(targetUserId),
          error: (err: any) => {
            console.error('Reopen conversation error:', err);
            // Fall back to opening the closed conversation as-is
            this.selectConversation(existing.id);
          }
        });
      } else {
        this.selectConversation(existing.id);
      }
    } else {
      // No existing conversation — create one, passing appointmentId so the backend
      // can send the welcome system message and set the 7-day auto-close deadline
      const payload: any = { participants: [this.userId, targetUserId] };
      if (appointmentId) payload.appointmentId = appointmentId;

      this.chatService.createConversation(payload).subscribe({
        next: () => {
          this.loadConversations(targetUserId);
        },
        error: (err: any) => {
          console.error('Create conversation error:', err);
          this.errorMessage.set(
            err?.error?.message || 'Could not start chat. Make sure you have a booked appointment with this doctor.'
          );
        }
      });
    }
  }

  selectConversation(id: string): void {
    this.activeConversation.set(id);
    this.showProfile.set(false);
    // Clear unread badge for this conversation
    this.conversations.update(convs =>
      convs.map(c => c.id === id ? { ...c, unread: 0 } : c)
    );
    // Release audio instances from the previous conversation
    this.disposeAudioInstances();
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
    // Only patients can submit reviews
    if (this.userRole !== 'Patient') return;
    if (!msg.rating) return;

    const activeConvId = this.activeConversation();
    const activeConvEntity = this.activeConv();
    if (!activeConvId || !activeConvEntity) return;

    // Ensure review text meets the 3-char minimum — pad with a default if empty
    const reviewText = (msg.reviewText || '').trim();
    const finalText = reviewText.length >= 3
      ? reviewText
      : `${msg.rating}-star rating for this consultation.`;

    // Immediately lock the prompt so the user can't spam submit
    this.messages.update(msgs => msgs.map(m =>
      m.id === msg.id
        ? { ...m, type: 'system' as const, text: `Submitting your ${msg.rating}★ review...` }
        : m
    ));

    const doctorUserId = activeConvEntity.otherUserId;
    const patientUserId = this.userId;

    if (!doctorUserId || !patientUserId) {
      this.messages.update(msgs => msgs.map(m =>
        m.id === msg.id ? { ...m, text: 'Could not identify participants. Please try again.' } : m
      ));
      return;
    }

    this.reviewService.postReviewByUserId({
      doctorUserId,
      patientUserId,
      starRating: msg.rating,
      reviewText: finalText
    }).subscribe({
      next: () => {
        // Replace the "submitting..." badge with a success confirmation
        const stars = '★'.repeat(msg.rating!) + '☆'.repeat(5 - msg.rating!);
        this.messages.update(msgs => msgs.map(m =>
          m.id === msg.id
            ? {
                ...m,
                type: 'system' as const,
                text: `✅ Thank you! Your ${stars} review has been submitted.${reviewText ? ` "${reviewText}"` : ''}`
              }
            : m
        ));
        this.shouldScroll = true;
      },
      error: (err) => {
        console.error('Review submission failed:', err);
        const errMsg = err?.error?.message || err?.error?.title || 'Failed to submit review. Please try again.';
        // Restore the review prompt so the user can retry
        this.messages.update(msgs => msgs.map(m =>
          m.id === msg.id
            ? { ...m, type: 'review_prompt' as const, text: 'Please rate your experience with the doctor.' }
            : m
        ));
        this.errorMessage.set(errMsg);
      }
    });
  }

  acceptAndClose(): void {
    const activeConvId = this.activeConversation();
    if (!activeConvId) return;

    // Optimistically update UI
    this.conversations.update(convs => convs.map(c =>
      c.id === activeConvId ? { ...c, status: 'closed' } : c
    ));

    // Persist to backend — broadcasts system message + triggers review prompt via SignalR
    this.chatService.updateConversationStatus(activeConvId, this.userId, 'closed').subscribe({
      next: () => {
        // System message arrives via SignalR. Append the review prompt locally for the patient.
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.messages.update(msgs => [
          ...msgs,
          {
            id: crypto.randomUUID(),
            sender: 'system' as const,
            text: 'Please rate your experience with the doctor.',
            time: now,
            type: 'review_prompt' as const,
            read: true
          }
        ]);
        this.shouldScroll = true;
      },
      error: (err: any) => {
        console.error('Failed to close consultation:', err);
        // Roll back optimistic update
        this.conversations.update(convs => convs.map(c =>
          c.id === activeConvId ? { ...c, status: 'follow_up' } : c
        ));
        this.errorMessage.set(err?.error?.message || 'Failed to close consultation. Please try again.');
      }
    });
  }

  loadMessages(conversationId: string): void {
    if (!this.userId) return;

    this.chatService.getMessages(conversationId).subscribe({
      next: (res) => {
        const payload = res.data || res;

        const mappedMsgs: Message[] = (Array.isArray(payload) ? payload : []).map((m: any) => {
          const msgType = this.mapMessageType(m.type ?? m.Type);

          // For voice messages stored as files, reconstruct a playable data URI from the first file
          let audioUrl = m.audioUrl || m.AudioUrl;
          if (msgType === 'voice' && !audioUrl) {
            const files: any[] = m.files || m.Files || [];
            const audioFile = files[0];
            if (audioFile) {
              const mime = audioFile.mimeType || audioFile.MimeType || 'audio/webm';
              const b64 = audioFile.fileDataBase64 || audioFile.FileDataBase64 || '';
              if (b64) audioUrl = `data:${mime};base64,${b64}`;
            }
          }

          // For image messages, reconstruct imageUrl from the first file
          let imageUrl: string | undefined;
          let imageFileName: string | undefined;
          if (msgType === 'image') {
            const files: any[] = m.files || m.Files || [];
            const imgFile = files[0];
            if (imgFile) {
              const mime = imgFile.mimeType || imgFile.MimeType || 'image/jpeg';
              const b64 = imgFile.fileDataBase64 || imgFile.FileDataBase64 || '';
              if (b64) imageUrl = `data:${mime};base64,${b64}`;
              imageFileName = imgFile.fileName || imgFile.FileName;
            }
          }

          return {
            id: m.messageId || m.MessageId,
            sender: (m.senderId || m.SenderId)?.toString() === this.userId ? 'me' : 'them',
            text: m.messageText || m.MessageText || '',
            time: new Date(m.createdAt || m.CreatedAt || Date.now())
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: msgType,
            read: m.isRead || m.IsRead || false,
            audioUrl,
            audioDuration: m.audioDuration || m.AudioDuration,
            waveformHeights: msgType === 'voice' ? this.generateWaveform() : undefined,
            imageUrl,
            imageFileName,
            prescriptionDetails: (() => {
              const raw = m.prescriptionDetails || m.PrescriptionDetails;
              if (!raw) return undefined;
              return {
                medication: raw.medication || raw.Medication || '',
                dosage: raw.dosage || raw.Dosage || '',
                frequency: raw.frequency || raw.Frequency || '',
                duration: raw.duration || raw.Duration || '',
                doctorName: this.resolveDoctorName(),
                issuedAt: new Date(m.createdAt || m.CreatedAt || Date.now())
                  .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
              };
            })()
          };
        });

        this.messages.set(mappedMsgs);
        this.shouldScroll = true;
      },
      error: (err) => {
        console.warn('Failed to load message history:', err);
        this.messages.set([]);
      }
    });
  }

  // ── Image / File Attachment ──────────────────────────────────────────────────

  /** Allowed image MIME types — must match backend Mime.ReverseMimes */
  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];
  private readonly MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB — matches FileModel [MaxLength]

  attachFile(): void {
    const input = document.getElementById('chatFileInput') as HTMLInputElement | null;
    if (input) input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset so the same file can be re-selected
    input.value = '';

    // Validate type
    if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      this.errorMessage.set('Only images are supported (JPEG, PNG, GIF, WebP, BMP).');
      return;
    }

    // Validate size
    if (file.size > this.MAX_IMAGE_BYTES) {
      this.errorMessage.set('Image is too large (max 5MB). Please choose a smaller file.');
      return;
    }

    const activeConvId = this.activeConversation();
    if (!activeConvId) return;

    this.errorMessage.set(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      const base64 = dataUri.split(',')[1];

      const filePayload = [{
        mimeType: file.type,
        fileDataBase64: base64,
        fileName: file.name
      }];

      // Optimistic local preview — shown immediately before hub confirms
      const localId = `local_img_${Date.now()}`;
      const imgMsg: Message = {
        id: localId,
        sender: 'me',
        text: '',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        read: false,
        imageUrl: dataUri,
        imageFileName: file.name
      };
      this.messages.update(msgs => [...msgs, imgMsg]);
      this.conversations.update(convs => convs.map(c =>
        c.id === activeConvId ? { ...c, lastMessage: '📷 Photo', time: 'Just now' } : c
      ));
      this.shouldScroll = true;

      this.chatService.sendMessageToHub(
        activeConvId,
        null,
        filePayload,
        'image'
      ).then(() => {
        // Hub broadcast will add the confirmed message — remove the local preview
        this.messages.update(msgs => msgs.filter(m => m.id !== localId));
      }).catch(err => {
        console.error('Image send failed:', err);
        this.errorMessage.set('Image could not be sent. Please try again.');
        // Keep local preview so the user can see it wasn't lost
      });
    };
    reader.readAsDataURL(file);
  }

  // ── Prescription Download ────────────────────────────────────────────────────

  /**
   * Resolves the doctor name for a prescription message.
   * - If the current user is the Doctor → their own name from AuthService
   * - If the current user is the Patient → the other participant's name from the conversation
   */
  private resolveDoctorName(): string {
    if (this.userRole === 'Doctor') {
      const u = this.authService.currentUser();
      return u ? `Dr. ${u.firstName} ${u.lastName}`.trim() : 'Dr. Unknown';
    }
    const conv = this.activeConv();
    return conv ? `Dr. ${conv.name}` : 'Dr. Unknown';
  }

  downloadPrescription(msg: Message): void {
    const rx = msg.prescriptionDetails;
    if (!rx) return;

    const doctorName = rx.doctorName || this.resolveDoctorName();
    const issuedAt   = rx.issuedAt   || msg.time || new Date().toLocaleDateString();
    const patientName = this.userRole === 'Patient'
      ? (() => { const u = this.authService.currentUser(); return u ? `${u.firstName} ${u.lastName}` : 'Patient'; })()
      : this.activeConv()?.name || 'Patient';

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prescription – ${rx.medication}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Georgia', serif; color: #1a1a1a; background: #fff; padding: 40px 60px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #078930; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-icon { width: 44px; height: 44px; background: #078930; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 22px; font-weight: bold; }
    .brand-name { font-size: 1.4rem; font-weight: bold; color: #078930; }
    .brand-sub { font-size: 0.75rem; color: #666; }
    .rx-label { font-size: 2.5rem; font-weight: bold; color: #078930; opacity: 0.15; letter-spacing: 4px; }
    .meta { display: flex; gap: 40px; margin-bottom: 28px; }
    .meta-block label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; color: #888; display: block; margin-bottom: 2px; }
    .meta-block span { font-size: 0.95rem; font-weight: 600; }
    .section-title { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: #078930; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #e0f0e8; padding-bottom: 4px; }
    .rx-card { background: #f4fbf6; border: 1px solid #c8e6d0; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px; }
    .rx-name { font-size: 1.4rem; font-weight: bold; color: #078930; margin-bottom: 14px; }
    .rx-row { display: flex; gap: 32px; flex-wrap: wrap; }
    .rx-item { flex: 1; min-width: 120px; }
    .rx-item label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.5px; color: #888; display: block; margin-bottom: 3px; }
    .rx-item span { font-size: 0.95rem; font-weight: 600; }
    .instructions { background: #fffbf0; border-left: 4px solid #ffc107; padding: 12px 16px; border-radius: 0 8px 8px 0; margin-bottom: 28px; font-size: 0.85rem; color: #555; }
    .signature-section { margin-top: 40px; display: flex; justify-content: flex-end; }
    .signature-block { text-align: center; min-width: 220px; }
    .signature-line { border-top: 2px solid #1a1a1a; margin-bottom: 6px; }
    .signature-name { font-size: 1rem; font-weight: bold; color: #078930; }
    .signature-title { font-size: 0.75rem; color: #666; }
    .signature-stamp { width: 70px; height: 70px; border: 3px solid #078930; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; color: #078930; font-size: 0.6rem; font-weight: bold; text-align: center; line-height: 1.3; opacity: 0.7; }
    .footer { margin-top: 40px; border-top: 1px solid #e0e0e0; padding-top: 12px; display: flex; justify-content: space-between; font-size: 0.7rem; color: #aaa; }
    .watermark { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%) rotate(-35deg); font-size: 5rem; font-weight: bold; color: rgba(7,137,48,0.04); pointer-events: none; white-space: nowrap; z-index: 0; }
    @media print {
      body { padding: 20px 40px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="watermark">MED-CONNECT</div>

  <div class="header">
    <div class="brand">
      <div class="brand-icon">M</div>
      <div>
        <div class="brand-name">Med-Connect</div>
        <div class="brand-sub">Telemedicine Platform · Official Prescription</div>
      </div>
    </div>
    <div class="rx-label">Rx</div>
  </div>

  <div class="meta">
    <div class="meta-block">
      <label>Patient</label>
      <span>${patientName}</span>
    </div>
    <div class="meta-block">
      <label>Prescribing Physician</label>
      <span>${doctorName}</span>
    </div>
    <div class="meta-block">
      <label>Date Issued</label>
      <span>${issuedAt}</span>
    </div>
    <div class="meta-block">
      <label>Prescription ID</label>
      <span style="font-family:monospace;font-size:0.8rem">${msg.id.substring(0, 8).toUpperCase()}</span>
    </div>
  </div>

  <div class="section-title">Prescribed Medication</div>
  <div class="rx-card">
    <div class="rx-name">&#x1F48A; ${rx.medication}</div>
    <div class="rx-row">
      <div class="rx-item">
        <label>Dosage</label>
        <span>${rx.dosage}</span>
      </div>
      <div class="rx-item">
        <label>Frequency</label>
        <span>${rx.frequency}</span>
      </div>
      <div class="rx-item">
        <label>Duration</label>
        <span>${rx.duration}</span>
      </div>
    </div>
  </div>

  <div class="instructions">
    <strong>&#x26A0; Important:</strong> Take this medication exactly as prescribed. Do not alter dosage without consulting your physician. Keep out of reach of children. If you experience adverse effects, contact your doctor immediately.
  </div>

  <div class="signature-section">
    <div class="signature-block">
      <div class="signature-stamp">DIGITALLY<br>VERIFIED<br>MED-CONNECT</div>
      <div class="signature-line"></div>
      <div class="signature-name">${doctorName}</div>
      <div class="signature-title">Licensed Physician · Med-Connect</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated by Med-Connect Telemedicine Platform</span>
    <span>This prescription is valid only when issued through the Med-Connect platform.</span>
    <span>${new Date().toISOString().split('T')[0]}</span>
  </div>

  <script>window.onload = () => { window.print(); }<\/script>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (win) {
      win.document.write(html);
      win.document.close();
    } else {
      this.errorMessage.set('Pop-up blocked. Please allow pop-ups to download the prescription.');
    }
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
        if (err === 'Hub connection is not active.') {
          this.errorMessage.set('Reconnecting to chat server...');
          this.chatService.startConnection().then(() => {
            // Retry the message after reconnecting
            this.chatService.sendMessageToHub(activeConvId, text, [])
              .catch(() => this.errorMessage.set('Connection error: Message delivery failed.'));
          }).catch(() => this.errorMessage.set('Connection error: Message delivery failed.'));
        } else {
          this.errorMessage.set('Connection error: Message delivery failed.');
        }
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

  // ── Audio Playback ───────────────────────────────────────────────────────────

  // Per-message Audio instances — avoids DOM querying and codec-in-src issues
  private audioInstances = new Map<string, HTMLAudioElement>();

  private getOrCreateAudio(msgId: string, audioUrl: string): HTMLAudioElement {
    if (!this.audioInstances.has(msgId)) {
      const audio = new Audio();

      if (audioUrl.startsWith('data:')) {
        // Convert data URI → Blob URL so the browser uses its native MIME sniffing
        // instead of trying to parse the data URI MIME string (which breaks with codec params)
        try {
          const [header, b64] = audioUrl.split(',');
          // Extract MIME type — keep codec params so the browser knows how to decode
          const mime = header.replace('data:', '').replace(';base64', '');
          const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
          const blob = new Blob([bytes], { type: mime });
          const blobUrl = URL.createObjectURL(blob);
          audio.src = blobUrl;
          // Revoke the blob URL when the audio element is done with it
          audio.onended = () => {
            URL.revokeObjectURL(blobUrl);
            if (this.playingMessageId() === msgId) this.playingMessageId.set(null);
          };
        } catch {
          // Fallback: use data URI directly
          audio.src = audioUrl;
          audio.onended = () => {
            if (this.playingMessageId() === msgId) this.playingMessageId.set(null);
          };
        }
      } else {
        // Regular URL (http/https)
        audio.src = audioUrl;
        audio.onended = () => {
          if (this.playingMessageId() === msgId) this.playingMessageId.set(null);
        };
      }

      audio.preload = 'auto';
      audio.onerror = (e) => {
        console.error('Audio error for message', msgId, e);
        this.errorMessage.set('Could not play audio. The format may not be supported by your browser.');
        this.playingMessageId.set(null);
      };
      this.audioInstances.set(msgId, audio);
    }
    return this.audioInstances.get(msgId)!;
  }

  toggleAudio(msgId: string, audioUrl: string | undefined): void {
    if (!audioUrl) {
      this.errorMessage.set('Audio is not available for this message.');
      return;
    }

    // Pause any other currently playing audio
    this.audioInstances.forEach((a, id) => {
      if (id !== msgId && !a.paused) {
        a.pause();
        // Don't reset playingMessageId here — we'll overwrite it below
      }
    });

    const audio = this.getOrCreateAudio(msgId, audioUrl);

    if (audio.paused) {
      audio.play()
        .then(() => this.playingMessageId.set(msgId))
        .catch(err => {
          console.error('Audio play failed:', err);
          this.errorMessage.set('Could not play audio. The format may not be supported by your browser.');
          this.playingMessageId.set(null);
        });
    } else {
      audio.pause();
      this.playingMessageId.set(null);
    }
  }

  // Clean up Audio instances when messages change (e.g. conversation switch)
  private disposeAudioInstances(): void {
    this.audioInstances.forEach(a => {
      a.pause();
      a.src = '';
    });
    this.audioInstances.clear();
    this.playingMessageId.set(null);
  }

  // ── Voice Recording ──────────────────────────────────────────────────────────

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.activeStream = stream; // store so cancelRecording can stop tracks
      this.audioChunks = [];
      this.mediaRecorder = new MediaRecorder(stream);

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) this.audioChunks.push(e.data);
      };

      this.mediaRecorder.onstop = () => {
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(t => t.stop());
        this.activeStream = null;

        const blob = new Blob(this.audioChunks, { type: 'audio/webm' });
        // Use the duration captured in stopRecording() — recordingSeconds is already 0 by now
        const duration = this.finalRecordingDuration || this.formatTime(this.recordingSeconds());
        // Reset so the next recording doesn't inherit this duration
        this.finalRecordingDuration = '';
        const activeConvId = this.activeConversation();
        if (!activeConvId) return;

        // Use the actual MIME type the browser recorded with (e.g. "audio/webm;codecs=opus")
        const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';

        // Keep a local data URI so the sender can play back immediately
        // (blob:// URLs are revoked on navigation; data URI survives)
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUri = reader.result as string;
          const base64 = dataUri.split(',')[1];

          // Guard: base64 size check — 5MB raw ≈ ~6.7MB base64
          const estimatedBytes = Math.ceil(base64.length * 0.75);
          const maxBytes = 5 * 1024 * 1024; // 5MB — matches FileModel [MaxLength]
          if (estimatedBytes > maxBytes) {
            this.errorMessage.set('Voice message is too large (max 5MB). Please record a shorter message.');
            return;
          }

          const filePayload = [{
            mimeType: mimeType,
            fileDataBase64: base64,
            fileName: `voice_${Date.now()}.webm`
          }];

          // Create a Blob URL for the local preview — immediately playable
          // and avoids data URI MIME parsing issues in the browser
          const previewBlob = new Blob(this.audioChunks, { type: mimeType });
          const previewBlobUrl = URL.createObjectURL(previewBlob);

          // Show local preview using the Blob URL — playable immediately
          const localId = `local_${Date.now()}`;
          const voiceMsg: Message = {
            id: localId,
            sender: 'me',
            text: '',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'voice',
            read: false,
            audioUrl: previewBlobUrl,
            audioDuration: duration,
            waveformHeights: this.generateWaveform()
          };
          this.messages.update(msgs => [...msgs, voiceMsg]);
          this.conversations.update(convs => convs.map(c =>
            c.id === this.activeConversation() ? { ...c, lastMessage: '🎤 Voice message', time: 'Just now' } : c
          ));
          this.shouldScroll = true;

          this.chatService.sendMessageToHub(
            activeConvId,
            null,
            filePayload,
            'voice',
            null,
            duration
          ).then(() => {
            // Hub will broadcast the saved message back — remove the local preview
            // Revoke the blob URL to free memory
            URL.revokeObjectURL(previewBlobUrl);
            this.audioInstances.delete(localId);
            this.messages.update(msgs => msgs.filter(m => m.id !== localId));
          }).catch(err => {
            console.error('Voice message delivery failed:', err);
            this.errorMessage.set('Voice message could not be sent.');
            // Keep the local preview so the user can see it wasn't lost
          });
        };
        reader.readAsDataURL(blob);
      };

      this.mediaRecorder.start();
      this.isRecording.set(true);
      this.recordingSeconds.set(0);

      this.recordingTimer = setInterval(() => {
        this.recordingSeconds.update(s => s + 1);
      }, 1000);

    } catch (err) {
      console.error('Microphone access denied:', err);
      this.errorMessage.set('Microphone access is required to send voice messages. Please allow microphone access in your browser.');
    }
  }

  private finalRecordingDuration = '';

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      // Snapshot the duration before resetting — onstop fires async so recordingSeconds
      // would already be 0 by the time onstop reads it
      this.finalRecordingDuration = this.formatTime(this.recordingSeconds());
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
    // Always stop the microphone stream so the browser indicator goes away
    if (this.activeStream) {
      this.activeStream.getTracks().forEach(t => t.stop());
      this.activeStream = null;
    }
    clearInterval(this.recordingTimer);
    this.isRecording.set(false);
    this.recordingSeconds.set(0);
    this.audioChunks = [];
    this.finalRecordingDuration = '';
  }

  formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
}