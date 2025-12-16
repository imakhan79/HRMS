export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TALENT_SCOUT = 'TALENT_SCOUT',
  ORG_CHART = 'ORG_CHART',
  ANALYTICS = 'ANALYTICS',
  SETTINGS = 'SETTINGS',
  EMPLOYEES = 'EMPLOYEES'
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  experience: number;
  skills: string[];
  location: string;
  avatar: string;
  status: 'New' | 'Screening' | 'Interview' | 'Offer';
  matchScore: number;
  bio: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  avatar: string;
  reportsTo?: string; // Manager ID
  performance: number; // 0-100
  flightRisk: 'Low' | 'Medium' | 'High';
}

export interface ChartData {
  name: string;
  value: number;
  value2?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}