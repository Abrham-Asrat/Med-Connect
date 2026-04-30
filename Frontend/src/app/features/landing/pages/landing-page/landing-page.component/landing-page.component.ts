import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing-page.component.html',
  styles: [`
    .hero-section { background: linear-gradient(135deg, #078930, #056B24); min-height: 90vh; }
    .section-padding { padding: 80px 0; }
    .bg-light-gray { background: #F8F9FA; }
    .feature-icon { width: 72px; height: 72px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 32px; }
    .step-card { transition: all 0.3s ease; cursor: pointer; }
    .step-card:hover { transform: translateY(-8px); box-shadow: 0 8px 32px rgba(7,137,48,0.15); }
    .testimonial-card { border-left: 4px solid #078930; transition: all 0.3s ease; }
    .testimonial-card:hover { transform: translateY(-4px); box-shadow: 0 4px 20px rgba(7,137,48,0.12); }
    .stat-number { font-size: 48px; font-weight: 700; color: #078930; }
    .footer { background: #04521D; }
    .footer a { transition: color 0.2s; }
    .footer a:hover { color: #FCD116 !important; }
    .check-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .check-icon { color: #078930; font-size: 20px; margin-top: 2px; }
    .specialty-card { transition: all 0.3s ease; cursor: pointer; border: 2px solid transparent; }
    .specialty-card:hover { border-color: #078930; transform: translateY(-4px); }
    .counter { font-size: 42px; font-weight: 700; color: #078930; }
  `]
})
export class LandingPageComponent {
  // Stats that could be animated
  stats = signal([
    { number: '2000+', label: 'Verified Doctors' },
    { number: '50,000+', label: 'Registered Patients' },
    { number: '100,000+', label: 'Appointments Completed' },
    { number: '98%', label: 'Patient Satisfaction' }
  ]);

  // How it works steps
  steps = signal([
    { icon: 'bi-search', title: 'Find Your Doctor', desc: 'Search by specialty, rating, or availability. All doctors are admin-verified.' },
    { icon: 'bi-calendar-check', title: 'Book Instantly', desc: 'Choose online or in-person appointments. Select your preferred time slot.' },
    { icon: 'bi-heart-pulse', title: 'Get Quality Care', desc: 'Consult via secure video call or visit in person. Receive quality healthcare.' }
  ]);

  // Patient benefits
  patientBenefits = signal([
    'Search doctors by specialty, location, and availability',
    'Book online or in-person appointments 24/7',
    'Secure video consultations from anywhere in Ethiopia',
    'Access your medical records, prescriptions, and history',
    'Rate and review your healthcare experience',
    'Emergency contact information always available'
  ]);

  // Doctor benefits
  doctorBenefits = signal([
    'Reach thousands of patients across Ethiopia',
    'Manage your schedule and appointments with ease',
    'Conduct secure online consultations via video',
    'Build your professional reputation with reviews',
    'Admin-verified credentials boost patient trust',
    'Integrated payment processing via Chapa'
  ]);

  // Testimonials
  testimonials = signal([
    { name: 'Abebe T.', location: 'Addis Ababa', rating: 5, text: 'Med-Connect made it so easy to find a cardiologist. Dr. Johnson was excellent! I booked online and had my consultation the same day.' },
    { name: 'Meron H.', location: 'Bahir Dar', rating: 5, text: 'As someone living outside Addis, the online consultation feature is a lifesaver. I can consult with top doctors without traveling.' },
    { name: 'Tigist D.', location: 'Adama', rating: 4, text: 'The doctor verification gave me confidence. I know every doctor on this platform is properly vetted. Highly recommended!' }
  ]);

  // Specialties
  specialties = signal([
    { icon: 'bi-heart-pulse', name: 'Cardiology', color: '#DA121A' },
    { icon: 'bi-brain', name: 'Neurology', color: '#007BFF' },
    { icon: 'bi-people', name: 'Pediatrics', color: '#FCD116' },
    { icon: 'bi-droplet', name: 'Dermatology', color: '#078930' },
    { icon: 'bi-bone', name: 'Orthopedics', color: '#6B7280' },
    { icon: 'bi-gender-female', name: 'Gynecology', color: '#DA121A' }
  ]);

  // Footer links
  quickLinks = signal(['Home', 'Find Doctors', 'Book Appointment', 'For Doctors', 'About Us', 'Contact']);
  supportLinks = signal(['Help Center', 'Privacy Policy', 'Terms of Service', 'FAQs', 'Accessibility']);
}