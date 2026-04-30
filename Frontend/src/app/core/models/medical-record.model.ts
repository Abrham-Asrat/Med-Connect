export interface MedicalRecord {
  recordId: string;
  patientId: string;
  doctorId?: string;
  doctorName?: string;
  category: 'Prescription' | 'Lab Result' | 'Diagnosis' | 'Vaccination' | 'Imaging' | 'Doctor Note' | 'Other';
  title: string;
  description?: string;
  date: string;
  facility?: string;
  attachments?: MedicalDocument[];
  isVerified: boolean;
  verifiedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalDocument {
  documentId: string;
  recordId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  uploadedAt: string;
}

export interface AddMedicalRecordRequest {
  patientId: string;
  category: string;
  title: string;
  description?: string;
  date: string;
  facility?: string;
}

export interface ShareMedicalRecordRequest {
  recordId: string;
  shareWithUserId: string;
  accessLevel: 'View' | 'ViewAndDownload';
  expiryDays?: number;
}

export interface PatientSummary {
  patientId: string;
  name: string;
  age: number;
  bloodType?: string;
  allergies: string[];
  chronicConditions: string[];
  currentMedications: string[];
}