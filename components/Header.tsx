import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { SunIcon, MoonIcon, ArrowPathRoundedSquareIcon, PlusIcon, Bars3Icon, ChevronDownIcon } from './icons';
import { Theme, Language } from '../types';
import Notifications from './Notifications';

interface HeaderProps {
    onAddNewEvent: () => void;
    onToggleSidebar: () => void;
    onSwitchUser: () => void;
    onNotificationClick: (eventId: string, notificationId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ onAddNewEvent, onToggleSidebar, onSwitchUser, onNotificationClick }) => {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { currentUser, settings } = state;

  const handleThemeChange = (theme: Theme) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { theme } });
  };

  const handleLanguageChange = (language: Language) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: { language } });
    setDropdownOpen(false);
  };
  
  const handleAction = (action: () => void) => {
    action();
    setDropdownOpen(false);
  }

  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between flex-shrink-0 z-20">
      <div className="flex items-center gap-4">
        <button onClick={onToggleSidebar} className="p-2 rounded-md md:hidden text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
          <Bars3Icon className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-3">
            {settings.appIcon && (
                <img src={settings.appIcon} alt="App Icon" className="w-8 h-8 rounded-md object-cover hidden sm:block" />
            )}
            <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 hidden sm:block">
                {settings.appName}
            </h1>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onAddNewEvent}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">{t('header.newEvent')}</span>
        </button>
        
        <Notifications onNotificationClick={onNotificationClick} />

        <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-full p-1">
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-1.5 rounded-full ${settings.theme === 'light' ? 'bg-white text-indigo-600' : 'text-slate-500'}`}
          >
            <SunIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-1.5 rounded-full ${settings.theme === 'dark' ? 'bg-slate-900 text-indigo-400' : 'text-slate-500'}`}
          >
            <MoonIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full border-2 border-slate-300 dark:border-slate-600 object-cover" />
            <span className="hidden lg:inline font-medium">{currentUser.name}</span>
             <ChevronDownIcon className={`w-4 h-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 py-1 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{currentUser.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{currentUser.role}</p>
              </div>
              <button
                onClick={() => handleAction(() => dispatch({ type: 'SET_VIEW', payload: 'profile' }))}
                className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {t('nav.profile')}
              </button>
               <button
                onClick={() => handleAction(onSwitchUser)}
                className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                {t('header.switchUser')}
              </button>
              <div className="border-t border-slate-200 dark:border-slate-700 my-1"></div>
              <button onClick={() => handleLanguageChange('en')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">English</button>
              <button onClick={() => handleLanguageChange('ja')} className="w-full text-left block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">日本語</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;