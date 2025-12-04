import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { ApiResponse } from '@/types';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common responses
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  // GET request
  get: async <T = any>(url: string, params?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get(url, { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // POST request
  post: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PUT request
  put: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // PATCH request
  patch: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.patch(url, data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // DELETE request
  delete: async <T = any>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete(url);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Upload file
  upload: async <T = any>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};

// Error handler
function handleApiError(error: any): ApiResponse {
  if (error.response?.data) {
    return error.response.data;
  }
  
  return {
    success: false,
    message: error.message || 'An unexpected error occurred',
    error: error.message,
  };
}

// Specific API endpoints
export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    apiClient.post('/auth/login', credentials),
  
  register: (userData: { name: string; email: string; password: string; role?: string }) =>
    apiClient.post('/auth/register', userData),
  
  refreshToken: () =>
    apiClient.post('/auth/refresh'),
  
  logout: () =>
    apiClient.post('/auth/logout'),
  
  getProfile: () =>
    apiClient.get('/auth/profile'),
  
  updateProfile: (data: any) =>
    apiClient.patch('/auth/profile', data),
};

export const leadsApi = {
  getLeads: (params?: any) =>
    apiClient.get('/leads', params),
  
  getLead: (id: number) =>
    apiClient.get(`/leads/${id}`),
  
  createLead: (data: any) =>
    apiClient.post('/leads', data),
  
  updateLead: (id: number, data: any) =>
    apiClient.put(`/leads/${id}`, data),
  
  deleteLead: (id: number) =>
    apiClient.delete(`/leads/${id}`),
  
  assignLead: (id: number, agentId: number) =>
    apiClient.patch(`/leads/${id}/assign`, { agentId }),
  
  updateStatus: (id: number, statusId: number) =>
    apiClient.patch(`/leads/${id}/status`, { statusId }),
  
  addNote: (id: number, note: string) =>
    apiClient.post(`/leads/${id}/notes`, { note }),
  
  getLeadSources: () =>
    apiClient.get('/leads/sources'),
  
  getLeadStatuses: () =>
    apiClient.get('/leads/statuses'),
};

export const projectsApi = {
  getProjects: (params?: any) =>
    apiClient.get('/projects', params),
  
  getProject: (id: number) =>
    apiClient.get(`/projects/${id}`),
  
  createProject: (data: any) =>
    apiClient.post('/projects', data),
  
  updateProject: (id: number, data: any) =>
    apiClient.put(`/projects/${id}`, data),
  
  deleteProject: (id: number) =>
    apiClient.delete(`/projects/${id}`),
  
  uploadMedia: (id: number, formData: FormData) =>
    apiClient.upload(`/projects/${id}/media`, formData),
  
  deleteMedia: (id: number, mediaId: number) =>
    apiClient.delete(`/projects/${id}/media/${mediaId}`),
  
  getDevelopers: () =>
    apiClient.get('/projects/developers'),
};

export const dealsApi = {
  getDeals: (params?: any) =>
    apiClient.get('/deals', params),
  
  getDeal: (id: number) =>
    apiClient.get(`/deals/${id}`),
  
  createDeal: (data: any) =>
    apiClient.post('/deals', data),
  
  updateDeal: (id: number, data: any) =>
    apiClient.put(`/deals/${id}`, data),
  
  deleteDeal: (id: number) =>
    apiClient.delete(`/deals/${id}`),
  
  approveDeal: (id: number, notes?: string) =>
    apiClient.patch(`/deals/${id}/approve`, { notes }),
  
  rejectDeal: (id: number, reason: string) =>
    apiClient.patch(`/deals/${id}/reject`, { reason }),
  
  addPayment: (id: number, paymentData: any) =>
    apiClient.post(`/deals/${id}/payments`, paymentData),
  
  updatePayment: (id: number, paymentId: number, data: any) =>
    apiClient.put(`/deals/${id}/payments/${paymentId}`, data),
};

export const communicationApi = {
  // Call Logs
  getCallLogs: (params?: any) =>
    apiClient.get('/communication/calls', params),
  
  createCallLog: (data: any) =>
    apiClient.post('/communication/calls', data),
  
  updateCallLog: (id: number, data: any) =>
    apiClient.put(`/communication/calls/${id}`, data),
  
  // SMS
  getSMSLogs: (params?: any) =>
    apiClient.get('/communication/sms', params),
  
  sendSMS: (data: { leadId: number; phoneNumber: string; message: string }) =>
    apiClient.post('/communication/sms', data),
  
  // WhatsApp
  getWhatsAppLogs: (params?: any) =>
    apiClient.get('/communication/whatsapp', params),
  
  sendWhatsApp: (data: { leadId: number; phoneNumber: string; message: string }) =>
    apiClient.post('/communication/whatsapp', data),
  
  // Email
  getEmailTemplates: () =>
    apiClient.get('/communication/email/templates'),
  
  createEmailTemplate: (data: any) =>
    apiClient.post('/communication/email/templates', data),
  
  updateEmailTemplate: (id: number, data: any) =>
    apiClient.put(`/communication/email/templates/${id}`, data),
  
  sendEmail: (data: any) =>
    apiClient.post('/communication/email/send', data),
  
  // Notifications
  getNotifications: (params?: any) =>
    apiClient.get('/communication/notifications', params),
  
  markNotificationRead: (id: number) =>
    apiClient.patch(`/communication/notifications/${id}/read`),
  
  markAllNotificationsRead: () =>
    apiClient.patch('/communication/notifications/read-all'),
};

export const analyticsApi = {
  getDashboardStats: (params?: any) =>
    apiClient.get('/analytics/dashboard/stats', params),
  
  getLeadAnalytics: (params?: any) =>
    apiClient.get('/analytics/leads', params),
  
  getSalesAnalytics: (params?: any) =>
    apiClient.get('/analytics/sales', params),
  
  getAgentPerformance: (params?: any) =>
    apiClient.get('/analytics/agents/performance', params),
  
  getRevenueAnalytics: (params?: any) =>
    apiClient.get('/analytics/revenue', params),
  
  getProjectPerformance: (params?: any) =>
    apiClient.get('/analytics/projects/performance', params),
  
  getCommunicationAnalytics: (params?: any) =>
    apiClient.get('/analytics/communication', params),
  
  getConversionFunnel: (params?: any) =>
    apiClient.get('/analytics/leads/conversion-funnel', params),
  
  getLeadScoring: () =>
    apiClient.get('/analytics/leads/scoring'),
  
  getPredictiveAnalytics: () =>
    apiClient.get('/analytics/predictive'),
  
  generateCustomReport: (data: any) =>
    apiClient.post('/analytics/reports/custom', data),
  
  exportReport: (params?: any) =>
    apiClient.get('/analytics/reports/export', params),
};

export const usersApi = {
  getUsers: (params?: any) =>
    apiClient.get('/users', params),
  
  getUser: (id: number) =>
    apiClient.get(`/users/${id}`),
  
  createUser: (data: any) =>
    apiClient.post('/users', data),
  
  updateUser: (id: number, data: any) =>
    apiClient.put(`/users/${id}`, data),
  
  deleteUser: (id: number) =>
    apiClient.delete(`/users/${id}`),
  
  updateUserRole: (id: number, role: string) =>
    apiClient.patch(`/users/${id}/role`, { role }),
  
  updateUserStatus: (id: number, isActive: boolean) =>
    apiClient.patch(`/users/${id}/status`, { isActive }),
};

export const automationApi = {
  getHealth: () =>
    apiClient.get('/automation/health'),
  
  getJobs: () =>
    apiClient.get('/automation/jobs'),
  
  triggerJob: (jobName: string) =>
    apiClient.post(`/automation/jobs/${jobName}/trigger`),
  
  enableJob: (jobName: string) =>
    apiClient.post(`/automation/jobs/${jobName}/enable`),
  
  disableJob: (jobName: string) =>
    apiClient.post(`/automation/jobs/${jobName}/disable`),
  
  getActivityLogs: (params?: { limit?: number; eventType?: string }) =>
    apiClient.get('/automation/activity-logs', params),
  
  getStats: (params?: { startDate?: string; endDate?: string }) =>
    apiClient.get('/automation/stats', params),
  
  getSettings: () =>
    apiClient.get('/automation/settings'),
  
  updateSetting: (key: string, data: { value: any; type: string }) =>
    apiClient.put(`/automation/settings/${key}`, data),
};

export const campaignApi = {
  // Campaign CRUD
  getAllCampaigns: (params?: { 
    status?: number; 
    isInternational?: boolean; 
    startDate?: string; 
    endDate?: string;
    search?: string;
  }) =>
    apiClient.get('/campaigns', params),
  
  getCampaignById: (id: number) =>
    apiClient.get(`/campaigns/${id}`),
  
  createCampaign: (data: {
    name: string;
    secondaryName?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    isInternational?: boolean;
    status?: number;
  }) =>
    apiClient.post('/campaigns', data),
  
  updateCampaign: (id: number, data: Partial<{
    name: string;
    secondaryName?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    budget?: number;
    isInternational?: boolean;
    status?: number;
  }>) =>
    apiClient.put(`/campaigns/${id}`, data),
  
  deleteCampaign: (id: number) =>
    apiClient.delete(`/campaigns/${id}`),
  
  // Campaign Performance
  getCampaignPerformance: (id: number, params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get(`/campaigns/${id}/performance`, params),
  
  getAllCampaignsPerformance: (params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get('/campaigns/performance/all', params),
  
  getCampaignStatistics: () =>
    apiClient.get('/campaigns/statistics'),
  
  // Campaign Managers
  getCampaignManagers: (id: number) =>
    apiClient.get(`/campaigns/${id}/managers`),
  
  addCampaignManager: (id: number, userId: number) =>
    apiClient.post(`/campaigns/${id}/managers`, { userId }),
  
  removeCampaignManager: (id: number, userId: number) =>
    apiClient.delete(`/campaigns/${id}/managers/${userId}`),
  
  // International Campaigns
  getInternationalCampaigns: () =>
    apiClient.get('/campaigns/international'),
};

export const sourceApi = {
  // Source CRUD
  getAllSources: (params?: {
    campaignId?: number;
    type?: string;
    isActive?: boolean;
    search?: string;
  }) =>
    apiClient.get('/sources', params),
  
  getSourceById: (id: number) =>
    apiClient.get(`/sources/${id}`),
  
  createSource: (data: {
    name: string;
    type?: string;
    campaignId?: number;
    isActive?: boolean;
    runAllTime?: boolean;
    isCroned?: boolean;
    rotationType?: string;
    priority?: number;
  }) =>
    apiClient.post('/sources', data),
  
  updateSource: (id: number, data: Partial<{
    name: string;
    type?: string;
    campaignId?: number;
    isActive?: boolean;
    runAllTime?: boolean;
    isCroned?: boolean;
    rotationType?: string;
    priority?: number;
  }>) =>
    apiClient.put(`/sources/${id}`, data),
  
  deleteSource: (id: number) =>
    apiClient.delete(`/sources/${id}`),
  
  // Agent Pool Management
  getSourceAgents: (id: number) =>
    apiClient.get(`/sources/${id}/agents`),
  
  addAgentToSource: (id: number, userId: number) =>
    apiClient.post(`/sources/${id}/agents`, { userId }),
  
  removeAgentFromSource: (id: number, userId: number) =>
    apiClient.delete(`/sources/${id}/agents/${userId}`),
  
  updateAgentPool: (id: number, userIds: number[]) =>
    apiClient.put(`/sources/${id}/agents`, { userIds }),
  
  getNextAgentForAssignment: (id: number) =>
    apiClient.get(`/sources/${id}/next-agent`),
  
  // Sub-Sources
  getSubSources: (id: number) =>
    apiClient.get(`/sources/${id}/sub-sources`),
  
  createSubSource: (id: number, data: { name: string; isActive?: boolean }) =>
    apiClient.post(`/sources/${id}/sub-sources`, data),
  
  updateSubSource: (id: number, subSourceId: number, data: { name?: string; isActive?: boolean }) =>
    apiClient.put(`/sources/${id}/sub-sources/${subSourceId}`, data),
  
  deleteSubSource: (id: number, subSourceId: number) =>
    apiClient.delete(`/sources/${id}/sub-sources/${subSourceId}`),
  
  // Source Performance
  getSourcePerformance: (id: number, params?: {
    startDate?: string;
    endDate?: string;
  }) =>
    apiClient.get(`/sources/${id}/performance`, params),
  
  getSourceStatistics: () =>
    apiClient.get('/sources/statistics'),
};

export default api;