import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon, UserCircleIcon } from './icons';

interface UserSwitchModalProps {
  onClose: () => void;
}

const UserSwitchModal: React.FC<UserSwitchModalProps> = ({ onClose }) => {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();

  const handleSwitchUser = (userId: string) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: userId });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('user.switch.title')}</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {state.users.map(user => (
              <button
                key={user.id}
                onClick={() => handleSwitchUser(user.id)}
                disabled={user.id === state.currentUser.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-default disabled:hover:bg-transparent"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <UserCircleIcon className="w-10 h-10 text-slate-400" />
                )}
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{user.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{user.role}</p>
                </div>
                {user.id === state.currentUser.id && (
                  <span className="ml-auto text-xs font-bold text-indigo-600 dark:text-indigo-400">Current</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center justify-end p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('event.cancel')}</button>
        </div>
      </div>
    </div>
  );
};

export default UserSwitchModal;