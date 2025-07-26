
export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface RecurringPattern {
  frequency: 'weekly';
  days: number[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  categoryId: string;
  image?: string;
  authorId: string;
  status: 'published' | 'draft' | 'private';
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  recurringEventId?: string;
  exceptionDates?: string[];
  originalStart?: Date;
}

export interface Permissions {
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageSettings: boolean;
}

export interface User {
  id: string; // This will be the Firestore document ID
  uid: string; // This will be the Firebase Auth user ID
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  permissions: Permissions;
}

export interface Comment {
    id: string;
    eventId: string;
    authorId: string;
    content: string;
    createdAt: Date;
}

export type NotificationMessage = 
  | { type: 'new_event'; authorName: string; eventName: string }
  | { type: 'new_comment'; commenterName: string; eventName: string }
  | { type: 'reminder'; eventName: string };

export interface Notification {
  id: string;
  userId: string;
  message: NotificationMessage;
  eventId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  userAvatar: string;
  action: string;
  details: { [key: string]: any };
}

export type ViewMode = 'month' | 'week' | 'list';
export type AppView = 'calendar' | 'favorites' | 'settings' | 'guide' | 'profile' | 'activityLog';
export type Language = 'ja' | 'en';
export type Theme = 'light' | 'dark';

export interface Settings {
  theme: Theme;
  backgroundUrl: string;
  enableComments: boolean;
  enableNotifications: boolean;
  language: Language;
  appName: string;
  appIcon: string;
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
