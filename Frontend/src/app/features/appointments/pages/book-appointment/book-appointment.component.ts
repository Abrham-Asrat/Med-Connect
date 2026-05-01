import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../../../core/services/appointment.service';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './book-appointment.component.html',
  styles: [`
    .step-dot { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; border: 2px solid #E5E7EB; background: white; color: #6B7280; }
    .step-dot.active { background: #078930; color: white; border-color: #078930; }
    .step-dot.done { background: #078930; color: white; border-color: #078930; }
    .step-line { width: 40px; height: 2px; background: #E5E7EB; }
    .step-line.done { background: #078930; }
    .type-card { cursor: pointer; border: 2px solid #E5E7EB; border-radius: 12px; padding: 20px; text-align: center; transition: all 0.2s ease; }
    .type-card:hover, .type-card.selected { border-color: #078930; background: #E8F5EC; }
    .time-slot { cursor: pointer; padding: 8px 16px; border-radius: 20px; border: 1px solid #E5E7EB; font-size: 14px; transition: all 0.2s; }
    .time-slot:hover:not(.booked) { border-color: #078930; background: #E8F5EC; }
    .time-slot.selected { background: #078930; color: white; border-color: #078930; }
    .time-slot.booked { background: #F8F9FA; color: #D1D5DB; cursor: not-allowed; text-decoration: line-through; }
  `]
})
export class BookAppointmentComponent implements OnInit {
  private appointmentService = inject(AppointmentService);
  private router = inject(Router);

  step = signal(1);
  appointmentType = signal<'Virtual' | 'InPerson'>('Virtual');
  selectedDate = signal('');
  selectedTime = signal('');
  notes = signal('');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  successData = signal<any>(null);

  // Get from localStorage
  patientId = localStorage.getItem('patientId') || '';
 doctorId = 'c2cba4dc-3521-4b7c-aea6-2706b83ab22d';
doctorName = 'Mekdes'; // We can make this dynamic later
  // Dates for next 7 days
  dates = signal<{ date: string; day: string; dayNum: number; month: string }[]>([]);

  morningSlots = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  afternoonSlots = ['13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  eveningSlots = ['17:00', '17:30', '18:00', '18:30'];

  ngOnInit(): void {
    this.generateDates();
    this.selectedDate.set(this.dates()[0]?.date || '');
  }

  generateDates(): void {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      dates.push({
        date: d.toISOString().split('T')[0],
        day: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: d.getDate(),
        month: d.toLocaleDateString('en-US', { month: 'short' })
      });
    }
    this.dates.set(dates);
  }

  selectType(type: 'Virtual' | 'InPerson'): void {
    this.appointmentType.set(type);
    this.step.set(2);
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set('');
  }

  selectTime(time: string): void {
    this.selectedTime.set(time);
  }

  confirmDetails(): void { this.step.set(3); }
  goToPayment(): void { this.step.set(4); }

  // ✅ POST /api/appointments/book
  bookAppointment(): void {
    if (!this.patientId) {
      this.errorMessage.set('Patient ID not found. Please login again.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const data = {
      doctorId: this.doctorId,
      patientId: this.patientId,
      appointmentDate: this.selectedDate(),
      appointmentTime: this.selectedTime(),
      appointmentType: this.appointmentType()
    };

    console.log('Booking:', data);

    this.appointmentService.bookAppointment(data).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('Booking response:', response);
        if (response?.success) {
          this.successData.set(response.data);
          this.step.set(5);
        } else {
          this.errorMessage.set(response?.message || 'Booking failed.');
        }
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Booking error:', error);
        this.errorMessage.set(error?.error?.message || 'Booking failed. Please try again.');
      }
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/patient/dashboard']);
  }
}