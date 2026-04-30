import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-stars me-2"></i>AI Health Assistant</h4>

      <!-- Disclaimer -->
      <div class="alert alert-warning d-flex align-items-center gap-2 mb-4">
        <i class="bi bi-shield-exclamation fs-5"></i>
        <small>This AI provides general health information only. It is NOT a substitute for professional medical advice. In emergencies, call 907 immediately.</small>
      </div>

      <!-- Chat Area -->
      <div class="card mb-3" style="height:400px">
        <div class="card-body overflow-auto">
          @for (msg of messages(); track msg.id) {
            @if (msg.sender === 'ai') {
              <div class="d-flex mb-3">
                <div class="rounded-circle bg-primary d-flex align-items-center justify-content-center flex-shrink-0 me-2"
                     style="width:36px;height:36px"><i class="bi bi-stars text-white"></i></div>
                <div class="bg-primary-light rounded-3 p-3" style="max-width:80%">{{ msg.text }}</div>
              </div>
            } @else {
              <div class="d-flex mb-3 justify-content-end">
                <div class="bg-primary text-white rounded-3 p-3" style="max-width:80%">{{ msg.text }}</div>
              </div>
            }
          }
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="d-flex gap-2 mb-3 flex-wrap">
        <button class="btn btn-outline-primary btn-sm rounded-pill" (click)="askQuestion('I have a headache')">🤕 Headache</button>
        <button class="btn btn-outline-primary btn-sm rounded-pill" (click)="askQuestion('What is blood pressure?')">💓 Blood Pressure</button>
        <button class="btn btn-outline-primary btn-sm rounded-pill" (click)="askQuestion('Set medication reminder')">💊 Reminder</button>
        <button class="btn btn-outline-primary btn-sm rounded-pill" (click)="askQuestion('Health tip of the day')">💡 Health Tip</button>
      </div>

      <!-- Input -->
      <div class="input-group">
        <input class="form-control" placeholder="Ask a health question..." [ngModel]="inputText()" (ngModelChange)="inputText.set($event)" (keyup.enter)="sendMessage()">
        <button class="btn btn-primary" (click)="sendMessage()"><i class="bi bi-send"></i></button>
      </div>
    </div>
  `
})
export class AIAssistantComponent {
  inputText = signal('');
  messages = signal<{ id: string; sender: 'ai' | 'user'; text: string }[]>([
  { id: '1', sender: 'ai', text: 'Hello! I\'m your Med-Connect AI Health Assistant. I can help with general health questions, symptom information, and medication reminders. How can I help you today?' },
]);
 sendMessage(): void {
  const text = this.inputText().trim();
  if (!text) return;
  this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'user', text }]);
  this.inputText.set('');
  
  setTimeout(() => {
    const responses: Record<string, string> = {
      'headache': 'Headaches can be caused by stress, dehydration, or eye strain. Rest, hydration, and over-the-counter pain relievers may help. If headaches persist or are severe, please consult a doctor.',
      'blood pressure': 'Blood pressure is the force of blood pushing against artery walls. Normal is around 120/80 mmHg. High blood pressure (hypertension) increases risk of heart disease. Regular monitoring is important.',
      'reminder': 'I can help set medication reminders! Please tell me the medication name, dosage, and frequency.',
      'tip': '🩺 Health Tip: Aim for 30 minutes of moderate exercise 5 days a week. Walking, swimming, or cycling are great options!',
    };
    let response = 'I\'m here to help with general health questions. For specific medical advice, please consult your doctor.';
    for (const [key, val] of Object.entries(responses)) {
      if (text.toLowerCase().includes(key)) { response = val; break; }
    }
    this.messages.update(msgs => [...msgs, { id: crypto.randomUUID(), sender: 'ai', text: response }]);
  }, 1000);
}
  askQuestion(question: string): void {
    this.inputText.set(question);
    this.sendMessage();
  }
}