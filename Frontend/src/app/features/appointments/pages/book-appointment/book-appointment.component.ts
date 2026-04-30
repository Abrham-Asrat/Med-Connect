import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-book-appointment',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './book-appointment.component.html',
  styles: [`
    .step-dot { width: 32px; height: 32px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; border: 2px solid #E5E7EB; background: white; color: #6B7280; }
    .step-dot.active { background: #078930; color: white; border-color: #078930; }
    .step-dot.done { background: #078930; color: white; border-color: #078930; }
    .step-line { width: 40px; height: 2px; background: #E5E7EB; }
    .step-line.done { background: #078930; }
    .type-card { cursor: pointer; border: 2px solid #E5E7EB; transition: all 0.2s; }
    .type-card:hover, .type-card.selected { border-color: #078930; background: #E8F5EC; }
    .time-slot { cursor: pointer; transition: all 0.2s; }
    .time-slot:hover { border-color: #078930; background: #E8F5EC; }
    .time-slot.selected { background: #078930; color: white; border-color: #078930; }
    .time-slot.booked { background: #F8F9FA; color: #D1D5DB; cursor: not-allowed; text-decoration: line-through; }
    .booking-card { max-width: 700px; }
  `]
})
export class BookAppointmentComponent {
  step = signal(1);
  
  // Step 1: Type
  appointmentType = signal<'Online' | 'InPerson' | null>(null);
  
  // Step 2: Date & Time
  selectedDate = signal<string | null>(null);
  selectedTime = signal<string | null>(null);
  
  // Step 4: Payment
  paymentMethod = signal<'chapa' | 'card' | null>(null);
  isProcessing = signal(false);
  isSuccess = signal(false);
  
  // Doctor info (hardcoded for demo)
  doctor = {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    rating: 4.8,
    onlineFee: 500,
    inPersonFee: 800,
    image: 'SJ'
  };

  // Generate dates for next 7 days
  availableDates = signal(this.generateDates());
  
  // Time slots
  morningSlots = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM'];
  afternoonSlots = ['1:00 PM', '1:30 PM', '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM', '4:00 PM', '4:30 PM'];
  eveningSlots = ['5:00 PM', '5:30 PM', '6:00 PM', '6:30 PM', '7:00 PM'];
  
  bookedSlots = ['9:00 AM', '2:00 PM', '5:30 PM']; // Simulated booked slots

  generateDates() {
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
    return dates;
  }

  selectType(type: 'Online' | 'InPerson'): void {
    this.appointmentType.set(type);
    this.step.set(2);
  }

  selectDate(date: string): void {
    this.selectedDate.set(date);
    this.selectedTime.set(null);
  }

  selectTime(time: string): void {
    if (!this.isBooked(time)) {
      this.selectedTime.set(time);
    }
  }

  isBooked(time: string): boolean {
    return this.bookedSlots.includes(time);
  }

  confirmDetails(): void {
    this.step.set(3);
  }

  proceedToPayment(): void {
    this.step.set(4);
  }

  processPayment(): void {
    this.isProcessing.set(true);
    setTimeout(() => {
      this.isProcessing.set(false);
      this.isSuccess.set(true);
      this.step.set(5);
    }, 2000);
  }

  getFee(): number {
    return this.appointmentType() === 'Online' ? this.doctor.onlineFee : this.doctor.inPersonFee;
  }

  back(): void {
    if (this.step() > 1) this.step.update(v => v - 1);
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  }
}