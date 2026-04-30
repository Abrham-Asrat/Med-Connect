export interface UserSettings {
  userId: string;
  profile: ProfileSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  accessibility: AccessibilitySettings;
}

export interface ProfileSettings {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: string;
  dateOfBirth: string;
  address?: string;
  profilePhoto?: string;
  emergencyContact?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  activeSessions: ActiveSession[];
}

export interface ActiveSession {
  sessionId: string;
  deviceName: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationSettings {
  appointmentReminders: boolean;
  messageAlerts: boolean;
  paymentReceipts: boolean;
  reviewRequests: boolean;
  marketingEmails: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface AccessibilitySettings {
  highContrast: boolean;
  reduceAnimations: boolean;
  largeText: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  screenReaderOptimized: boolean;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}