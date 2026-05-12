import { Component, inject, signal, OnInit, AfterViewInit, ElementRef, ViewChildren, QueryList, HostListener } from '@angular/core';
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
  styleUrl: './landing-page.component.scss'
})
export class LandingPageComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  @ViewChildren('animatedEl') animatedElements!: QueryList<ElementRef>;

  isScrolled = signal(false);

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 50);
  }

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

    { number: '2,000+', label: 'Verified Doctors' },
    { number: '50k+', label: 'Patients Treated' },
    { number: '100k+', label: 'Appointments' },
    { number: '98%', label: 'Satisfaction Rate' }

  ];

  howItWorks = [
    { icon: 'bi-search', title: 'Find a Doctor', desc: 'Search by specialty, name, or availability.' },
    { icon: 'bi-calendar-check', title: 'Book an Appointment', desc: 'Secure an online or physical visit in seconds.' },
    { icon: 'bi-chat-heart', title: 'Connect & Heal', desc: 'Consult with your doctor and get your digital records.' }
  ];

  testimonials = signal<any[]>([
    { name: 'Tewodros A.', role: 'Patient', quote: 'Med-Connect saved me so much time. I found a specialist and booked my appointment on the same day.', rating: 5 },
    { name: 'Dr. Selamawit T.', role: 'Pediatrician', quote: 'The platform helps me manage my schedule effortlessly while giving my patients a top-tier digital experience.', rating: 5 },
    { name: 'Betelhem Y.', role: 'Patient', quote: 'Having all my medical records in one secure place gives me incredible peace of mind. Highly recommended!', rating: 5 }
  ]);

  faqs = [
    { q: 'Is Med-Connect completely free for patients?', a: 'Yes! Creating an account and searching for doctors is 100% free. You only pay standard consultation fees to the doctors.', open: false },
    { q: 'How do I know the doctors are verified?', a: 'Every specialist on Med-Connect goes through a rigorous background check and credential verification with the Ministry of Health.', open: false },
    { q: 'Can I cancel or reschedule an appointment?', a: 'Absolutely. You can easily reschedule or cancel appointments up to 24 hours before your scheduled visit without penalties.', open: false },
    { q: 'Are my medical records secure?', a: 'We use enterprise-grade encryption to ensure your medical history remains private and accessible only to you and your authorized doctors.', open: false }
  ];

  ngOnInit(): void {
    this.loadBlogs();
    this.loadTestimonials();
  }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    this.animatedElements.forEach((el) => {
      observer.observe(el.nativeElement);
    });
  }

  loadBlogs(): void {
    const mockBlogs = [
      { id: '1', title: 'Understanding Blood Pressure', authorName: 'Dr. Sarah Johnson', publishedAt: new Date().toISOString(), content: 'A comprehensive guide to understanding blood pressure readings and maintaining heart health.', category: 'Health Tips', viewCount: 12500 },
      { id: '2', title: 'The Importance of Regular Check-ups', authorName: 'Dr. Abebe Kebede', publishedAt: new Date().toISOString(), content: 'Prevention is better than cure. Learn why annual check-ups are crucial for your health.', category: 'Patient Education', viewCount: 8200 },
      { id: '3', title: 'Healthy Eating for a Healthy Heart', authorName: 'Dr. Sarah Johnson', publishedAt: new Date().toISOString(), content: 'Discover the best foods for cardiovascular health and how to incorporate them into your diet.', category: 'Wellness', viewCount: 15000 }
    ];

    this.http.get(`${this.apiUrl}/blogs/all`).subscribe({
      next: (response: any) => {
        let data = response?.Data || response?.data || response || [];
        // Extract array from response wrapper if data contains an array-like structure.
        if (response?.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (response?.Data && Array.isArray(response.Data)) {
          data = response.Data;
        } else if (Array.isArray(response)) {
          data = response;
        }

        if (Array.isArray(data) && data.length > 0) {
          const mappedBlogs = data.slice(0, 3).map((b: any) => ({
            id: b.blogId || b.id,
            title: b.title,
            content: b.content,
            authorName: b.author?.firstName ? `${b.author.firstName} ${b.author.lastName}` : (b.authorName || 'Dr. Abebe'),
            category: (b.tags && b.tags.length > 0) ? b.tags[0] : (b.category || 'Health Tip'),
            publishedAt: b.createdAt || b.publishedAt || new Date().toISOString(),
            viewCount: b.viewCount || Math.floor(Math.random() * 500) + 100
          }));
          this.blogs.set(mappedBlogs);
        } else {
          // Use mock data if the database returns an empty array
          this.blogs.set(mockBlogs);
        }
      },
      error: () => {
        // Fallback mock blogs on error
        this.blogs.set(mockBlogs);
      }
    });
  }

  loadTestimonials(): void {
    const mockTestimonials = [
      { name: 'Tewodros A.', role: 'Patient', quote: 'Med-Connect saved me so much time. I found a specialist and booked my appointment on the same day.', rating: 5 },
      { name: 'Dr. Selamawit T.', role: 'Pediatrician', quote: 'The platform helps me manage my schedule effortlessly while giving my patients a top-tier digital experience.', rating: 5 },
      { name: 'Betelhem Y.', role: 'Patient', quote: 'Having all my medical records in one secure place gives me incredible peace of mind. Highly recommended!', rating: 5 }
    ];

    this.http.get(`${this.apiUrl}/reviews`).subscribe({
      next: (response: any) => {
        let data = response?.Data || response?.data || response || [];
        if (response?.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (response?.Data && Array.isArray(response.Data)) {
          data = response.Data;
        } else if (Array.isArray(response)) {
          data = response;
        }

        if (Array.isArray(data) && data.length > 0) {
          const mappedReviews = data.slice(0, 3).map((r: any) => ({
            name: r.patient?.firstName ? `${r.patient.firstName} ${r.patient.lastName?.charAt(0) || ''}.` : (r.patientName || 'Patient'),
            role: 'Patient',
            quote: r.reviewText || '',
            rating: r.starRating || 5
          }));
          this.testimonials.set(mappedReviews);
        } else {
          this.testimonials.set(mockTestimonials);
        }
      },
      error: () => {
        this.testimonials.set(mockTestimonials);
      }
    });
  }

  toggleFaq(index: number) {
    this.faqs[index].open = !this.faqs[index].open;
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