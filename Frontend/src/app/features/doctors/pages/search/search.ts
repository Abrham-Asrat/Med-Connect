import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DoctorService } from '../../../../core/services/doctor.service';

interface Doctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  qualifications: string;
  biography: string;
  rating?: number;
  reviewCount?: number;
  onlineFee?: number;
  inPersonFee?: number;
  profilePicture?: string;
}

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search.html',
  styles: [`
    .doctor-card { transition: all 0.2s ease; cursor: pointer; }
    .doctor-card:hover { transform: translateY(-4px); box-shadow: 0 4px 24px rgba(7,137,48,0.12); }
    .filter-chip { cursor: pointer; transition: all 0.2s ease; }
    .filter-chip:hover, .filter-chip.active { background: #078930; color: white; }
    .star-filled { color: #FCD116; }
  `]
})
export class DoctorSearchComponent implements OnInit {
  private doctorService = inject(DoctorService);

  searchTerm = signal('');
  selectedSpecialty = signal<string | null>(null);
  sortBy = signal('name');
  viewMode = signal<'grid' | 'list'>('grid');
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  allDoctors = signal<Doctor[]>([]);
  filteredDoctors = signal<Doctor[]>([]);

  specialties = [
    'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology',
    'Orthopedics', 'Gynecology', 'Psychiatry', 'Ophthalmology',
    'Internal Medicine', 'General Practice', 'ENT', 'Dentistry'
  ];

  ngOnInit(): void {
    this.loadDoctors();
  }

  // ✅ Load doctors from backend
  loadDoctors(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.doctorService.getAllDoctors().subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        console.log('Doctors response:', response);
        
        const doctors = response?.data || response || [];
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

  getStars(rating: number): string {
    return '⭐'.repeat(Math.floor(rating || 0));
  }
}