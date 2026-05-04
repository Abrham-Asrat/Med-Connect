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
    .nav-pills .nav-link { color: #64748b; transition: all 0.3s; border: 1px solid transparent; }
    .nav-pills .nav-link.active { background: #078930 !important; color: #fff !important; box-shadow: 0 4px 12px rgba(7, 137, 48, 0.2); }
    .nav-pills .nav-link:hover:not(.active) { background: #f8fafc; color: #078930; }
    
    .day-row { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-left: 5px solid #078930; }
    .day-row:hover { transform: translateX(5px); border-left-width: 8px; }
    .disabled-row { opacity: 0.5; border-left-color: #e2e8f0; pointer-events: none; }
    
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

  doctorId = localStorage.getItem('doctorId') || '';
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  acceptingAppointments = signal(true);

  // Tab Management
  activeTab = signal<'appointments' | 'availability' | 'timeoff'>('appointments');
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

  addTimeSlot(dayName: string, start: string, end: string): void {
    if (!start || !end) return;
    const slot = `${start} - ${end}`;
    this.days.update(days => days.map(d =>
      d.name === dayName ? { ...d, slots: [...d.slots, slot] } : d
    ));
  }

  removeTimeSlot(dayName: string, index: number): void {
    this.days.update(days => days.map(d =>
      d.name === dayName ? { ...d, slots: d.slots.filter((_, i) => i !== index) } : d
    ));
  }

  saveSchedule(): void {
    if (!this.doctorId) return;

    this.isLoading.set(true);
    const availabilities: any[] = [];

    this.days().forEach(day => {
      if (day.enabled) {
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

    this.scheduleService.updateAvailabilities(this.doctorId, availabilities).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Schedule synchronized with system successfully!');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Failed to save schedule to server.');
        setTimeout(() => this.errorMessage.set(null), 3000);
      }
    });
  }

  blockDates(): void {
    if (this.awayFrom() && this.awayTo()) {
      this.successMessage.set(`Blocked dates from ${this.awayFrom()} to ${this.awayTo()}`);
      setTimeout(() => this.successMessage.set(null), 3000);
    }
  }
}
