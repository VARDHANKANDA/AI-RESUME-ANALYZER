import axios from 'axios';
import type {
  AdminUser,
  Analysis,
  AuthResponse,
  DashboardStats,
  JobDescription,
  PaginatedResponse,
  Resume,
  User,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

console.log("API_BASE:", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data: { email: string; password: string; full_name: string }) =>
    api.post<AuthResponse>('/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/login', data),
  logout: () => api.post('/logout'),
  getProfile: () => api.get<User>('/profile'),
  updateProfile: (data: { full_name?: string; bio?: string }) =>
    api.put<User>('/profile', data),
};

export const resumeAPI = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<Resume>('/resume/upload-resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (params?: { page?: number; page_size?: number; search?: string; sort_by?: string; sort_order?: string }) =>
    api.get<PaginatedResponse<Resume>>('/resume/list', { params }),
  get: (id: number) => api.get<Resume>(`/resume/${id}`),
  delete: (id: number) => api.delete(`/resume/${id}`),
};

export const analysisAPI = {
  analyze: (resume_id: number) =>
    api.post<Analysis>('/analyze', { resume_id }),
  compare: (data: { resume_id: number; job_description_id?: number; job_text?: string; job_title?: string }) =>
    api.post<Analysis>('/compare', data),
  history: (params?: { page?: number; page_size?: number; analysis_type?: string }) =>
    api.get<PaginatedResponse<Analysis>>('/history', { params }),
  get: (id: number) => api.get<Analysis>(`/analysis/${id}`),
  downloadReport: (id: number) =>
    api.get(`/analysis/${id}/download`, { responseType: 'blob' }),
  createJob: (data: { title: string; raw_text: string }) =>
    api.post<JobDescription>('/job-description', data),
  uploadJob: (file: File, title: string) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<JobDescription>(`/job-description/upload?title=${encodeURIComponent(title)}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  coverLetter: (data: { resume_id: number; job_text?: string; job_description_id?: number; tone?: string }) =>
    api.post('/cover-letter', data),
  interviewQuestions: (data: { resume_id: number; job_text?: string; job_description_id?: number; count?: number }) =>
    api.post('/interview-questions', data),
  emailReport: (data: { analysis_id: number; recipient_email: string }) =>
    api.post('/email-report', data),
};

export const dashboardAPI = {
  getStats: () => api.get<DashboardStats>('/dashboard'),
};

export const adminAPI = {
  getUsers: () => api.get<AdminUser[]>('/admin/users'),
  deleteUser: (id: number) => api.delete(`/admin/user/${id}`),
  getAnalytics: () => api.get('/admin/analytics'),
  getResumes: () => api.get('/admin/resumes'),
  getAnalysisLogs: () => api.get('/admin/analysis-logs'),
};

export default api;
