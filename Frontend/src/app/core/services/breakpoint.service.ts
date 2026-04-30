import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class BreakpointService {
  // Bootstrap breakpoints
  xs = signal(false); // < 576px
  sm = signal(false); // ≥ 576px
  md = signal(false); // ≥ 768px
  lg = signal(false); // ≥ 992px
  xl = signal(false); // ≥ 1200px
  xxl = signal(false); // ≥ 1400px

  constructor() {
    this.checkBreakpoints();
    window.addEventListener('resize', () => this.checkBreakpoints());
  }

  private checkBreakpoints(): void {
    const width = window.innerWidth;
    this.xs.set(width < 576);
    this.sm.set(width >= 576);
    this.md.set(width >= 768);
    this.lg.set(width >= 992);
    this.xl.set(width >= 1200);
    this.xxl.set(width >= 1400);
  }
}