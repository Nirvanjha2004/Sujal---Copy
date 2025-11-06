export interface UserModerationData {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  propertiesCount: number;
  inquiriesCount: number;
}

export interface UserFilters {
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface UserUpdateData {
  isVerified?: boolean;
  isActive?: boolean;
  role?: string;
}

export interface UserListResponse {
  users: UserModerationData[];
  total: number;
  totalPages: number;
  currentPage: number;
}