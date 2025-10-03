// User roles enum
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CSO = 'cso'
}

// User interface
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
}

// Customer interface
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  status: CustomerStatus;
  segment: CustomerSegment;
  totalSpent: number;
  orderCount: number;
  lastOrderDate?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

// Customer creation/update DTOs
export interface CreateCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {}

// Customer list response interface
export interface CustomerListResponse {
  data: Customer[];
  total: number;
  page: number;
  limit: number;
}

// Customer enums
export enum CustomerStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum CustomerSegment {
  PREMIUM = 'premium',
  STANDARD = 'standard',
  BASIC = 'basic',
  VIP = 'vip',
}

// Inquiry enums
export enum InquiryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export enum InquiryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum InquiryCategory {
  GENERAL = 'general',
  TECHNICAL = 'technical',
  BILLING = 'billing',
  COMPLAINT = 'complaint',
  FEATURE_REQUEST = 'feature_request',
  SUPPORT = 'support',
}

// Response enums
export enum ResponseStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SENT = 'sent',
}

// Inquiry interface
export interface Inquiry {
  id: string;
  subject: string;
  message: string;
  priority: InquiryPriority;
  status: InquiryStatus;
  category: InquiryCategory;
  customerId: string;
  customer?: Customer;
  assignedTo?: string;
  assignee?: User;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  tags?: string[];
  metadata?: Record<string, any>;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
  responses?: Response[];
}

// Forward declaration to avoid circular dependency
export interface InquiryReference {
  id: string;
  subject: string;
  category?: InquiryCategory;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

// Response interface
export interface Response {
  id: string;
  responseText: string;
  status: ResponseStatus;
  inquiryId: string;
  inquiry?: InquiryReference;
  responder: User;
  responderId: string;
  approvalNotes?: string;
  rejectionReason?: string;
  metadata?: Record<string, any>;
  sentAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Create DTOs
export interface CreateResponseDto {
  responseText: string;
  inquiryId: string;
  status?: ResponseStatus;
}

export interface UpdateResponseDto {
  responseText?: string;
  status?: ResponseStatus;
}

export interface UpdateInquiryDto {
  status?: InquiryStatus;
  assignedTo?: string;
  priority?: InquiryPriority;
  category?: string;
}

export interface ApproveResponseDto {
  notes?: string;
}

// API Response interfaces
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  total?: number;
  page?: number;
  limit?: number;
}

// Auth context interface
export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Pagination interface
export interface PaginationParams {
  page: number;
  limit: number;
}