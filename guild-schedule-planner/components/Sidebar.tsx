import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { AppView, Category } from '../types';
import { CalendarIcon, StarIcon, CogIcon, QuestionMarkCircleIcon, DocumentTextIcon } from './icons';

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const NavItem: React.FC<{
  view: AppView;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}> = ({ view, icon: Icon, label }) => {
  const { state, dispatch } = useAppContext();
  const isActive = state.currentView === view;

  return (
    <button
      onClick={() => dispatch({ type: 'SET_VIEW', payload: view })}
      className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      <Icon className="w-5 h-5 mr-3" />
      <span>{label}</span>
    </button>
  );
};

const CategoryItem: React.FC<{ category: Category }> = ({ category }) => {
  const { state, dispatch } = useAppContext();
  const { name, color, id } = category;
  const isActive = state.activeCategoryFilter === id;

  const handleFilter = () => {
    const newFilter = isActive ? null : id;
    dispatch({ type: 'SET_CATEGORY_FILTER', payload: newFilter });
  };

  return (
    <button
      onClick={handleFilter}
      className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        isActive 
          ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold'
          : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
      }`}
    >
      <span className="w-2.5 h-2.5 mr-3 rounded-full" style={{ backgroundColor: color }}></span>
      <span>{name}</span>
    </button>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ open, setOpen }) => {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const { currentUser, categories, activeCategoryFilter, isFavoritesFilterActive, settings } = state;
  const canManageAnything = currentUser.permissions.canManageSettings || currentUser.permissions.canManageCategories || currentUser.permissions.canManageUsers;

  return (
    <>
      <div className={`fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setOpen(false)}></div>
      <aside className={`absolute md:relative flex flex-col w-64 h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-40 transform md:transform-none transition-transform duration-300 ease-in-out ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex-shrink-0 p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
           {settings.appIcon && (
                <img src={settings.appIcon} alt="App Icon" className="w-8 h-8 rounded-md object-cover md:hidden" />
           )}
           <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 md:hidden">
            {settings.appName}
           </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {/* Main Navigation */}
          <NavItem view="calendar" icon={CalendarIcon} label={t('nav.calendar')} />
          <NavItem view="favorites" icon={StarIcon} label={t('nav.favorites')} />
          <NavItem view="guide" icon={QuestionMarkCircleIcon} label={t('nav.guide')} />
          {canManageAnything && (
            <NavItem view="settings" icon={CogIcon} label={t('nav.settings')} />
          )}
          {currentUser.permissions.canManageSettings && (
            <NavItem view="activityLog" icon={DocumentTextIcon} label={t('nav.activityLog')} />
          )}

          {/* Filters Section */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('filter.title')}</h3>
            <div className="mt-2 space-y-1">
               <button
                  onClick={() => dispatch({ type: 'TOGGLE_FAVORITES_FILTER' })}
                  className={`flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isFavoritesFilterActive
                      ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  <StarIcon className="w-5 h-5 mr-3" />
                  <span>{t('filter.favorites')}</span>
                </button>
            </div>
          </div>
          
          {/* Categories Section */}
          <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
            <h3 className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{t('filter.categories')}</h3>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => dispatch({ type: 'SET_CATEGORY_FILTER', payload: null })}
                className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeCategoryFilter === null
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                }`}
              >
                <span>{t('filter.allCategories')}</span>
              </button>
              {categories.map(cat => (
                <CategoryItem key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        </nav>
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">
            © 2025 LuckyFields.LLC
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;