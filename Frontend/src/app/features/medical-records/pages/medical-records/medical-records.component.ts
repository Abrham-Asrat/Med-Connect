import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid p-4">
      <h4 class="text-primary mb-4"><i class="bi bi-file-medical me-2"></i>Medical Records</h4>

      <!-- Patient Summary -->
      <div class="card bg-primary text-white mb-4">
        <div class="card-body d-flex align-items-center gap-4">
          <div class="rounded-circle bg-white text-primary d-flex align-items-center justify-content-center"
               style="width:64px;height:64px;font-size:24px;font-weight:700">JD</div>
          <div>
            <h5 class="mb-1">John Doe</h5>
            <span class="me-3">Blood Type: <strong>A+</strong></span>
            <span class="me-3">Age: <strong>34</strong></span>
            <span>Allergies: <span class="badge bg-warning text-dark">Penicillin</span></span>
          </div>
        </div>
      </div>

      <!-- Category Tabs -->
      <div class="d-flex gap-2 mb-4 flex-wrap">
        @for (cat of categories(); track cat) {
          <button class="btn btn-sm rounded-pill"
                  [class.btn-primary]="activeCategory() === cat"
                  [class.btn-outline-primary]="activeCategory() !== cat"
                  (click)="activeCategory.set(cat)">{{ cat }}</button>
        }
      </div>

      <!-- Records List -->
      <div class="row g-3">
        @for (record of filteredRecords(); track record.id) {
          <div class="col-md-6">
            <div class="card h-100" style="border-left:4px solid #078930">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <span class="badge" [class.bg-primary-light]="record.category==='Prescription'"
                          [class.text-primary]="record.category==='Prescription'"
                          [class.bg-warning-light]="record.category==='Diagnosis'"
                          [class.text-warning-dark]="record.category==='Diagnosis'"
                          [class.bg-secondary-light]="record.category==='Lab Result'"
                          [class.text-secondary]="record.category==='Lab Result'">
                      {{ record.category }}
                    </span>
                    <h6 class="mt-2 mb-1">{{ record.title }}</h6>
                  </div>
                  <small class="text-medium">{{ record.date }}</small>
                </div>
                <p class="text-medium mb-2" style="font-size:14px">{{ record.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-primary"><i class="bi bi-person me-1"></i>{{ record.doctor }}</small>
                  <button class="btn btn-outline-primary btn-sm"><i class="bi bi-download me-1"></i>View</button>
                </div>
              </div>
            </div>
          </div>
        }
        @if (filteredRecords().length === 0) {
          <div class="col-12 text-center py-5">
            <i class="bi bi-file-medical text-primary" style="font-size:48px;opacity:0.3"></i>
            <p class="text-medium mt-2">No records in this category</p>
          </div>
        }
      </div>
    </div>
  `
})
export class MedicalRecordsComponent {
  categories = signal(['All', 'Prescription', 'Lab Result', 'Diagnosis', 'Vaccination']);
  activeCategory = signal('All');

  records = signal([
    { id:'1', category:'Prescription', title:'Amoxicillin 500mg', date:'May 15, 2026', doctor:'Dr. Sarah Johnson', description:'Take twice daily for 7 days with food. Complete full course.' },
    { id:'2', category:'Lab Result', title:'Complete Blood Count (CBC)', date:'May 10, 2026', doctor:'Dr. Sarah Johnson', description:'All values within normal range. Slight elevation in WBC.' },
    { id:'3', category:'Diagnosis', title:'Hypertension - Stage 1', date:'Apr 28, 2026', doctor:'Dr. Abebe Kebede', description:'Blood pressure 135/85. Recommended lifestyle changes and monitoring.' },
    { id:'4', category:'Prescription', title:'Lisinopril 10mg', date:'Apr 28, 2026', doctor:'Dr. Abebe Kebede', description:'Take once daily in the morning. Monitor blood pressure weekly.' },
    { id:'5', category:'Vaccination', title:'COVID-19 Booster', date:'Mar 15, 2026', doctor:'Dr. Yonas Tadesse', description:'Pfizer-BioNTech booster dose administered. No adverse reactions.' },
    { id:'6', category:'Lab Result', title:'Lipid Panel', date:'Mar 10, 2026', doctor:'Dr. Sarah Johnson', description:'Total cholesterol: 190, LDL: 110, HDL: 55, Triglycerides: 120.' },
  ]);

  filteredRecords() {
    if (this.activeCategory() === 'All') return this.records();
    return this.records().filter(r => r.category === this.activeCategory());
  }
}