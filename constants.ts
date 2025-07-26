

import { Category, Event, User, RecurringPattern, Comment } from './types';

export const USERS: User[] = [
  { 
    id: 'user-1', 
    name: 'PlayerOne', 
    avatar: 'https://picsum.photos/seed/user1/100/100', 
    role: 'admin',
    permissions: {
        canManageUsers: true,
        canManageCategories: true,
        canManageSettings: true,
    }
  },
  { 
    id: 'user-2', 
    name: 'GuildMaster', 
    avatar: 'https://picsum.photos/seed/user2/100/100', 
    role: 'member',
    permissions: {
        canManageUsers: false,
        canManageCategories: false,
        canManageSettings: false,
    }
  },
];

export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'GVG', color: '#ef4444', icon: 'swords' },
  { id: 'cat-2', name: 'KVM', color: '#a855f7', icon: 'swords' },
  { id: 'cat-3', name: 'Event', color: '#3b82f6', icon: 'calendar' },
  { id: 'cat-4', name: 'Update', color: '#22c55e', icon: 'update' },
  { id: 'cat-5', name: 'Maintenance', color: '#eab308', icon: 'maint' },
];

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);


export const INITIAL_EVENTS: Event[] = [
  {
    id: 'event-1',
    title: 'Castle Siege Practice',
    description: 'Practice run for the upcoming siege. All members are required to attend.',
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 20, 0, 0),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 21, 0, 0),
    categoryId: 'cat-1',
    authorId: 'user-1',
    status: 'published',
  },
  {
    id: 'event-2',
    title: 'World Boss Hunt',
    description: 'Let\'s take down the world boss together!',
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 19, 30, 0),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 20, 30, 0),
    categoryId: 'cat-3',
    authorId: 'user-2',
    status: 'published',
    image: 'https://picsum.photos/seed/event2/400/200',
  },
  {
    id: 'event-3',
    title: 'Scheduled Maintenance',
    description: 'Servers will be down for scheduled maintenance.',
    start: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 4, 0, 0),
    end: new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 6, 0, 0),
    categoryId: 'cat-5',
    authorId: 'user-1',
    status: 'published',
  },
];

export const INITIAL_COMMENTS: Comment[] = [
    {
        id: 'comment-1',
        eventId: 'event-1',
        authorId: 'user-2',
        content: 'I will be there! Looking forward to it.',
        createdAt: new Date(new Date().getTime() - 10 * 60 * 1000), // 10 minutes ago
    },
    {
        id: 'comment-2',
        eventId: 'event-1',
        authorId: 'user-1',
        content: 'Great! Make sure to bring your best gear.',
        createdAt: new Date(new Date().getTime() - 5 * 60 * 1000), // 5 minutes ago
    },
];

export const RECURRING_EVENT_TEMPLATES: Omit<Event, 'id' | 'start' | 'end'>[] = [
    {
        title: 'Weekly Guild vs Guild (GVG)',
        description: 'Main weekly GVG event. Full participation expected.',
        categoryId: 'cat-1',
        authorId: 'user-1',
        status: 'published',
        isRecurring: true,
        recurringPattern: { frequency: 'weekly', days: [2, 4, 6] } // Tue, Thu, Sat
    },
    {
        title: 'Weekly Guild Quest Rally',
        description: 'Gather for weekly guild quests.',
        categoryId: 'cat-3',
        authorId: 'user-1',
        status: 'published',
        isRecurring: true,
        recurringPattern: { frequency: 'weekly', days: [0] } // Sunday
    }
];