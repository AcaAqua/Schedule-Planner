
import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { getIconComponentByName, UserCircleIcon } from './icons';
import { ActivityLog } from '../types';

const formatLogMessage = (
  log: ActivityLog,
  t: (key: string) => string,
) => {
  const { action, details, userName } = log;
  
  switch (action) {
    case 'CREATE_EVENT':
      return <>{userName} {t('log.createdEvent')} <span className="font-semibold">"{details.eventName}"</span></>;
    case 'UPDATE_EVENT':
      return <>{userName} {t('log.updatedEvent')} <span className="font-semibold">"{details.eventName}"</span></>;
    case 'DELETE_EVENT':
      return <>{userName} {t('log.deletedEvent')} <span className="font-semibold">"{details.eventName}"</span></>;
    case 'CREATE_USER':
      return <>{userName} {t('log.createdUser')} <span className="font-semibold">"{details.userName}"</span></>;
    case 'UPDATE_USER':
      return <>{userName} {t('log.updatedUser')} <span className="font-semibold">"{details.userName}"</span></>;
    case 'DELETE_USER':
      return <>{userName} {t('log.deletedUser')} <span className="font-semibold">"{details.userName}"</span></>;
    case 'CREATE_CATEGORY':
      return <>{userName} {t('log.createdCategory')} <span className="font-semibold">"{details.categoryName}"</span></>;
    case 'UPDATE_CATEGORY':
      return <>{userName} {t('log.updatedCategory')} <span className="font-semibold">"{details.categoryName}"</span></>;
    case 'DELETE_CATEGORY':
      return <>{userName} {t('log.deletedCategory')} <span className="font-semibold">"{details.categoryName}"</span></>;
    case 'UPDATE_SETTINGS':
      return <>{userName} {t('log.updatedSettings')}</>;
    default:
        return <>Unknown action: {action}</>;
  }
};

const ActivityLogView: React.FC = () => {
    const { state } = useAppContext();
    const { t } = useTranslation();
    const { activityLog } = state;

    const getActionIcon = (action: string) => {
        if (action.includes('EVENT')) return getIconComponentByName('calendar');
        if (action.includes('USER')) return getIconComponentByName('users');
        if (action.includes('CATEGORY')) return getIconComponentByName('tag');
        if (action.includes('SETTINGS')) return getIconComponentByName('cog');
        return getIconComponentByName('tag');
    };

    if (!activityLog) {
        return <div>Loading logs...</div>;
    }

    const sortedLog = [...activityLog].sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime());

    return (
        <div className="p-6 md:p-8 animate-fadeIn">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('nav.activityLog')}</h1>
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 max-w-4xl mx-auto">
                <ul className="space-y-4">
                    {sortedLog.length > 0 ? (
                        sortedLog.map(log => {
                            const Icon = getActionIcon(log.action);
                            return (
                                <li key={log.id} className="flex items-start gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0 last:pb-0">
                                    {log.userAvatar ? 
                                        <img src={log.userAvatar} alt={log.userName} className="w-8 h-8 rounded-full object-cover"/> 
                                        : <UserCircleIcon className="w-8 h-8 text-slate-400"/>
                                    }
                                    <div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200">
                                            {formatLogMessage(log, t)}
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
