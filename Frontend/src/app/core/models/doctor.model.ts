export interface Doctor {
  doctorId: string;
  firstName: string;
  lastName: string;
  email: string;
  specialties: string[];
  qualifications: string;
  experience: number;
  rating: number;
  reviewCount: number;
  onlineFee: number;
  inPersonFee: number;
  onlineAppointmentFee?: number;
  inPersonAppointmentFee?: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  profilePhoto?: string;
  languages: string[];

  // Appointment type availability
  acceptsOnline: boolean;
  acceptsInPerson: boolean;

  // Clinic info (for in-person appointments)
  clinicName?: string;
  clinicAddress?: string;
  clinicCity?: string;
}