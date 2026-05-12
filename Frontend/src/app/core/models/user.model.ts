import { UserRole } from '../enums/user-role.enum';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  address?: string;
  role: UserRole;
  status: 'Active' | 'Pending' | 'Suspended';
  profilePhoto?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresIn: number;
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
      role: UserRole;
      phone: string;
      gender: string;
      dateOfBirth: string;
    };
  };
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  address: string;
  role: UserRole;
  emergencyContactPhone?: string;
  onlineAppointmentFee: number;
  inPersonAppointmentFee: number;
  // Doctor-specific fields
  licenseNumber?: string;
  specialty?: string;
  specialties?: string[];
  experience?: number;
  qualifications?: string;
  biography?: string;
  cv?: {
    fileName: string;
    mimeType: string;
    fileDataBase64: string;
  };
}