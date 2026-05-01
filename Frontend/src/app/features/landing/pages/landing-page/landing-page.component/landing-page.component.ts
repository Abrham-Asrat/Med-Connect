import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../../environments/environment';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './landing-page.component.html',
  styles: [`
    .hero { background: linear-gradient(135deg, #078930, #056B24); }
    .section-padding { padding: 80px 0; }
    .bg-light-gray { background: #F8F9FA; }
    .feature-icon { width: 64px; height: 64px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .blog-card { transition: all 0.3s; cursor: pointer; }
    .blog-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(7,137,48,0.12); }
    .contact-card { border-left: 4px solid #078930; }
    .nav-link-custom { color: white; text-decoration: none; padding: 8px 16px; border-radius: 8px; transition: all 0.2s; }
    .nav-link-custom:hover { background: rgba(255,255,255,0.15); }
    .counter { font-size: 40px; font-weight: 700; color: #078930; }
  `]
})
export class LandingPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  blogs = signal<any[]>([]);
  contactLoading = signal(false);
  contactSuccess = signal(false);
  contactError = signal<string | null>(null);

  contactForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    message: ['', [Validators.required, Validators.maxLength(1000)]],
  });

  stats = [
    { number: '2000+', label: 'Verified Doctors' },
    { number: '50,000+', label: 'Patients' },
    { number: '100,000+', label: 'Appointments' },
    { number: '98%', label: 'Satisfaction' }
  ];

  teamMembers = [
    { name: 'Dr. Abebe Kebede', role: 'Chief Medical Officer', initials: 'AK' },
    { name: 'Dr. Sarah Johnson', role: 'Head of Cardiology', initials: 'SJ' },
    { name: 'Ms. Tirunesh Desta', role: 'Patient Relations', initials: 'TD' },
    { name: 'Mr. Dawit Haile', role: 'Technical Lead', initials: 'DH' }
  ];

  ngOnInit(): void {
    this.loadBlogs();
  }

  loadBlogs(): void {
    this.http.get(`${this.apiUrl}/blogs/all`).subscribe({
      next: (response: any) => {
        const data = response?.data || response || [];
        this.blogs.set(Array.isArray(data) ? data.slice(0, 3) : []);
      },
      error: () => {
        // Fallback mock blogs
        this.blogs.set([
          { id:'1', title:'Understanding Blood Pressure', authorName:'Dr. Sarah Johnson', publishedAt:new Date().toISOString(), content:'A comprehensive guide to understanding blood pressure readings and maintaining heart health.', category:'Health Tips', viewCount:12500 },
          { id:'2', title:'The Importance of Regular Check-ups', authorName:'Dr. Abebe Kebede', publishedAt:new Date().toISOString(), content:'Prevention is better than cure. Learn why annual check-ups are crucial for your health.', category:'Patient Education', viewCount:8200 },
          { id:'3', title:'Healthy Eating for a Healthy Heart', authorName:'Dr. Sarah Johnson', publishedAt:new Date().toISOString(), content:'Discover the best foods for cardiovascular health and how to incorporate them into your diet.', category:'Wellness', viewCount:15000 }
        ]);
      }
    });
  }

  submitContact(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }
    this.contactLoading.set(true);
    this.contactError.set(null);
    this.http.post(`${this.apiUrl}/Contact`, this.contactForm.value).subscribe({
      next: () => {
        this.contactLoading.set(false);
        this.contactSuccess.set(true);
        this.contactForm.reset();
        setTimeout(() => this.contactSuccess.set(false), 5000);
      },
      error: (err) => {
        this.contactLoading.set(false);
        this.contactError.set(err?.error?.message || 'Failed to send message. Please try again.');
      }
    });
  }

  scrollTo(section: string): void {
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
  }
}