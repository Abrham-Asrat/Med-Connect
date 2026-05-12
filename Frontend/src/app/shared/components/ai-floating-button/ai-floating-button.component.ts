import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-ai-floating-button',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Floating Button -->
    <button class="ai-fab" (click)="togglePanel()" title="AI Health Assistant">
      <span class="pulse-ring"></span>
      <span class="tooltip-text">🤖 AI Health Assistant</span>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    </button>

    <!-- Overlay -->
    @if (isOpen()) {
      <div class="ai-overlay" (click)="togglePanel()"></div>
    }

    <!-- Side Panel -->
    <div class="ai-panel" [class.open]="isOpen()">
      <div class="ai-panel-header">
        <div>
          <h6 class="mb-0">🤖 AI Health Assistant</h6>
          <small style="opacity:0.8">Powered by Med-Connect</small>
        </div>
        <button class="ai-close-btn" (click)="togglePanel()">&times;</button>
      </div>

      <div class="ai-panel-body" #chatBody>
        @for (msg of messages(); track msg.id) {
          <div [class]="msg.sender === 'user' ? 'ai-msg-user' : 'ai-msg-bot'" [innerHTML]="msg.text"></div>
        }
        
        @if (isTyping()) {
          <div class="ai-msg-bot typing-indicator">
            <span class="dot"></span><span class="dot"></span><span class="dot"></span>
          </div>
        }
        
        @if (messages().length === 1) {
          <div class="d-flex flex-wrap gap-2 mt-2">
            <button class="ai-quick-btn" (click)="ask('I have a headache')">🤕 Headache</button>
            <button class="ai-quick-btn" (click)="ask('What is normal blood pressure?')">💓 BP Info</button>
            <button class="ai-quick-btn" (click)="ask('Set medication reminder')">💊 Reminder</button>
            <button class="ai-quick-btn" (click)="ask('Health tip of the day')">💡 Health Tip</button>
          </div>
        }
      </div>

      <div class="ai-panel-input">
        <input type="text" [(ngModel)]="inputText" placeholder="Ask a health question..." 
               (keyup.enter)="ask(inputText)" [disabled]="isTyping()">
        <button (click)="ask(inputText)" [disabled]="isTyping()">➤</button>
      </div>
    </div>
  `,
  styles: [`
    .ai-fab {
      position: fixed; bottom: 30px; right: 30px; z-index: 9999;
      width: 60px; height: 60px; background: linear-gradient(135deg, #078930, #056B24);
      color: white; border-radius: 50%; border: none; cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 20px rgba(7,137,48,0.4); transition: all 0.3s ease;
    }
    .ai-fab:hover { transform: scale(1.1); box-shadow: 0 6px 28px rgba(7,137,48,0.5); }
    .tooltip-text {
      position: absolute; right: 70px; background: #1A1A1A; color: white;
      padding: 8px 16px; border-radius: 8px; font-size: 14px; white-space: nowrap;
      opacity: 0; pointer-events: none; transition: opacity 0.3s ease;
    }
    .ai-fab:hover .tooltip-text { opacity: 1; }
    .pulse-ring {
      position: absolute; width: 100%; height: 100%; border-radius: 50%;
      border: 2px solid rgba(7,137,48,0.4); animation: pulse-ring 2s infinite;
    }
    @keyframes pulse-ring {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    .ai-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.4); z-index: 10000;
    }
    .ai-panel {
      position: fixed; top: 0; right: -420px; width: 400px; max-width: 90vw;
      height: 100%; background: white; z-index: 10001;
      transition: right 0.3s ease; display: flex; flex-direction: column;
      box-shadow: -4px 0 24px rgba(0,0,0,0.15);
    }
    .ai-panel.open { right: 0; }
    .ai-panel-header {
      background: linear-gradient(135deg, #078930, #056B24); color: white;
      padding: 16px 20px; display: flex; align-items: center; justify-content: space-between;
    }
    .ai-close-btn { background: none; border: none; color: white; font-size: 24px; cursor: pointer; }
    .ai-panel-body { flex: 1; overflow-y: auto; padding: 16px; }
    .ai-panel-input {
      border-top: 1px solid #E5E7EB; padding: 12px 16px; display: flex; gap: 8px;
    }
    .ai-panel-input input {
      flex: 1; border: 1px solid #E5E7EB; border-radius: 8px; padding: 10px 14px; outline: none;
    }
    .ai-panel-input button {
      background: #078930; color: white; border: none; border-radius: 8px;
      padding: 10px 16px; cursor: pointer; font-weight: 700;
    }
    .ai-msg-user {
      background: #078930; color: white; padding: 10px 14px;
      border-radius: 16px 16px 4px 16px; max-width: 85%; margin-left: auto; margin-bottom: 8px;
    }
    .ai-msg-bot {
      background: #F8F9FA; padding: 10px 14px; border-radius: 16px 16px 16px 4px;
      max-width: 85%; margin-bottom: 8px; border: 1px solid #E5E7EB;
    }
    .ai-quick-btn {
      font-size: 12px; padding: 6px 12px; border-radius: 20px;
      border: 1px solid #078930; background: white; color: #078930; cursor: pointer;
    }
    .ai-quick-btn:hover { background: #078930; color: white; }
    .typing-indicator { display: inline-flex; gap: 4px; padding: 12px 16px; align-items: center; }
    .typing-indicator .dot {
      width: 6px; height: 6px; background: #078930; border-radius: 50%;
      animation: bounce 1.4s infinite ease-in-out both;
    }
    .typing-indicator .dot:nth-child(1) { animation-delay: -0.32s; }
    .typing-indicator .dot:nth-child(2) { animation-delay: -0.16s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }
    .ai-panel-input input:disabled, .ai-panel-input button:disabled {
      opacity: 0.6; cursor: not-allowed;
    }
  `]
})
export class AiFloatingButtonComponent {
  @ViewChild('chatBody') private chatBody!: ElementRef;

  isOpen = signal(false);
  inputText = '';
  isTyping = signal(false);

  messages = signal<{ id: string; sender: 'user' | 'bot'; text: string }[]>([
    { id: '1', sender: 'bot', text: 'Hello! I\'m your Med-Connect AI Health Assistant. I can help with general health questions, symptom information, and medication reminders. How can I help you today?' }
  ]);

  constructor(private http: HttpClient) { }

  togglePanel(): void {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      try {
        this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight;
      } catch (err) { }
    }, 50);
  }

  ask(question: string): void {
    if (!question || !question.trim() || this.isTyping()) return;

    this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'user', text: question }]);
    this.inputText = '';
    this.isTyping.set(true);
    this.scrollToBottom();

    this.http.post<{ success: boolean, answer: string }>(`${environment.apiUrl}/Ai/ask`, { question })
      .subscribe({
        next: (res: { success: boolean, answer: string }) => {
          this.isTyping.set(false);
          if (res.success) {
            const formattedText = res.answer.replace(/\n/g, '<br>');
            const botMsgId = crypto.randomUUID();

            // Add an empty bot message first
            this.messages.update(msgs => [...msgs, { id: botMsgId, sender: 'bot', text: '' }]);

            let i = 0;
            const typeSpeed = 15; // Speed between characters in milliseconds

            const typeWriter = () => {
              if (i < formattedText.length) {
                // Instantly skip over complete HTML tags (like <b> or <br>) to avoid rendering partial tags
                if (formattedText.charAt(i) === '<') {
                  const endIdx = formattedText.indexOf('>', i);
                  if (endIdx !== -1) {
                    i = endIdx + 1;
                  } else {
                    i++;
                  }
                } else {
                  i++;
                }

                this.messages.update(msgs => msgs.map(m => m.id === botMsgId ? { ...m, text: formattedText.substring(0, i) } : m));
                this.scrollToBottom();
                setTimeout(typeWriter, typeSpeed);
              }
            };

            // Start the typewriter animation
            typeWriter();
          }
        },
        error: (err: any) => {
          this.isTyping.set(false);
          console.error('Error calling AI API:', err);
          this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'bot', text: 'Sorry, I am having trouble connecting to the server. Please try again later.' }]);
          this.scrollToBottom();
        }
      });
  }
}
