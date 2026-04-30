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
  status: 'Pending' | 'Approved' | 'Rejected';
  profilePhoto?: string;
  languages: string[];
}