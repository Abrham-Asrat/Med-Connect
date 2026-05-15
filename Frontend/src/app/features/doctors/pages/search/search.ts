import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../../core/services/doctor.service';
import { SpecialtyService } from '../../../../core/services/specialty.service';

interface Doctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  qualifications?: string;
  biography?: string;
  rating?: number;
  reviewCount?: number;
  onlineFee?: number;
  inPersonFee?: number;
  profilePicture?: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search.html',
  styleUrls: ['./search.scss']
})
export class DoctorSearchComponent implements OnInit {
  private doctorService = inject(DoctorService);
  private specialtyService = inject(SpecialtyService);

  searchTerm = signal('');
  selectedSpecialty = signal<string | null>(null);
  sortBy = signal('name');
  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  allDoctors = signal<Doctor[]>([]);
  filteredDoctors = signal<Doctor[]>([]);

  specialties: string[] = [];

  ngOnInit(): void {
    this.loadDoctors();
    this.loadSpecialties();
  }

  loadSpecialties(): void {
    this.specialtyService.getAllSpecialties().subscribe({
      next: (response: any) => {
        this.specialties = response?.data || response || [];
      },
      error: (err) => console.error('Error loading specialties:', err)
    });
  }

  // Load doctors from backend
  loadDoctors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.doctorService.getAllDoctors().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('Doctors response:', response);
        const rawDoctors = response?.data || response || [];

        // Map backend DTO (which uses specialtyModel) to frontend format
        const doctors = rawDoctors.map((d: any) => {
          const docId = d.doctorId || d.userId || d.id;
          return {
            ...d,
            doctorId: docId,
            specialties: d.specialtyModel || d.specialties || [],
            onlineFee: d.onlineAppointmentFee,
            inPersonFee: d.inPersonAppointmentFee,
            isVerified: d.isVerified
          };
        });

        this.allDoctors.set(doctors);
        this.applyFilters();
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading doctors:', error);
        this.errorMessage.set('Failed to load doctors. Please try again.');
      }
    });
  }

  search(): void { this.applyFilters(); }

  filterBySpecialty(specialty: string): void {
    this.selectedSpecialty.set(this.selectedSpecialty() === specialty ? null : specialty);
    this.applyFilters();
  }

  setSort(sort: string): void { this.sortBy.set(sort); this.applyFilters(); }

  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedSpecialty.set(null);
    this.sortBy.set('name');
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.allDoctors()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(d =>
        d.firstName?.toLowerCase().includes(term) ||
        d.lastName?.toLowerCase().includes(term) ||
        d.specialties?.some(s => s.toLowerCase().includes(term))
      );
    }

    if (this.selectedSpecialty()) {
      result = result.filter(d =>
        d.specialties?.includes(this.selectedSpecialty()!)
      );
    }

    // Sort
    switch (this.sortBy()) {
      case 'name': result.sort((a, b) => (a.firstName || '').localeCompare(b.firstName || '')); break;
      case 'rating': result.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
    }

    this.filteredDoctors.set(result);
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedSpecialty());
  }

  getInitials(first: string, last: string): string {
    return `${first?.charAt(0) || ''}${last?.charAt(0) || ''}`;
  }

  // Rating helpers
  getStars(rating: number): string {
    const full = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 >= 0.5;
    let stars = '★'.repeat(full);
    if (hasHalf) stars += '½';
    return stars || '';
  }

  getRatingDisplay(rating: number): string {
    return (rating || 0).toFixed(1);
  }

  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-success';
    if (rating >= 4.0) return 'text-primary';
    if (rating >= 3.0) return 'text-warning';
    return 'text-medium';
  }
}