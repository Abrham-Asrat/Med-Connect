import { PaymentStatus } from '../enums/payment-status.enum';

export interface Payment {
  paymentId: string;
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: PaymentStatus;
  transactionRef?: string;
  chapaRef?: string;
  paymentUrl?: string;
  expiresAt?: string;
  paidAt?: string;
  createdAt: string;
}

export interface InitiatePaymentRequest {
  appointmentId: string;
  amount: number;
  currency: string;
  paymentMethod: string;
}

export interface InitiatePaymentResponse {
  success: boolean;
  data: {
    paymentId: string;
    status: PaymentStatus;
    amount: number;
    paymentUrl: string;
    expiresAt: string;
  };
}

export interface PaymentVerificationResponse {
  success: boolean;
  data: {
    paymentId: string;
    status: PaymentStatus;
    transactionRef: string;
  };
}