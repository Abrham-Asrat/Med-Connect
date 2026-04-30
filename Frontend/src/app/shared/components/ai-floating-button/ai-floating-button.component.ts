import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
        <div class="d-flex flex-wrap gap-2 mt-2">
          <button class="ai-quick-btn" (click)="ask('I have a headache')">🤕 Headache</button>
          <button class="ai-quick-btn" (click)="ask('What is normal blood pressure?')">💓 BP Info</button>
          <button class="ai-quick-btn" (click)="ask('Set medication reminder')">💊 Reminder</button>
          <button class="ai-quick-btn" (click)="ask('Health tip of the day')">💡 Health Tip</button>
        </div>
      </div>

      <div class="ai-panel-input">
        <input type="text" [(ngModel)]="inputText" placeholder="Ask a health question..." 
               (keyup.enter)="ask(inputText)">
        <button (click)="ask(inputText)">➤</button>
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
  `]
})
export class AiFloatingButtonComponent {
  isOpen = signal(false);
  inputText = '';

  messages = signal<{ id: string; sender: 'user' | 'bot'; text: string }[]>([
    { id: '1', sender: 'bot', text: 'Hello! I\'m your Med-Connect AI Health Assistant. I can help with general health questions, symptom information, and medication reminders. How can I help you today?' }
  ]);

  togglePanel(): void {
    this.isOpen.update(v => !v);
  }

  ask(question: string): void {
    if (!question || !question.trim()) return;

    this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'user', text: question }]);
    this.inputText = '';

    setTimeout(() => {
      let response = '';
      const q = question.toLowerCase();

      if (q.includes('headache')) {
        response = 'Headaches can be caused by stress, dehydration, or lack of sleep. 💧 Try drinking water, resting, or OTC pain relievers. <b>Seek help if:</b> severe pain, fever, stiff neck, or vision changes.';
      } else if (q.includes('blood pressure')) {
        response = '📊 <b>Normal blood pressure</b> is around <b>120/80 mmHg</b>. High: 130/80+. Maintain with exercise, low-sodium diet, and stress management.';
      } else if (q.includes('reminder')) {
        response = '💊 Tell me the medication name, dosage, and frequency. I\'ll help you remember!';
      } else if (q.includes('tip')) {
        response = '🩺 <b>Health Tip:</b> Get 30 min exercise daily, drink 8 glasses of water, and sleep 7-8 hours.';
      } else {
        response = 'For specific medical concerns, I recommend consulting a verified doctor on Med-Connect. Would you like help finding a doctor?';
      }

      this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'bot', text: response }]);
    }, 1000);
  }
}