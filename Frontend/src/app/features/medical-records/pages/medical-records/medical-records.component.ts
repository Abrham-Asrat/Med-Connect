import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { AppointmentService } from '../../../../core/services/appointment.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.scss']
})
export class MedicalRecordsComponent implements OnInit {
  private authService = inject(AuthService);
  private appointmentService = inject(AppointmentService);
  private http = inject(HttpClient);

  private apiUrl = environment.apiUrl;

  user = this.authService.currentUser;
  patientId = localStorage.getItem('patientId') || '';

  isLoading = signal(false);
  activeCategory = signal('all');
  appointments = signal<any[]>([]);
  filteredRecords = signal<any[]>([]);

  categories = ['all', 'prescription', 'lab', 'diagnosis'];

  ngOnInit(): void {
    this.loadAppointmentHistory();
  }

  loadAppointmentHistory(): void {
    if (!this.patientId) return;

    this.isLoading.set(true);

    this.appointmentService.getPatientAppointments(this.patientId).subscribe({
      next: (response: any) => {
        this.isLoading.set(false);
        const data = response?.data || [];
        this.appointments.set(Array.isArray(data) ? data : []);
        this.filterCategory('all');
      },
      error: (error: any) => {
        this.isLoading.set(false);
        console.error('Error loading records:', error);
      }
    });
  }

  filterCategory(category: string): void {
    this.activeCategory.set(category);
    const appointments = this.appointments();

    // Convert appointments to medical record format securely mapped from Backend entities
    let records = appointments.map((apt: any) => ({
      id: apt.appointmentId,
      // Differentiate completed as diagnosis vs pending tracking
      category: apt.status === 'Completed' ? 'diagnosis' : 'general',
      title: `${apt.appointmentType || 'Virtual'} Consultation`,
      date: new Date(apt.appointmentDate).toISOString().split('T')[0],
      doctor: apt.doctorName ? `Dr. ${apt.doctorName}` : 'Assigning Doctor',
      description: apt.status === 'Completed'
        ? `Post-consultation summary record for your appointment on ${apt.appointmentDate}.`
        : `Appointment scheduled at ${apt.appointmentTime}. Status is currently: ${apt.status}.`,
      status: apt.status
    }));

    if (category !== 'all') {
      records = records.filter((r: any) => r.category === category);
    }

    this.filteredRecords.set(records);
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'prescription': return 'bi-capsule';
      case 'lab': return 'bi-clipboard2-pulse';
      case 'diagnosis': return 'bi-stethoscope';
      default: return 'bi-file-medical';
    }
  }

  getCategoryClass(category: string): string {
    return `record-card ${category}`;
  }

  isUploading = signal(false);

  triggerFileInput(): void {
    const fileInput = document.getElementById('recordUpload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file && this.patientId) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size exceeds 5MB limit / የፋይል መጠን ከ5MB ገደብ ያልፋል');
        return;
      }

      this.isUploading.set(true);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];

        const payload = {
          fileName: file.name,
          mimeType: file.type || 'application/pdf',
          fileDataBase64: base64String
        };

        this.http.post(`${this.apiUrl}/Patient/${this.patientId}/medical-records`, payload).subscribe({
          next: () => {
            alert('Medical record uploaded securely! / የህክምና መዝገብዎ በደህና ተሰቅሏል!');
            this.isUploading.set(false);
            // Optionally reload or push to records list
            this.filteredRecords.update(records => [
              {
                id: Math.random().toString(),
                category: 'general',
                title: file.name,
                date: new Date().toISOString().split('T')[0],
                doctor: 'Uploaded By Patient',
                description: 'Patient uploaded physical medical record.',
                status: 'Completed'
              },
              ...records
            ]);
          },
          error: (err) => {
            console.error('File Upload Error:', err);
            alert('Error securely uploading file / ፋይል በመስቀል ላይ ስህተት ተፈጥሯል');
            this.isUploading.set(false);
          }
        });
      };

      reader.onerror = () => {
        alert('Error reading file / ፋይል በማንበብ ላይ ስህተት ተፈጥሯል');
        this.isUploading.set(false);
      };

      reader.readAsDataURL(file);
    }
  }
}