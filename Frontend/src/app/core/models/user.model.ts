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
    token: string;
    expiresIn: number;
    user: {
      email: string;
      firstName: string;
      role: UserRole;
    };
  };
}

// ✅ Updated to match RegisterUserDto from swagger
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
  medicalHistory?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  // Doctor-specific
  specialties?: string[];
  qualifications?: string;
  biography?: string;
  onlineAppointmentFee?: number;
  inPersonAppointmentFee?: number;
  licenseNumber?: string;
  experience?: number;
}