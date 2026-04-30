import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  experience: number;
  onlineFee: number;
  inPersonFee: number;
  nextAvailable: string;
  online: boolean;
  verified: boolean;
  languages: string[];
}

@Component({
  selector: 'app-doctor-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search.html',
  styles: [`
    .doctor-card {
      transition: all 0.2s ease;
      cursor: pointer;
    }
    .doctor-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 24px rgba(7, 137, 48, 0.12);
    }
    .filter-chip {
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .filter-chip:hover, .filter-chip.active {
      background: #078930;
      color: white;
    }
    .star-filled { color: #FCD116; }
    .search-box:focus {
      border-color: #078930;
      box-shadow: 0 0 0 3px rgba(7, 137, 48, 0.15);
    }
  `]
})
export class DoctorSearchComponent {
  searchTerm = signal('');
  selectedSpecialty = signal<string | null>(null);
  selectedType = signal<string | null>(null);
  sortBy = signal('rating');
  viewMode = signal<'grid' | 'list'>('grid');

  specialties = [
    'Cardiology', 'Neurology', 'Pediatrics', 'Dermatology',
    'Orthopedics', 'Gynecology', 'Psychiatry', 'Ophthalmology',
    'Internal Medicine', 'General Practice', 'ENT', 'Dentistry'
  ];

  doctors = signal<Doctor[]>([
    {
      id: '1', firstName: 'Sarah', lastName: 'Johnson',
      specialty: 'Cardiology', rating: 4.8, reviewCount: 124,
      experience: 12, onlineFee: 500, inPersonFee: 800,
      nextAvailable: 'Today, 4:30 PM', online: true, verified: true,
      languages: ['English', 'Amharic']
    },
    {
      id: '2', firstName: 'Abebe', lastName: 'Kebede',
      specialty: 'Neurology', rating: 4.9, reviewCount: 89,
      experience: 15, onlineFee: 600, inPersonFee: 900,
      nextAvailable: 'Tomorrow, 9:00 AM', online: false, verified: true,
      languages: ['Amharic', 'English']
    },
    {
      id: '3', firstName: 'Tirunesh', lastName: 'Desta',
      specialty: 'Dermatology', rating: 4.7, reviewCount: 201,
      experience: 8, onlineFee: 400, inPersonFee: 700,
      nextAvailable: 'Today, 6:00 PM', online: true, verified: true,
      languages: ['Amharic', 'Tigrinya']
    },
    {
      id: '4', firstName: 'Yonas', lastName: 'Tadesse',
      specialty: 'Pediatrics', rating: 4.9, reviewCount: 156,
      experience: 20, onlineFee: 550, inPersonFee: 850,
      nextAvailable: 'May 16, 10:00 AM', online: true, verified: true,
      languages: ['English', 'Amharic', 'Oromo']
    },
    {
      id: '5', firstName: 'Meseret', lastName: 'Alemu',
      specialty: 'Gynecology', rating: 4.6, reviewCount: 178,
      experience: 10, onlineFee: 600, inPersonFee: 900,
      nextAvailable: 'May 17, 2:00 PM', online: false, verified: true,
      languages: ['Amharic']
    },
    {
      id: '6', firstName: 'Dawit', lastName: 'Hailemariam',
      specialty: 'Orthopedics', rating: 4.8, reviewCount: 92,
      experience: 14, onlineFee: 700, inPersonFee: 1000,
      nextAvailable: 'Today, 5:00 PM', online: true, verified: true,
      languages: ['English', 'Amharic']
    }
  ]);

  filteredDoctors = signal<Doctor[]>(this.doctors());

  search(): void {
    this.applyFilters();
  }

  filterBySpecialty(specialty: string | null): void {
    this.selectedSpecialty.set(specialty === this.selectedSpecialty() ? null : specialty);
    this.applyFilters();
  }

  filterByType(type: string | null): void {
    this.selectedType.set(type === this.selectedType() ? null : type);
    this.applyFilters();
  }

  setSort(sort: string): void {
    this.sortBy.set(sort);
    this.applyFilters();
  }

  applyFilters(): void {
    let result = [...this.doctors()];
    const term = this.searchTerm().toLowerCase();

    if (term) {
      result = result.filter(d =>
        d.firstName.toLowerCase().includes(term) ||
        d.lastName.toLowerCase().includes(term) ||
        d.specialty.toLowerCase().includes(term)
      );
    }

    if (this.selectedSpecialty()) {
      result = result.filter(d => d.specialty === this.selectedSpecialty());
    }

    if (this.selectedType() === 'online') {
      result = result.filter(d => d.onlineFee > 0);
    } else if (this.selectedType() === 'inperson') {
      result = result.filter(d => d.inPersonFee > 0);
    }

    // Sort
    switch (this.sortBy()) {
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      case 'experience': result.sort((a, b) => b.experience - a.experience); break;
      case 'fee-low': result.sort((a, b) => a.onlineFee - b.onlineFee); break;
      case 'fee-high': result.sort((a, b) => b.onlineFee - a.onlineFee); break;
    }

    this.filteredDoctors.set(result);
  }

  getStars(rating: number): string {
    return '⭐'.repeat(Math.floor(rating));
  }
}