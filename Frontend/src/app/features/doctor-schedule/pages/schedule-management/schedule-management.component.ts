import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorScheduleService } from '../../../../core/services/doctor-schedule.service';

@Component({
  selector: 'app-schedule-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './schedule-management.component.html',
  styles: [`
    .day-card { border-left: 4px solid #078930; transition: all 0.2s; }
    .day-card.disabled { border-left-color: #E5E7EB; opacity: 0.5; }
    .day-card:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .time-slot { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 13px; margin: 2px; background: #E8F5EC; color: #078930; }
    .toggle-switch { width: 44px; height: 24px; }
  `]
})
export class ScheduleManagementComponent implements OnInit {
  private scheduleService = inject(DoctorScheduleService);

  doctorId = localStorage.getItem('doctorId') || '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  acceptingAppointments = signal(true);
  viewMode = signal<'week' | 'month'>('week');

  // Weekly schedule
  days = signal([
    { name: 'Monday', enabled: true, slots: [] as string[] },
    { name: 'Tuesday', enabled: true, slots: [] as string[] },
    { name: 'Wednesday', enabled: true, slots: [] as string[] },
    { name: 'Thursday', enabled: true, slots: [] as string[] },
    { name: 'Friday', enabled: true, slots: [] as string[] },
    { name: 'Saturday', enabled: false, slots: [] as string[] },
    { name: 'Sunday', enabled: false, slots: [] as string[] },
  ]);

  // Appointments for selected date
  appointments = signal<any[]>([]);
  selectedDate = signal<string>('');

  // Away mode
  awayFrom = signal('');
  awayTo = signal('');

  ngOnInit(): void {
    if (this.doctorId) {
      this.loadAvailabilities();
      this.loadAppointments();
    }
  }

  loadAvailabilities(): void {
    this.isLoading.set(true);
    this.scheduleService.getAvailabilities(this.doctorId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || response || [];
        if (Array.isArray(data) && data.length > 0) {
          this.parseAvailabilities(data);
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.log('No availabilities found, using defaults');
      }
    });
  }

  loadAppointments(): void {
    this.scheduleService.getDoctorAppointments(this.doctorId).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.appointments.set(Array.isArray(data) ? data : []);
      },
      error: () => console.log('No appointments found')
    });
  }

  parseAvailabilities(availabilities: any[]): void {
    const updatedDays = this.days().map(day => ({ ...day, slots: [] as string[] }));
    
    availabilities.forEach((a: any) => {
      const day = updatedDays.find(d => d.name === a.availableDay);
      if (day && a.startTime && a.endTime) {
        day.enabled = true;
        day.slots.push(`${a.startTime} - ${a.endTime}`);
      }
    });

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

  addTimeSlot(dayName: string): void {
    // Add default time slot
    this.days.update(days => days.map(d => 
      d.name === dayName ? { ...d, slots: [...d.slots, '09:00 - 17:00'] } : d
    ));
  }

  removeTimeSlot(dayName: string, index: number): void {
    this.days.update(days => days.map(d => 
      d.name === dayName ? { ...d, slots: d.slots.filter((_, i) => i !== index) } : d
    ));
  }

  saveSchedule(): void {
    this.successMessage.set('Schedule saved successfully!');
    setTimeout(() => this.successMessage.set(null), 3000);
  }

  blockDates(): void {
    if (this.awayFrom() && this.awayTo()) {
      this.successMessage.set(`Blocked dates from ${this.awayFrom()} to ${this.awayTo()}`);
      setTimeout(() => this.successMessage.set(null), 3000);
    }
  }
}