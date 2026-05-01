import { UserRole } from '../enums/user-role.enum';

export interface User {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  address?: string;
  role: UserRole;
  status: string;
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
    userId: string;
    accessToken: string;
    expiresIn: number;
    profile: {
      userId: string;
      firstName: string;
      lastName: string;
      role: string;
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
  gender: string;
  dateOfBirth: string;
  address: string;
  role: string;
  onlineAppointmentFee: number;
  inPersonAppointmentFee: number;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  specialties?: string[];
  qualifications?: string;
  biography?: string;
  doctorStatus?: number;
  cv?: {
    fileName: string;
    mimeType: string;
    fileDataBase64: string;
  };
}