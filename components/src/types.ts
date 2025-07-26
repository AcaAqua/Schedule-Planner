
// Firestore documents will have string IDs, which we add after fetching.
// Dates will be Firestore Timestamps, which we convert to JS Date objects.

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface RecurringPattern {
  frequency: 'weekly';
  days: number[]; // 0 for Sunday, 1 for Monday, etc.
}

export interface Event {
  id: string;
  title: string;
  description: string;
  start: Date;
  end: Date;
  categoryId: string;
  image?: string;
  authorId: string; // Firebase Auth UID
  status: 'published' | 'draft' | 'private';
  
  // For recurring events
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  recurringEventId?: string; // Links an instance to its template
  exceptionDates?: string[]; // YYYY-MM-DD format for cancelled instances
  originalStart?: Date; // For instances that are modified
}

export interface Permissions {
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageSettings: boolean;
}

export interface User {
  id: string; // Firestore document ID, same as uid
  uid: string; // Firebase Auth user ID
  name: string;
  avatar: string;
  role: 'admin' | 'member';
  permissions: Permissions;
  favorites?: string[]; // Array of event IDs
}

export interface Comment {
  id: string;
  eventId: string;
  authorId: string; // Firebase Auth UID
  content: string;
  createdAt: Date;
}

export type NotificationMessage = 
  | { type: 'new_event'; authorName: string; eventName: string }
  | { type: 'new_comment'; commenterName: string; eventName: string }
  | { type: 'reminder'; eventName: string };

export interface Notification {
  id: string;
  userId: string; // Firebase Auth UID of recipient
  message: NotificationMessage;
  eventId: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string; // Firebase Auth UID
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
