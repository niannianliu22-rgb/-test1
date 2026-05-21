export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type NavView = 'today' | 'upcoming' | 'all';

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: TaskStatus;
  date: string;   // YYYY-MM-DD
  time?: string;  // HH:MM
  tag: string;
}
