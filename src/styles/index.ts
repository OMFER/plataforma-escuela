export interface User {
  fullName: string;
  shortName: string;
  role: string;
  avatar: string;
}

export interface Course {
  id: number;
  title: string;
  room: string;
  isPrimary: boolean;
  evaluation?: string;
  grade?: number;
  progress?: number;
}

export type WeekStatus = 'completed' | 'active' | 'future';

export interface Week {
  id: number;
  num: string;
  date: string;
  status: WeekStatus;
}