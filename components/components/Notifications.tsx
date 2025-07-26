
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { BellIcon } from './icons';
import { Notification as NotificationType, NotificationMessage } from '../types';

interface NotificationsProps {
    onNotificationClick: (eventId: string, notificationId: string) => void;
}

const formatNotificationMessage = (message: NotificationMessage, t: (key: string, params?: { [key: string]: string }) => string) => {
    switch (message.type) {
        case 'new_event':
            return t('notification.newEvent').replace('{authorName}', message.authorName).replace('{eventName}', message.eventName);
        case 'new_comment':
            return t('notification.newComment').replace('{commenterName}', message.commenterName).replace('{eventName}', message.eventName);
        case 'reminder':
            return t('notification.reminder').replace('{eventName}', message.eventName);
        default:
            return 'New notification';
    }
};

const Notifications: React.FC<NotificationsProps> = ({ onNotificationClick }) => {
    const { state, markAllNotificationsAsRead } = useAppContext();
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    if (!state.currentUser || !state.settings || !state.notifications) {
        return null;
    }

    const userNotifications = state.notifications
        .filter(n => n.userId === state.currentUser?.uid)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = userNotifications.filter(n => !n.isRead).length;

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllNotificationsAsRead();
    };

    const toggleDropdown = () => setIsOpen(prev => !prev);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!state.settings.enableNotifications) {
        return null;
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={toggleDropdown} className="relative p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800/70" />
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 animate-fadeIn">
                    <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">{t('notifications.title')}</h3>
                        {unreadCount > 0 && <button onClick={handleMarkAllRead} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">{t('notifications.markAllAsRead')}</button>}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {userNotifications.length > 0 ? (
                            userNotifications.map(notification => (
                                <button
                                    key={notification.id}
                                    onClick={() => {
                                        onNotificationClick(notification.eventId, notification.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left p-3 flex items-start gap-3 hover:bg-slate-100 dark:hover:bg-slate-700/60 ${!notification.isRead ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}
                                >
                                    <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-indigo-500 flex-shrink-0" style={{ visibility: notification.isRead ? 'hidden' : 'visible' }}></div>
                                    <p className="flex-1 text-sm text-slate-700 dark:text-slate-300">
                                        {formatNotificationMessage(notification.message, t as any)}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <p className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">{t('notifications.empty')}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Notifications;
