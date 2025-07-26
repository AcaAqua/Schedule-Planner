import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getIconComponentByName } from './icons';
import { User, ActivityLog, Category } from '../types';

// A helper to format the log message
const formatLogMessage = (
  log: ActivityLog,
  t: (key: string) => string,
  currentUser: User
) => {
  const { action, details } = log;
  
  const userName = currentUser.name;

  switch (action) {
    case 'CREATE_EVENT':
      return `${userName} ${t('log.createdEvent')} "${details.eventName}"`;
    case 'UPDATE_EVENT':
      return `${userName} ${t('log.updatedEvent')} "${details.eventName}"`;
    case 'DELETE_EVENT':
      return `${userName} ${t('log.deletedEvent')} "${details.eventName}"`;
    case 'CREATE_USER':
      return `${userName} ${t('log.createdUser')} "${details.userName}"`;
    case 'UPDATE_USER':
      return `${userName} ${t('log.updatedUser')} "${details.userName}"`;
    case 'DELETE_USER':
      return `${userName} ${t('log.deletedUser')} "${details.userName}"`;
    case 'CREATE_CATEGORY':
      return `${userName} ${t('log.createdCategory')} "${details.categoryName}"`;
    case 'UPDATE_CATEGORY':
      return `${userName} ${t('log.updatedCategory')} "${details.categoryName}"`;
    case 'DELETE_CATEGORY':
        return `${userName} ${t('log.deletedCategory')} "${details.categoryName}"`;
    case 'UPDATE_SETTINGS':
      return `${userName} ${t('log.updatedSettings')}`;
    default:
        return `Unknown action: ${action}`;
  }
};

const ActivityLogView: React.FC = () => {
    const { state } = useAppContext();
    const { t } = useTranslation();
    const { activityLog, users } = state;

    const getActionIcon = (action: string) => {
        if (action.includes('EVENT')) return getIconComponentByName('calendar');
        if (action.includes('USER')) return getIconComponentByName('users');
        if (action.includes('CATEGORY')) return getIconComponentByName('tag');
        if (action.includes('SETTINGS')) return getIconComponentByName('cog');
        return getIconComponentByName('tag');
    };

    return (
        <div className="p-6 md:p-8 animate-fadeIn">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('nav.activityLog')}</h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                <ul className="space-y-4">
                    {activityLog.length > 0 ? (
                        [...activityLog].reverse().map(log => {
                            const Icon = getActionIcon(log.action);
                            const user = users.find(u => u.id === log.userId);
                            return (
                                <li key={log.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                                    <span className="mt-1 w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 flex-shrink-0">
                                        <Icon className="w-5 h-5" />
                                    </span>
                                    <div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200">
                                            {formatLogMessage(log, t, user || state.currentUser)}
                                        </p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </p>
                                    </div>
                                </li>
                            );
                        })
                    ) : (
                        <p className="text-center text-slate-500 dark:text-slate-400 py-8">{t('log.empty')}</p>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default ActivityLogView;