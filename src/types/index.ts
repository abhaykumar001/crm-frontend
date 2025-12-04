// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'manager' | 'agent';
  isActive: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

// Lead Types
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  source: LeadSource;
  statusId: number;
  status: LeadStatus;
  assignedToId?: number;
  assignedTo?: User;
  budget?: number;
  requirements?: string;
  notes?: string;
  nextFollowUp?: string;
  score?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSource {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface LeadStatus {
  id: number;
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  order: number;
}

// Project Types
export interface Project {
  id: number;
  name: string;
  description?: string;
  developerId: number;
  developer: Developer;
  location: string;
  totalUnits?: number;
  priceRange?: string;
  status: 'planning' | 'under_construction' | 'ready_to_move' | 'completed';
  isActive: boolean;
  amenities?: ProjectAmenity[];
  media?: ProjectMedia[];
  createdAt: string;
  updatedAt: string;
}

export interface Developer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  description?: string;
  isActive: boolean;
}

export interface ProjectAmenity {
  id: number;
  projectId: number;
  name: string;
  description?: string;
}

export interface ProjectMedia {
  id: number;
  projectId: number;
  type: 'image' | 'video' | 'document' | 'floor_plan';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
}

// Deal Types
export interface Deal {
  id: number;
  leadId: number;
  lead: Lead;
  projectId: number;
  project: Project;
  agentId: number;
  agent: User;
  dealValue: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
  notes?: string;
  closingDate?: string;
  paymentSchedule?: PaymentSchedule[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentSchedule {
  id: number;
  dealId: number;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  paidAmount?: number;
  paidDate?: string;
  notes?: string;
}

// Communication Types
export interface CallLog {
  id: number;
  leadId: number;
  lead: Lead;
  agentId: number;
  agent: User;
  phoneNumber: string;
  callType: 'incoming' | 'outgoing' | 'missed';
  duration?: number;
  status: 'completed' | 'missed' | 'busy' | 'no_answer';
  notes?: string;
  recordingUrl?: string;
  callStartTime: string;
  callEndTime?: string;
  createdAt: string;
}

export interface SMSLog {
  id: number;
  leadId: number;
  lead: Lead;
  agentId: number;
  agent: User;
  phoneNumber: string;
  message: string;
  direction: 'sent' | 'received';
  status: 'sent' | 'delivered' | 'failed' | 'pending';
  messageId?: string;
  cost?: number;
  createdAt: string;
}

export interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables?: string[];
  category: 'welcome' | 'follow_up' | 'promotion' | 'notification' | 'other';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics Types
export interface DashboardStats {
  totalLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealValue: number;
  pendingFollowUps: number;
  leadsThisMonth: number;
  dealsThisMonth: number;
  revenueThisMonth: number;
}

export interface LeadAnalytics {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  conversionRate: number;
  leadsBySource: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  leadsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  leadsByAgent: Array<{
    agent: string;
    count: number;
    converted: number;
    conversionRate: number;
  }>;
}

export interface AgentPerformance {
  agentId: number;
  agentName: string;
  totalLeads: number;
  convertedLeads: number;
  totalDeals: number;
  totalRevenue: number;
  conversionRate: number;
  averageDealValue: number;
  totalCalls: number;
  totalEmails: number;
  totalSMS: number;
  performanceScore: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface LeadForm {
  name: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  source: string;
  statusId: number;
  assignedToId?: number;
  budget?: number;
  requirements?: string;
  notes?: string;
  nextFollowUp?: string;
}

export interface ProjectForm {
  name: string;
  description?: string;
  developerId: number;
  location: string;
  totalUnits?: number;
  priceRange?: string;
  status: 'planning' | 'under_construction' | 'ready_to_move' | 'completed';
  amenities?: string[];
}

export interface DealForm {
  leadId: number;
  projectId: number;
  dealValue: number;
  commissionRate: number;
  notes?: string;
  closingDate?: string;
}

// Filter Types
export interface LeadFilters {
  search?: string;
  statusId?: number;
  source?: string;
  assignedToId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ProjectFilters {
  search?: string;
  developerId?: number;
  status?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface DealFilters {
  search?: string;
  status?: string;
  agentId?: number;
  projectId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Chart Types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

// Notification Types
export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}