export interface Review {
  reviewId: string;
  doctorId: string;
  patientId: string;
  patientName?: string;
  doctorName?: string;
  rating: number;
  comment?: string;
  appointmentType?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Flagged';
  helpfulCount?: number;
  verifiedVisit?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  doctorId: string;
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
  success: boolean;
  data: {
    reviewId: string;
    rating: number;
    status: string;
  };
}

export interface RatingSummary {
  average: number;
  total: number;
  breakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}