// Settings-related types extracted from AccountSettingsPage

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'buyer' | 'owner' | 'agent' | 'builder' | 'admin';
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  propertyAlerts: boolean;
  priceDropAlerts: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private';
  showContactInfo: boolean;
  allowDirectMessages: boolean;
  showActivityStatus: boolean;
}

export interface AccountSettings {
  profile: ProfileData;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
}

export interface DashboardSettings {
  layout: 'grid' | 'list' | 'compact';
  theme: 'light' | 'dark' | 'system';
  autoRefresh: boolean;
  refreshInterval: number;
  showWelcomeMessage: boolean;
  defaultView: string;
}

export interface UserSettings {
  profile: ProfileData;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  dashboard: DashboardSettings;
}

export interface DisplaySettings {
  fontSize: 'small' | 'medium' | 'large';
  density: 'compact' | 'comfortable' | 'spacious';
  animations: boolean;
  highContrast: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  loginAlerts: boolean;
  deviceTracking: boolean;
}