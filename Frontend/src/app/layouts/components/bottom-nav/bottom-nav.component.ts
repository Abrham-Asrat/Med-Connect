import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav d-lg-none">
      <div class="d-flex justify-content-around align-items-center">
        @for (item of navItems; track item.route) {
          <a [routerLink]="item.route" 
             routerLinkActive="active"
             class="nav-item text-center py-2 px-3 text-decoration-none position-relative">
            <i [class]="'bi ' + item.icon + ' fs-5 d-block'"></i>
            <small class="d-block" style="font-size: 11px;">{{ item.label }}</small>
            @if (item.badge && item.badge > 0) {
              <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
                    style="font-size: 10px;">
                {{ item.badge > 99 ? '99+' : item.badge }}
              </span>
            }
          </a>
        }
      </div>
    </nav>
  `,
  styles: [`
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      border-top: 1px solid #E5E7EB;
      z-index: 1030;
      box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
    }
    .nav-item {
      color: #6B7280;
      transition: all 0.2s ease;
      flex: 1;
    }
    .nav-item:hover, .nav-item.active {
      color: #078930;
    }
    .nav-item.active::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 3px;
      background: #078930;
      border-radius: 0 0 3px 3px;
    }
  `]
})
export class BottomNavComponent {
  @Input() navItems: NavItem[] = [
    { icon: 'bi-house-door', label: 'Home', route: '/patient/dashboard' },
    { icon: 'bi-search', label: 'Doctors', route: '/patient/doctors' },
    { icon: 'bi-calendar-check', label: 'Appointments', route: '/patient/appointments' },
    { icon: 'bi-chat-dots', label: 'Chat', route: '/patient/chat' },
    { icon: 'bi-person', label: 'Profile', route: '/patient/settings' }
  ];
}