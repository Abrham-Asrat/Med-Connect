import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  isMobile = signal(false);
  isTablet = signal(false);
  isDesktop = signal(false);

  constructor() {
    this.detectDevice();
    window.addEventListener('resize', () => this.detectDevice());
  }

  private detectDevice(): void {
    const width = window.innerWidth;
    this.isMobile.set(width < 768);
    this.isTablet.set(width >= 768 && width < 1024);
    this.isDesktop.set(width >= 1024);
  }

  get deviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  }
}