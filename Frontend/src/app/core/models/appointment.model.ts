import { AppointmentStatus } from '../enums/appointment-status.enum';

export interface Appointment {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  doctorName?: string;
  patientName?: string;
  doctorSpecialty?: string;
  appointmentDate: string;
  appointmentTime: string;
  appointmentType: 'Online' | 'InPerson';
  status: AppointmentStatus;
  notes?: string;
  meetingLink?: string;
  confirmationNumber?: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface BookAppointmentRequest {
  doctorId: string;
  appointmentDate: string;
  appointmentType: 'Online' | 'InPerson';
  notes?: string;
}

export interface AppointmentListResponse {
  success: boolean;
  data: Appointment[];
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}