import { NotificationType } from '../enums/notification-type.enum';

export interface Notification {
  notificationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    totalPages: number;
    totalItems: number;
  };
}

export interface NotificationPreference {
  category: string;
  enabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
}

export interface UpdateNotificationPreferencesRequest {
  preferences: NotificationPreference[];
}