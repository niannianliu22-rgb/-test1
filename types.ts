export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Group {
  id: string;
  creator: User;
  members: User[];
  maxMembers: number;
  expiresAt: number; // Timestamp
  status: 'OPEN' | 'FULL' | 'EXPIRED';
}

export interface Course {
  id: string;
  title: string;
  originalPrice: number;
  groupPrice: number;
  description: string;
  features: string[];
}

export enum AppView {
  HOME = 'HOME',
  GROUP_DETAIL = 'GROUP_DETAIL',
  PAYMENT = 'PAYMENT',
  SUCCESS = 'SUCCESS'
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}