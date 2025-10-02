// User roles enum
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  CSO = 'CSO'
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
  postalCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
  assignedTo?: User;
  createdBy?: User;
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

// Inquiry enums
export enum InquiryStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  REJECTED = 'rejected',
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
  description: string;
  priority: InquiryPriority;
  status: InquiryStatus;
  category: InquiryCategory;
  customerId: string;
  customer?: Customer;
  assignedTo?: User;
  createdAt: string;
  updatedAt: string;
  responses?: Response[];
}

// Forward declaration to avoid circular dependency
export interface InquiryReference {
  id: string;
  subject: string;
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
  message: string;
  internalNotes?: string;
  status: ResponseStatus;
  inquiryId: string;
  inquiry?: InquiryReference;
  createdBy: User;
  approvedBy?: User;
  rejectedBy?: User;
  approvalNotes?: string;
  rejectionReason?: string;
  subject?: string;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
    mimeType: string;
  }>;
  emailSent?: boolean;
  emailSentAt?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
}

// Create DTOs
export interface CreateResponseDto {
  message: string;
  internalNotes?: string;
  inquiryId: string;
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