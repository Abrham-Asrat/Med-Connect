import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SignalRService } from '../../../../../core/services/signalr.service';

interface Message {
  id: string;
  sender: 'me' | 'them' | 'system';
  text: string;
  time: string;
  type: 'text' | 'file' | 'system';
  fileName?: string;
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
  upcomingAppointment?: string;
}

@Component({
  selector: 'app-doctor-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-0">
      <div class="d-flex" style="height: calc(100vh - 140px);">
        
        <!-- Patient Conversation List -->
        <div class="border-end bg-white d-flex flex-column" style="width: 340px; min-width: 340px;">
          <div class="p-3 border-bottom">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h5 class="text-primary mb-0"><i class="bi bi-chat-dots me-2"></i>Patient Messages</h5>
              <span class="badge rounded-pill bg-primary">{{ activeChats().length }}</span>
            </div>
            <div class="input-group">
              <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
              <input type="text" class="form-control" placeholder="Search patients..." 
                     [ngModel]="searchTerm()" (ngModelChange)="searchTerm.set($event); filterPatients()">
            </div>
          </div>
          
          <div class="flex-grow-1 overflow-auto">
            @for (conv of filteredConversations(); track conv.id) {
              <div class="p-3 border-bottom" style="cursor:pointer; border-left:3px solid transparent"
                   [class.bg-primary-light]="activeConversation() === conv.id"
                   [class.border-primary]="activeConversation() === conv.id"
                   (click)="selectConversation(conv.id)">
                <div class="d-flex gap-3">
                  <div class="position-relative flex-shrink-0">
                    <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                         style="width:48px;height:48px;font-size:18px;font-weight:700">{{ conv.avatar }}</div>
                    @if (conv.online) {
                      <span style="width:10px;height:10px;border-radius:50%;background:#078930;position:absolute;bottom:0;right:0;border:2px solid white"></span>
                    }
                  </div>
                  <div class="flex-grow-1 min-width-0">
                    <div class="d-flex justify-content-between">
                      <h6 class="mb-0 text-truncate">{{ conv.name }}</h6>
                      <small class="text-medium flex-shrink-0">{{ conv.time }}</small>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                      <small class="text-medium text-truncate">{{ conv.lastMessage }}</small>
                      @if (conv.unread > 0) {
                        <span class="badge bg-primary rounded-pill flex-shrink-0">{{ conv.unread }}</span>
                      }
                    </div>
                    <small class="text-primary" style="font-size:12px">{{ conv.reason }}</small>
                    @if (conv.upcomingAppointment) {
                      <br><small class="text-warning-dark" style="font-size:11px">📅 {{ conv.upcomingAppointment }}</small>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Chat Window -->
        <div class="flex-grow-1 d-flex flex-column bg-light">
          @if (activeConv()) {
            <!-- Header -->
            <div class="bg-white border-bottom p-3 d-flex align-items-center gap-3">
              <div class="position-relative">
                <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center"
                     style="width:44px;height:44px;font-weight:700">{{ activeConv()?.avatar }}</div>
                @if (activeConv()?.online) {
                  <span style="width:10px;height:10px;border-radius:50%;background:#078930;position:absolute;bottom:0;right:0;border:2px solid white"></span>
                }
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-0">{{ activeConv()?.name }}</h6>
                <small class="text-medium">{{ activeConv()?.reason }}</small>
                @if (activeConv()?.upcomingAppointment) {
                  <span class="badge bg-warning-light text-warning-dark ms-2" style="font-size:11px">
                    📅 {{ activeConv()?.upcomingAppointment }}
                  </span>
                }
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-outline-primary btn-sm rounded-pill">
                  <i class="bi bi-camera-video me-1"></i> Call
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div class="flex-grow-1 overflow-auto p-4">
              @for (msg of messages(); track msg.id) {
                @if (msg.type === 'system') {
                  <div class="text-center mb-3">
                    <span class="badge bg-warning-light text-warning-dark px-3 py-2">{{ msg.text }}</span>
                  </div>
                }
                @if (msg.type !== 'system') {
                  <div class="d-flex mb-3" [class.justify-content-end]="msg.sender === 'me'">
                    @if (msg.sender === 'them') {
                      <div class="rounded-circle bg-primary-light text-primary d-flex align-items-center justify-content-center flex-shrink-0 me-2"
                           style="width:32px;height:32px;font-size:12px;font-weight:700">{{ activeConv()?.avatar }}</div>
                    }
                    <div>
                      <div [class]="msg.sender === 'me' ? 'bg-primary text-white' : 'bg-white border'"
                           class="px-3 py-2 mb-1" style="border-radius:16px; max-width:400px">
                        @if (msg.type === 'file') {
                          <i class="bi bi-file-pdf me-2"></i>{{ msg.fileName }}
                        } @else {
                          {{ msg.text }}
                        }
                      </div>
                      <small class="text-medium d-block" [class.text-end]="msg.sender === 'me'" style="font-size:11px">{{ msg.time }}</small>
                    </div>
                  </div>
                }
              }
            </div>

            <!-- Input -->
            <div class="bg-white border-top p-3">
              <div class="d-flex gap-2 align-items-end">
                <button class="btn btn-outline-secondary btn-sm rounded-circle"><i class="bi bi-paperclip"></i></button>
                <textarea class="form-control" rows="1" placeholder="Type a message..." style="resize:none"
                          [ngModel]="newMessage()" (ngModelChange)="newMessage.set($event)"
                          (keydown)="$event.key === 'Enter' && !$event.shiftKey && sendMessage()"></textarea>
                <button class="btn btn-primary rounded-circle d-flex align-items-center justify-content-center"
                        style="width:40px;height:40px" (click)="sendMessage()">
                  <i class="bi bi-send"></i>
                </button>
              </div>
            </div>
          } @else {
            <div class="flex-grow-1 d-flex align-items-center justify-content-center">
              <div class="text-center">
                <i class="bi bi-chat-square-text text-primary" style="font-size:64px;opacity:0.3"></i>
                <h5 class="text-medium mt-3">Select a patient to chat</h5>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class DoctorChatComponent {
  searchTerm = signal('');
  activeConversation = signal<string | null>(null);
  newMessage = signal('');

  activeChats = signal<PatientConversation[]>([
    { id:'1', name:'Abebe Tesfaye', reason:'Hypertension Follow-up', avatar:'AT', lastMessage:'Thank you doctor, I feel better now', time:'10:30 AM', unread:2, online:true, upcomingAppointment:'Today, 2:00 PM' },
    { id:'2', name:'Meron Haile', reason:'Migraine Consultation', avatar:'MH', lastMessage:'Should I continue the medication?', time:'Yesterday', unread:0, online:false },
    { id:'3', name:'Dawit Mekonnen', reason:'Diabetes Management', avatar:'DM', lastMessage:'My blood sugar levels are stable', time:'2 days ago', unread:0, online:true, upcomingAppointment:'May 20, 10:00 AM' },
    { id:'4', name:'Sara Tadesse', reason:'Annual Check-up', avatar:'ST', lastMessage:'I uploaded my lab results', time:'Apr 28', unread:1, online:false, upcomingAppointment:'May 22, 3:30 PM' },
  ]);

  filteredConversations() {
    const term = this.searchTerm().toLowerCase();
    if (!term) return this.activeChats();
    return this.activeChats().filter(c => c.name.toLowerCase().includes(term));
  }

  messages = signal<Message[]>([
    { id:'1', sender:'them', text:'Good morning Dr. Johnson. I\'ve been taking the medication as prescribed but I still have some headaches.', time:'9:45 AM', type:'text', read:true },
    { id:'2', sender:'me', text:'Good morning. How often are the headaches occurring and on a scale of 1-10 how severe?', time:'10:00 AM', type:'text', read:true },
    { id:'3', sender:'them', text:'About 2-3 times a week, around level 5. They usually happen in the afternoon.', time:'10:15 AM', type:'text', read:true },
    { id:'4', sender:'me', text:'I see. Let\'s adjust the dosage slightly. Take 50mg in the morning instead of 25mg. Also, I\'m sharing a headache diary - please track them for 2 weeks.', time:'10:20 AM', type:'text', read:true },
    { id:'5', sender:'me', text:'Headache_Diary.pdf', time:'10:20 AM', type:'file', fileName:'Headache_Diary.pdf', read:true },
    { id:'6', sender:'them', text:'Thank you doctor, I\'ll start tracking and let you know how it goes.', time:'10:30 AM', type:'text', read:true },
  ]);

  selectConversation(id: string): void {
    this.activeConversation.set(id);
  }

  activeConv(): PatientConversation | undefined {
    return this.activeChats().find(c => c.id === this.activeConversation());
  }

  sendMessage(): void {
    const text = this.newMessage().trim();
    if (!text) return;
    this.messages.update(msgs => [...msgs, {
      id: crypto.randomUUID(), sender:'me', text, type:'text', read:false,
      time: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
    }]);
    this.newMessage.set('');
  }

  filterPatients(): void {
    // Already reactive via filteredConversations()
  }
}