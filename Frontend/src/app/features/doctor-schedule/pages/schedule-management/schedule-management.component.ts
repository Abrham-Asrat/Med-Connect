import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorScheduleService } from '../../../../core/services/doctor-schedule.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/services/profile.service';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-management.component.html',
  styles: [`
    .nav-pills .nav-link { color: #64748b; transition: all 0.3s; border: 1px solid transparent; }
    .nav-pills .nav-link.active { background: #078930 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(7, 137, 48, 0.2); }
    .nav-pills .nav-link:hover:not(.active) { background: #f8fafc; color: #078930; }

    .day-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-left: 5px solid #078930; }
    .day-row:hover { transform: translateX(5px); border-left-width: 8px; }
    .disabled-row { opacity: 0.5; border-left-color: #e2e8f0; }
    .weekend-row { border-left-color: #f59e0b; }
    .weekend-row.disabled-row { border-left-color: #fde68a; }

    .glass-slot { background: #f1f5f9; border: 1px solid #e2e8f0; color: #0f172a; transition: all 0.2s; }
    .glass-slot:hover { background: #e2e8f0; transform: scale(1.05); }

    .btn-dashed { border: 2px dashed #e2e8f0; color: #64748b; background: transparent; padding: 0.5rem; transition: all 0.2s; }
    .btn-dashed:hover { border-color: #078930; color: #078930; background: #f0fdf4; }

    .animate-fade-in { animation: fadeIn 0.4s ease-out forwards; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ScheduleManagementComponent implements OnInit {
  private scheduleService = inject(DoctorScheduleService);
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);

  doctorId = localStorage.getItem('doctorId') || localStorage.getItem('userId') || '';

  isLoading = signal(false);
  isSaving = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  acceptingAppointments = signal(true);

  // Tab Management
  activeTab = signal<'appointments' | 'availability' | 'timeoff'>('appointments');
  viewMode = signal<'week' | 'month'>('week');

  // Weekdays always start enabled; weekends always start disabled
  readonly WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  readonly WEEKENDS = ['Saturday', 'Sunday'];

  days = signal([
    { name: 'Monday',    isWeekend: false, enabled: true,  slots: [] as string[] },
    { name: 'Tuesday',   isWeekend: false, enabled: true,  slots: [] as string[] },
    { name: 'Wednesday', isWeekend: false, enabled: true,  slots: [] as string[] },
    { name: 'Thursday',  isWeekend: false, enabled: true,  slots: [] as string[] },
    { name: 'Friday',    isWeekend: false, enabled: true,  slots: [] as string[] },
    { name: 'Saturday',  isWeekend: true,  enabled: false, slots: [] as string[] },
    { name: 'Sunday',    isWeekend: true,  enabled: false, slots: [] as string[] },
  ]);

  appointments = signal<any[]>([]);
  awayFrom = '';
  awayTo = '';

  ngOnInit(): void {
    // Also try to get doctorId from auth service if not in localStorage
    const user = this.authService.currentUser();
    if (!this.doctorId && user) {
      this.doctorId = (user as any).doctorId || (user as any).userId || '';
    }

    if (this.doctorId) {
      this.loadAvailabilities();
      this.loadAppointments();
    }
  }

  loadAvailabilities(): void {
    this.isLoading.set(true);
    console.log('[Schedule] Loading availabilities for doctorId:', this.doctorId);
    this.scheduleService.getAvailabilities(this.doctorId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('[Schedule] Raw GET response:', JSON.stringify(response, null, 2));
        const data = response?.data || response || [];
        console.log('[Schedule] Parsed data array:', data);
        if (Array.isArray(data) && data.length > 0) {
          this.parseAvailabilities(data);
        } else {
          console.warn('[Schedule] No availability data returned — keeping defaults');
        }
      },
      error: (err: any) => {
        this.isLoading.set(false);
        console.error('[Schedule] GET error:', err);
      }
    });
  }

  loadAppointments(): void {
    this.scheduleService.getDoctorAppointments(this.doctorId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.appointments.set(Array.isArray(data) ? data : []);
      },
      error: () => {}
    });
  }

  parseAvailabilities(availabilities: any[]): void {
    console.log('[Schedule] parseAvailabilities input:', availabilities);
    // Start with all days disabled, then enable only those returned by the backend
    const updatedDays = this.days().map(day => ({
      ...day,
      enabled: false,
      slots: [] as string[]
    }));

    availabilities.forEach((a: any) => {
      // Backend returns { availableDay: "Monday", startTime: "09:00", endTime: "17:00" }
      const dayName = a.availableDay || a.AvailableDay || a.day || a.Day;
      const start   = (a.startTime   || a.StartTime   || '').substring(0, 5);
      const end     = (a.endTime     || a.EndTime     || '').substring(0, 5);

      console.log(`[Schedule] Processing: day="${dayName}" start="${start}" end="${end}"`);

      const day = updatedDays.find(d => d.name === dayName);
      if (day && start && end && start !== end) {
        day.enabled = true;
        const slot = `${start} - ${end}`;
        if (!day.slots.includes(slot)) {
          day.slots.push(slot);
        }
      } else {
        console.warn(`[Schedule] Skipped entry — day not matched or times equal:`, a);
      }
    });

    console.log('[Schedule] Final days state:', updatedDays.map(d => `${d.name}: enabled=${d.enabled}, slots=${d.slots}`));
    this.days.set(updatedDays);
  }

  toggleDay(name: string): void {
    this.days.update(days => days.map(d =>
      d.name === name ? { ...d, enabled: !d.enabled } : d
    ));
  }

  toggleAppointments(): void {
    this.acceptingAppointments.update(v => !v);
  }

  addTimeSlot(dayName: string, start: string, end: string): void {
    if (!start || !end || start >= end) {
      this.errorMessage.set('End time must be after start time.');
      setTimeout(() => this.errorMessage.set(null), 3000);
      return;
    }
    const slot = `${start} - ${end}`;
    // Prevent duplicate slots
    const day = this.days().find(d => d.name === dayName);
    if (day?.slots.includes(slot)) return;

    this.days.update(days => days.map(d =>
      d.name === dayName ? { ...d, slots: [...d.slots, slot] } : d
    ));
  }

  removeTimeSlot(dayName: string, index: number): void {
    this.days.update(days => days.map(d =>
      d.name === dayName ? { ...d, slots: d.slots.filter((_, i) => i !== index) } : d
    ));
  }

  get totalSlots(): number {
    return this.days().reduce((sum, d) => sum + (d.enabled ? d.slots.length : 0), 0);
  }

  get enabledDaysCount(): number {
    return this.days().filter(d => d.enabled).length;
  }

  saveSchedule(): void {
    if (!this.doctorId) {
      this.errorMessage.set('Doctor ID not found. Please log in again.');
      return;
    }

    this.isSaving.set(true);
    this.errorMessage.set(null);

    const availabilities: any[] = [];
    this.days().forEach(day => {
      if (day.enabled && day.slots.length > 0) {
        day.slots.forEach(slot => {
          const [start, end] = slot.split(' - ');
          availabilities.push({
            availableDay: day.name,
            startTime: start,
            endTime: end
          });
        });
      }
    });

    console.log('[Schedule] Saving to backend. doctorId:', this.doctorId);
    console.log('[Schedule] Payload:', JSON.stringify(availabilities, null, 2));

    this.scheduleService.updateAvailabilities(this.doctorId, availabilities).subscribe({
      next: (res: any) => {
        console.log('[Schedule] Save response:', res);
        this.isSaving.set(false);
        if (res?.success === false) {
          this.errorMessage.set(`Save failed: ${res?.message || 'Unknown error'}`);
          setTimeout(() => this.errorMessage.set(null), 5000);
          return;
        }
        this.successMessage.set('Schedule saved! Reloading to confirm...');
        // Reload from backend to confirm what was actually stored
        this.loadAvailabilities();
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err: any) => {
        console.error('[Schedule] Save error:', err);
        this.isSaving.set(false);
        this.errorMessage.set(`Failed to save: ${err?.error?.message || err?.message || 'Unknown error'}`);
        setTimeout(() => this.errorMessage.set(null), 5000);
      }
    });
  }

  blockDates(): void {
    if (this.awayFrom && this.awayTo) {
      this.successMessage.set(`Blocked dates from ${this.awayFrom} to ${this.awayTo}`);
      setTimeout(() => this.successMessage.set(null), 3000);
    }
  }
}
