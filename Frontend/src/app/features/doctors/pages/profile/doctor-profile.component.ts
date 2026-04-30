import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-doctor-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './doctor-profile.component.html',
  styles: [`
    .profile-header { background: linear-gradient(135deg, #078930, #056B24); }
    .star-filled { color: #FCD116; }
    .rating-bar { height: 6px; border-radius: 3px; background: #E5E7EB; }
    .rating-bar-fill { height: 100%; border-radius: 3px; background: #FCD116; }
    .time-slot { cursor: pointer; transition: all 0.2s; }
    .time-slot:hover:not(.booked) { border-color: #078930; background: #E8F5EC; }
    .time-slot.selected { background: #078930; color: white; border-color: #078930; }
    .time-slot.booked { background: #F8F9FA; color: #D1D5DB; cursor: not-allowed; text-decoration: line-through; }
    .tab-active { border-bottom: 3px solid #078930; color: #078930; font-weight: 700; }
    .review-card { border-left: 4px solid #078930; }
    .booking-card { position: sticky; top: 20px; }
  `]
})
export class DoctorProfileComponent {
  activeTab = signal<'about' | 'reviews' | 'availability'>('about');
  showAllReviews = signal(false);

  doctor = {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    specialty: 'Cardiology',
    qualifications: 'MD, Board Certified in Cardiology, FACC',
    experience: 12,
    rating: 4.8,
    reviewCount: 124,
    patientCount: 2500,
    satisfaction: 97,
    onlineFee: 500,
    inPersonFee: 800,
    bio: 'Dr. Sarah Johnson is a board-certified cardiologist with over 12 years of experience in diagnosing and treating heart conditions. She specializes in preventive cardiology, hypertension management, and cardiac rehabilitation. Dr. Johnson completed her medical training at Addis Ababa University and her cardiology fellowship at Black Lion Hospital.',
    languages: ['English', 'Amharic', 'Tigrinya'],
    education: [
      'MD - Addis Ababa University, 2012',
      'Cardiology Fellowship - Black Lion Hospital, 2016',
      'Board Certified - Ethiopian Medical Association'
    ],
    memberships: ['Ethiopian Medical Association', 'Ethiopian Cardiac Society', 'World Heart Federation'],
    awards: ['Best Cardiologist 2024 - Addis Ababa Medical Awards', 'Patient Choice Award 2023'],
    clinic: {
      name: 'Addis Cardiac Center',
      address: 'Bole Road, Addis Ababa, Ethiopia',
      phone: '+251-111-234567',
      hours: 'Mon-Fri: 8AM-6PM, Sat: 9AM-2PM'
    }
  };

  reviews = signal([
    { id:'1', patient:'Abebe T.', rating:5, date:'May 15, 2026', text:'Excellent doctor! Very thorough and caring. She took time to explain my condition clearly.', verified:true, helpful:12 },
    { id:'2', patient:'Meron H.', rating:5, date:'May 10, 2026', text:'Best cardiologist in Addis. Very professional and knowledgeable.', verified:true, helpful:8 },
    { id:'3', patient:'Dawit M.', rating:4, date:'Apr 28, 2026', text:'Good experience overall. Wait time was a bit long but the consultation was worth it.', verified:true, helpful:5 },
    { id:'4', patient:'Sara T.', rating:5, date:'Apr 15, 2026', text:'Dr. Johnson saved my father\'s life. Forever grateful!', verified:true, helpful:15 },
    { id:'5', patient:'Henok G.', rating:5, date:'Mar 30, 2026', text:'Very patient and kind doctor. Highly recommended for heart issues.', verified:true, helpful:7 },
  ]);

  availableDates = signal([
    { date:'2026-05-15', day:'Mon', dayNum:15, month:'May' },
    { date:'2026-05-16', day:'Tue', dayNum:16, month:'May' },
    { date:'2026-05-17', day:'Wed', dayNum:17, month:'May' },
    { date:'2026-05-18', day:'Thu', dayNum:18, month:'May' },
    { date:'2026-05-19', day:'Fri', dayNum:19, month:'May' },
    { date:'2026-05-20', day:'Sat', dayNum:20, month:'May' },
  ]);

  morningSlots = ['8:00 AM', '8:30 AM', '9:00 AM', '9:30 AM', '10:00 AM', '11:00 AM'];
  afternoonSlots = ['1:00 PM', '2:00 PM', '2:30 PM', '3:00 PM', '4:00 PM'];
  bookedSlots = ['9:00 AM', '2:00 PM', '4:00 PM'];

  selectedDate = signal('2026-05-15');
  selectedTime = signal<string | null>(null);

  getStars(rating: number): string { return '⭐'.repeat(Math.floor(rating)); }
  getStarArray(rating: number): number[] { return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0); }

  isBooked(time: string): boolean { return this.bookedSlots.includes(time); }

  selectDate(date: string): void { this.selectedDate.set(date); this.selectedTime.set(null); }
  selectTime(time: string): void { if (!this.isBooked(time)) this.selectedTime.set(time); }
}