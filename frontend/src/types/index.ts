export interface User {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  bio?: string;
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Resume {
  id: number;
  filename: string;
  original_filename: string;
  file_type: string;
  file_size: number;
  parsed_data?: ParsedResumeData;
  created_at: string;
}

export interface ParsedResumeData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  education?: Record<string, unknown>[];
  experience?: Record<string, unknown>[];
  projects?: Record<string, unknown>[];
  certifications?: string[];
  languages?: string[];
  github?: string;
  linkedin?: string;
  summary?: string;
}

export interface JobDescription {
  id: number;
  title: string;
  raw_text: string;
  parsed_data?: Record<string, unknown>;
  created_at: string;
}

export interface ATSBreakdown {
  skills_match: number;
  experience: number;
  education: number;
  formatting: number;
  keywords: number;
  projects: number;
  certifications: number;
  grammar: number;
}

export interface Analysis {
  id: number;
  resume_id: number;
  job_description_id?: number;
  analysis_type: string;
  ats_score: number;
  match_percentage?: number;
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  missing_skills?: string[];
  missing_keywords?: string[];
  matching_skills?: string[];
  matching_keywords?: string[];
  skill_gap_analysis?: Record<string, unknown>;
  ats_breakdown?: ATSBreakdown;
  grammar_suggestions?: string[];
  formatting_suggestions?: string[];
  readability_feedback?: string[];
  career_suggestions?: string[];
  ai_suggestions?: string[];
  optimized_sections?: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  total_resumes: number;
  total_analyses: number;
  average_ats_score: number;
  best_ats_score: number;
  recent_analyses: Analysis[];
  ats_score_trend: { date: string; score: number; type: string }[];
  skill_distribution: { skill: string; count: number }[];
  improvement_history: { date: string; ats_score: number; analysis_id: number }[];
  match_history: { date: string; match_percentage: number; analysis_id: number }[];
  skill_radar: { category: string; score: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminUser {
  id: number;
  email: string;
  full_name: string;
  is_admin: boolean;
  is_active: boolean;
  resume_count: number;
  analysis_count: number;
  created_at: string;
}
