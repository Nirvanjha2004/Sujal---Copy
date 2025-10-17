export interface PropertyModerationData {
  id: number;
  title: string;
  description: string;
  price: number;
  location: string;
  propertyType: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedBy: {
    id: number;
    name: string;
    email: string;
  };
  submittedAt: string;
  moderatedAt?: string;
  moderatedBy?: {
    id: number;
    name: string;
  };
  rejectionReason?: string;
  images: string[];
}

export interface PropertyModerationFilters {
  status?: 'pending' | 'approved' | 'rejected';
  propertyType?: string;
  location?: string;
  submittedBy?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface PropertyModerationAction {
  propertyId: number;
  action: 'approve' | 'reject';
  reason?: string;
}

export interface ReviewModerationData {
  id: number;
  propertyId: number;
  propertyTitle: string;
  reviewText: string;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  moderatedAt?: string;
  moderatedBy?: {
    id: number;
    name: string;
  };
  rejectionReason?: string;
}

export interface ContentModerationData {
  id: number;
  type: 'banner' | 'seo' | 'content';
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  createdBy: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}