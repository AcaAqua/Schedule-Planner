
import { Category } from './types';

// This is now the only constant needed, as other data is dynamic from Firebase.
// This can serve as the default categories for a new setup if needed.
export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  { name: 'GVG', color: '#ef4444', icon: 'swords' },
  { name: 'KVM', color: '#a855f7', icon: 'swords' },
  { name: 'Event', color: '#3b82f6', icon: 'calendar' },
  { name: 'Update', color: '#22c55e', icon: 'update' },
  { name: 'Maintenance', color: '#eab308', icon: 'maint' },
];
