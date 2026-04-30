import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid p-4">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h4 class="text-primary mb-0"><i class="bi bi-bell me-2"></i>Notifications</h4>
        <button class="btn btn-outline-primary btn-sm">Mark All Read</button>
      </div>

      @for (n of notifications(); track n.id) {
        <div class="card mb-2" [class.border-primary]="!n.read" style="border-left:4px solid #078930">
          <div class="card-body py-3">
            <div class="d-flex gap-3">
              <div class="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
                   [class.bg-primary-light]="n.type==='appointment'" [class.bg-warning-light]="n.type==='review'"
                   [class.bg-secondary-light]="n.type==='message'" style="width:40px;height:40px">
                <i class="bi" [class.bi-calendar-check]="n.type==='appointment'"
                   [class.bi-star]="n.type==='review'" [class.bi-chat-dots]="n.type==='message'"
                   [class.text-primary]="n.type==='appointment'" [class.text-warning-dark]="n.type==='review'"
                   [class.text-secondary]="n.type==='message'"></i>
              </div>
              <div class="flex-grow-1">
                <strong>{{ n.title }}</strong>
                <p class="text-medium mb-0" style="font-size:14px">{{ n.description }}</p>
                <small class="text-medium">{{ n.time }}</small>
              </div>
              @if (!n.read) { <span class="badge bg-primary rounded-pill align-self-start">New</span> }
            </div>
          </div>
        </div>
      }
      @if (notifications().length === 0) {
        <div class="text-center py-5"><i class="bi bi-bell text-primary" style="font-size:48px;opacity:0.3"></i><p class="text-medium mt-2">No notifications</p></div>
      }
    </div>
  `
})
export class NotificationsComponent {
  notifications = signal([
    { id:'1', type:'appointment', title:'Appointment Confirmed', description:'Your appointment with Dr. Sarah Johnson on May 15 at 2:30 PM is confirmed.', time:'2 hours ago', read:false },
    { id:'2', type:'message', title:'New Message', description:'Dr. Abebe Kebede sent you a message about your test results.', time:'Yesterday', read:false },
    { id:'3', type:'review', title:'Review Request', description:'Rate your recent appointment with Dr. Tirunesh Desta.', time:'3 days ago', read:true },
    { id:'4', type:'appointment', title:'Appointment Reminder', description:'Your appointment with Dr. Yonas Tadesse is tomorrow at 10:00 AM.', time:'Yesterday', read:true },
  ]);
}