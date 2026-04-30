export interface PendingDoctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  qualifications: string;
  specialties: string[];
  licenseNumber: string;
  experience: number;
  cvFile: string;
  certificates: string[];
  registeredAt: string;
  status: 'Pending';
}

export interface ApproveDoctorRequest {
  doctorId: string;
  approvalNotes?: string;
}

export interface RejectDoctorRequest {
  doctorId: string;
  rejectionReason: string;
  rejectionNotes?: string;
}

export interface PlatformStats {
  totalDoctors: number;
  totalPatients: number;
  totalAppointments: number;
  pendingApprovals: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeDoctors: number;
  newPatientsThisMonth: number;
}

export interface RevenueData {
  month: string;
  amount: number;
  appointments: number;
}

export interface RevenueBySpecialty {
  specialty: string;
  amount: number;
  percentage: number;
}

export interface Transaction {
  transactionId: string;
  doctorName: string;
  patientName: string;
  amount: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Refunded';
  paymentMethod: string;
}