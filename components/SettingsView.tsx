



import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, Category, User, AppState } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { PencilIcon, TrashIcon, PlusIcon, UsersIcon, UserCircleIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ChevronDownIcon, ExclamationTriangleIcon, CameraIcon, SparklesIcon } from './icons';
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
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>(state.settings);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<Category | undefined>(undefined);
  const { currentUser } = state;

  const [openSections, setOpenSections] = useState<string[]>(['general']);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const fullImportRef = useRef<HTMLInputElement>(null);
  const designImportRef = useRef<HTMLInputElement>(null);

  const toggleSection = (section: string) => {
    setOpenSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
    dispatch({ type: 'ADD_TOAST', payload: { message: t('settings.saved.success'), type: 'success' } });
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
      dispatch({ type: 'DELETE_CATEGORY', payload: { categoryId: category.id, categoryName: category.name } });
    }
  };
  
  const handleDeleteUser = (user: User) => {
    if(window.confirm(t('settings.user.delete.confirm'))) {
      dispatch({ type: 'DELETE_USER', payload: { userId: user.id, userName: user.name } });
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
        setSettings(prev => ({...prev, appIcon: croppedImageUrl}));
        setImageToCrop(null);
    }

  const handleExport = (isFullExport: boolean) => {
    const dataToExport = isFullExport ? state : { settings: state.settings, categories: state.categories };
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = isFullExport ? 'guild-planner-backup.json' : 'guild-planner-design-pack.json';
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>, isFullImport: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target?.result as string);
            const confirmMessage = isFullImport ? t('settings.data.import.confirm') : t('settings.data.designPack.import.confirm');
            
            if (window.confirm(confirmMessage)) {
                if (isFullImport) {
                    dispatch({ type: 'REPLACE_STATE', payload: importedData as AppState });
                } else {
                    dispatch({ type: 'IMPORT_DESIGN_SETTINGS', payload: { settings: importedData.settings, categories: importedData.categories } });
                }
                dispatch({ type: 'ADD_TOAST', payload: { message: 'Import successful!', type: 'success' } });
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            dispatch({ type: 'ADD_TOAST', payload: { message: 'Error importing file.', type: 'error' } });
            console.error("Import error:", error);
        } finally {
            if(e.target) e.target.value = '';
        }
    };
    reader.readAsText(file);
  };

  const handleClearLog = () => {
    if (window.confirm(t('settings.initialization.clearLog.confirm'))) {
      dispatch({ type: 'CLEAR_ACTIVITY_LOG' });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Activity log cleared.', type: 'success' } });
    }
  };

  const handleResetApp = () => {
    const confirmation = prompt(t('settings.initialization.resetApp.confirm'));
    if (confirmation === 'RESET') {
      dispatch({ type: 'RESET_APP_STATE' });
      dispatch({ type: 'ADD_TOAST', payload: { message: 'Application has been reset.', type: 'info' } });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

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

        <div className="max-w-2xl mx-auto space-y-4">
          
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
                                value={settings.appName}
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
                                        {settings.appIcon ? (
                                            <img src={settings.appIcon} alt="App Icon" className="w-16 h-16 rounded-lg object-cover bg-slate-200 dark:bg-slate-700" />
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
                            value={settings.backgroundUrl}
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
                                <input type="checkbox" name="enableComments" checked={settings.enableComments} onChange={handleChange} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                            </label>
                            </div>
                            <div className="flex items-center justify-between">
                            <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-slate-900 dark:text-slate-200">{t('settings.enableNotifications')}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.enableNotifications.description')}</span>
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" name="enableNotifications" checked={settings.enableNotifications} onChange={handleChange} className="sr-only peer" />
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
                    {state.users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700/50">
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
                              <button onClick={() => handleDeleteUser(user)} disabled={user.id === state.currentUser.id} className="p-1.5 rounded-md text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:text-slate-300 dark:disabled:text-slate-600 disabled:hover:bg-transparent disabled:cursor-not-allowed">
                                  <TrashIcon className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                    ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    <button type="button" onClick={onAddUser} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                        <UsersIcon className="w-4 h-4" />
                        {t('settings.user.add')}
                    </button>
                </div>
              </SettingsSection>
            )}
            
            {currentUser.permissions.canManageCategories && (
              <SettingsSection title={t('settings.categoryManagement')} isOpen={openSections.includes('categories')} onToggle={() => toggleSection('categories')}>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.categoryManagement.description')}</p>
                <div className="mt-4 space-y-2">
                    {state.categories.map(cat => {
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

            {currentUser.permissions.canManageSettings && (
              <SettingsSection title={t('settings.dataManagement')} isOpen={openSections.includes('data')} onToggle={() => toggleSection('data')}>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t('settings.dataManagement.description')}</p>
                
                <div className="mt-4 space-y-4 divide-y divide-slate-200 dark:divide-slate-700">
                    {/* Full Backup */}
                    <div className="pt-4 first:pt-0">
                       <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.data.fullBackup')}</h3>
                       <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.data.fullBackup.description')}</p>
                       <div className="mt-3 flex gap-2">
                           <button onClick={() => handleExport(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">
                               <ArrowDownTrayIcon className="w-4 h-4" />
                               {t('settings.data.exportAll')}
                            </button>
                            <button onClick={() => fullImportRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">
                               <ArrowUpTrayIcon className="w-4 h-4" />
                               {t('settings.data.importAll')}
                            </button>
                            <input type="file" ref={fullImportRef} onChange={(e) => handleImport(e, true)} className="hidden" accept=".json"/>
                       </div>
                    </div>
                    {/* Design Pack */}
                    <div className="pt-4 first:pt-0">
                       <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.data.designPack')}</h3>
                       <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.data.designPack.description')}</p>
                       <div className="mt-3 flex gap-2">
                           <button onClick={() => handleExport(false)} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">
                               <ArrowDownTrayIcon className="w-4 h-4" />
                               {t('settings.data.designPack.export')}
                            </button>
                            <button onClick={() => designImportRef.current?.click()} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">
                               <ArrowUpTrayIcon className="w-4 h-4" />
                               {t('settings.data.designPack.import')}
                            </button>
                            <input type="file" ref={designImportRef} onChange={(e) => handleImport(e, false)} className="hidden" accept=".json"/>
                       </div>
                    </div>
                </div>
              </SettingsSection>
            )}

            {currentUser.permissions.canManageSettings && (
                <div className="mt-4 border-2 border-red-500/30 dark:border-red-500/50 rounded-lg">
                    <SettingsSection title={t('settings.initialization')} isOpen={openSections.includes('init')} onToggle={() => toggleSection('init')}>
                        <div className="flex items-start gap-3 text-sm text-red-800 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                            <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <p>{t('settings.initialization.description')}</p>
                        </div>

                        <div className="mt-4 space-y-4 divide-y divide-slate-200 dark:divide-slate-700">
                            {/* Clear log */}
                            <div className="pt-4 first:pt-0">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.initialization.clearLog')}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.initialization.clearLog.description')}</p>
                            <div className="mt-3">
                                <button onClick={handleClearLog} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800/60 rounded-md shadow-sm hover:bg-red-200 dark:hover:bg-red-900/70">
                                <TrashIcon className="w-4 h-4" />
                                {t('settings.initialization.clearLog.button')}
                                </button>
                            </div>
                            </div>

                            {/* Reset App */}
                            <div className="pt-4 first:pt-0">
                            <h3 className="font-semibold text-slate-700 dark:text-slate-300">{t('settings.initialization.resetApp')}</h3>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t('settings.initialization.resetApp.description')}</p>
                            <div className="mt-3">
                                <button onClick={handleResetApp} className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800/60 rounded-md shadow-sm hover:bg-red-200 dark:hover:bg-red-900/70">
                                <ExclamationTriangleIcon className="w-4 h-4" />
                                {t('settings.initialization.resetApp.button')}
                                </button>
                            </div>
                            </div>
                        </div>
                    </SettingsSection>
                </div>
            )}
        </div>
      </div>
    </>
  );
};

export default SettingsView;