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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  role: UserRole;
  emergencyContactPhone?: string;
  // Doctor-specific fields
  licenseNumber?: string;
  specialty?: string;
  experience?: number;
  qualifications?: string;
}