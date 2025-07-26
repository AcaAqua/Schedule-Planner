

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, Category, User } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PencilIcon, TrashIcon, PlusIcon, UsersIcon, UserCircleIcon, ChevronDownIcon, CameraIcon, SparklesIcon } from './icons';
import { getIconComponentByName } from './icons';
import CategoryModal from './CategoryModal';
import ImageCropModal from './ImageCropModal';

interface SettingsViewProps {
  onAddUser: () => void;
  onEditUser: (user: User) => void;
}

const SettingsSection: React.FC<{
  title: string;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ title, children, isOpen, onToggle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md transition-all duration-300">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-6 text-left"
      aria-expanded={isOpen}
    >
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h2>
      <ChevronDownIcon className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    {isOpen && (
      <div className="px-6 pb-6 animate-fadeIn">
        {children}
      </div>
    )}
  </div>
);


const SettingsView: React.FC<SettingsViewProps> = ({ onAddUser, onEditUser }) => {
  const { state, updateSettings, deleteUser, deleteCategory } = useAppContext();
  const { t } = useTranslation();
  
  const [localSettings, setLocalSettings] = useState<Settings | null>(state.settings);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);

  const [openSections, setOpenSections] = useState<string[]>(['general']);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  if (!state.currentUser || !state.settings || !state.users || !state.categories) {
      return <div>Loading settings...</div>;
  }
  
  const { currentUser, users, categories } = state;

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };
  
  // Update local state when global state changes
  useEffect(() => {
    setLocalSettings(state.settings);
  }, [state.settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setLocalSettings(prev => prev ? ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }) : null);
  };

  const handleSaveSettings = () => {
    if(localSettings) {
        updateSettings(localSettings);
    }
  };

  const handleAddNewCategory = () => {
    setCategoryToEdit(undefined);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryToEdit(category);
    setIsCategoryModalOpen(true);
  };
  
  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(t('settings.category.delete.confirm'))) {
      deleteCategory(category);
    }
  };
  
  const handleDeleteUser = (user: User) => {
    if(window.confirm(t('settings.user.delete.confirm'))) {
      deleteUser(user);
    }
  };

  const handleIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.addEventListener('load', () => {
              setImageToCrop(reader.result as string);
          });
          reader.readAsDataURL(file);
          e.target.value = '';
      }
  };
    
  const handleIconCropSave = (croppedImageUrl: string) => {
      setLocalSettings(prev => prev ? ({...prev, appIcon: croppedImageUrl}) : null);
      setImageToCrop(null);
  }


  const canManageAnything = currentUser.permissions.canManageSettings || currentUser.permissions.canManageCategories || currentUser.permissions.canManageUsers;

  return (
    <>
      {isCategoryModalOpen && (
        <CategoryModal
          categoryToEdit={categoryToEdit}
          onClose={() => setIsCategoryModalOpen(false)}
        />
      )}
      {imageToCrop && (
        <ImageCropModal
            imageSrc={imageToCrop}
            onClose={() => setImageToCrop(null)}
            onSave={handleIconCropSave}
            aspect={1}
            circularCrop={false}
        />
      )}
      <div className="p-6 md:p-8 animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('settings.title')}</h1>
        
        {!canManageAnything && (
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
             <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">No Permissions</h3>
             <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You do not have permission to view these settings.</p>
          </div>
        )}

        {localSettings && <div className="max-w-2xl mx-auto space-y-4">
          
          {currentUser.permissions.canManageSettings && (
            <SettingsSection title={t('settings.generalSettings')} isOpen={openSections.includes('general')} onToggle={() => toggleSection('general')}>
                <div className="space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pb-2">{t('settings.calendarSettings')}</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="appName" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.appName')}</label>
                                <input
                                type="text"
                                name="appName"
                                id="appName"
                                value={localSettings.appName}
                                onChange={handleChange}
                                placeholder={t('settings.appName.placeholder')}
                                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                />
                                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('settings.appName.description')}</p>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.appIcon')}</label>
                                <div className="mt-2 flex items-center gap-4">
                                    <div className="relative group flex-shrink-0">
                                        {localSettings.appIcon ? (
                                            <img src={localSettings.appIcon} alt="App Icon" className="w-16 h-16 rounded-lg object-cover bg-slate-200 dark:bg-slate-700" />
                                        ) : (
                                            <div className="w-16 h-16 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                                                <SparklesIcon className="w-8 h-8 text-slate-400 dark:text-slate-500"/>
                                            </div>
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => iconInputRef.current?.click()}
                                          className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                          aria-label={t('settings.appIcon.upload')}
                                        >
                                          <CameraIcon className="w-6 h-6 text-white" />
                                        </button>
                                        <input type="file" ref={iconInputRef} onChange={handleIconFileChange} accept="image/*" className="hidden" />
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('settings.appIcon.description')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pb-2">{t('settings.appearance')}</h3>
                        <div>
                            <label htmlFor="backgroundUrl" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.backgroundUrl')}</label>
                            <input
                            type="text"
                            name="backgroundUrl"
                            id="backgroundUrl"
                            value={localSettings.backgroundUrl}
                            onChange={handleChange}
                            placeholder={t('settings.backgroundUrl.placeholder')}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{t('settings.backgroundUrl.description')}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 pb-2">{t('settings.features')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('settings.enableComments')}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.enableComments.description')}</span>
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="enableComments" checked={localSettings.enableComments} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                            </div>
                            <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('settings.enableNotifications')}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.enableNotifications.description')}</span>
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="enableNotifications" checked={localSettings.enableNotifications} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-end mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={handleSaveSettings} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">{t('settings.save')}</button>
                </div>
            </SettingsSection>
          )}
          
          {currentUser.permissions.canManageUsers && (
              <SettingsSection title={t('settings.userManagement')} isOpen={openSections.includes('users')} onToggle={() => toggleSection('users')}>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.userManagement.description')}</p>
                <div className="mt-4 space-y-2">
                    {users.map(user => (
                      <div key={user.uid} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                          <div className="flex items-center gap-3">
                              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" /> : <UserCircleIcon className="w-8 h-8 text-slate-400" />}
                              <div>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{user.name}</span>
                                <span className={`ml-2 text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${user.role === 'admin' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-200'}`}>{user.role}</span>
                              </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <button onClick={() => onEditUser(user)} className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600">
                                  <PencilIcon className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteUser(user)} disabled={user.uid === currentUser.uid} className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                    ))}
                </div>
              </SettingsSection>
            )}
            
            {currentUser.permissions.canManageCategories && (
              <SettingsSection title={t('settings.categoryManagement')} isOpen={openSections.includes('categories')} onToggle={() => toggleSection('categories')}>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.categoryManagement.description')}</p>
                <div className="mt-4 space-y-2">
                    {categories.map(cat => {
                        const IconComponent = getIconComponentByName(cat.icon);
                        return (
                            <div key={cat.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                                        <IconComponent className="w-4 h-4 text-white" />
                                    </span>
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditCategory(cat)} className="p-1.5 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600">
                                        <PencilIcon className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => handleDeleteCategory(cat)} className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button type="button" onClick={handleAddNewCategory} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <PlusIcon className="w-4 h-4" />
                        {t('settings.category.add')}
                    </button>
                </div>
              </SettingsSection>
            )}
        </div>}
      </div>
    </>
  );
};

export default SettingsView;