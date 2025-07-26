export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code, e.g., '#ef4444'
  icon: string; // Icon name identifier
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
  authorId: string;
  status: 'published' | 'draft' | 'private';
  // Recurring event properties
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  recurringEventId?: string; // The ID of the parent recurring event template
  exceptionDates?: string[]; // ISO date strings (YYYY-MM-DD) of cancelled instances
  originalStart?: Date; // The original start date of an instance before modification
}

export interface Permissions {
  canManageUsers: boolean;
  canManageCategories: boolean;
  canManageSettings: boolean;
}

export interface User {
  id:string;
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
  userId: string; // The user who should see this notification
  message: NotificationMessage;
  eventId: string; // To link to the event
  isRead: boolean;
  createdAt: Date;
}

export interface ActivityLog {
  id: string;
  timestamp: Date;
  userId: string;
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

export type AppState = {
  users: User[];
  currentUser: User;
  categories: Category[];
  events: Event[];
  comments: Comment[];
  notifications: Notification[];
  settings: Settings;
  currentView: AppView;
  favorites: string[]; // event ids
  activeCategoryFilter: string | null;
  isFavoritesFilterActive: boolean;
  activityLog: ActivityLog[];
  toasts: Toast[];
};

export type Action =
  | { type: 'ADD_EVENT'; payload: Event }
  | { type: 'UPDATE_EVENT'; payload: Event }
  | { type: 'DELETE_EVENT'; payload: { eventId: string; eventName: string } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_VIEW'; payload: AppView }
  | { type: 'TOGGLE_FAVORITE'; payload: string }
  | { type: 'UPDATE_CURRENT_USER'; payload: Partial<User> }
  | { type: 'SET_CURRENT_USER'; payload: string } // User ID
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: { userId: string; userName: string } }
  | { type: 'SET_CATEGORY_FILTER'; payload: string | null }
  | { type: 'TOGGLE_FAVORITES_FILTER' }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: { categoryId: string; categoryName: string } }
  | { type: 'UPDATE_RECURRING'; payload: { event: Event; mode: 'single' | 'all' } }
  | { type: 'DELETE_RECURRING'; payload: { event: Event; mode: 'single' | 'all' } }
  | { type: 'ADD_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string } // notification id
  | { type: 'MARK_ALL_NOTIFICATIONS_READ' }
  | { type: 'REPLACE_STATE'; payload: AppState }
  | { type: 'IMPORT_DESIGN_SETTINGS'; payload: { settings: Settings; categories: Category[] } }
  | { type: 'CLEAR_ACTIVITY_LOG' }
  | { type: 'RESET_APP_STATE' }
  | { type: 'ADD_TOAST'; payload: Omit<Toast, 'id'> }
  | { type: 'REMOVE_TOAST'; payload: string };