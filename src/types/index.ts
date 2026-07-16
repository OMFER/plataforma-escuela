export type ExamStatus = 'pending' | 'active' | 'completed' | 'locked';

export interface Exam {
  id: string;
  section: string;
  title: string;
  dueDate: string | null;
  status: ExamStatus;
  isOptional?: boolean;
  stats?: {
    enrolled: number;
    durationMin: number;
  };
  score?: number;
}

export interface CourseDetails {
  id: string;
  title: string;
  description: string;
  examsCompleted: number;
  totalExams: number;
}

export type SessionStatus = 'upcoming' | 'finished';

export interface OpenClassSession {
  id: string;
  weekLabel: string;
  instructor: string;
  title: string;
  date: string;
  time: string;
  status: SessionStatus;
}