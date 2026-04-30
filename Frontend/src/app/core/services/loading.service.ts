import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  isLoading = signal(false);
  private requestCount = 0;

  show(): void {
    this.requestCount++;
    this.isLoading.set(true);
  }

  hide(): void {
    this.requestCount--;
    if (this.requestCount <= 0) {
      this.requestCount = 0;
      this.isLoading.set(false);
    }
  }
}