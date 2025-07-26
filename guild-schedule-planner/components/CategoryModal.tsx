import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Category } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon, ICON_MAP, getIconComponentByName } from './icons';

interface CategoryModalProps {
  categoryToEdit?: Category;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ categoryToEdit, onClose }) => {
  const { dispatch } = useAppContext();
  const { t } = useTranslation();

  const getInitialState = () => {
    if (categoryToEdit) {
      return { ...categoryToEdit };
    }
    return {
      id: '',
      name: '',
      color: '#3b82f6', // default blue
      icon: 'tag',
    };
  };

  const [formState, setFormState] = useState<Omit<Category, 'id'> & { id?: string }>(getInitialState());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  
  const handleIconChange = (iconName: string) => {
    setFormState(prev => ({...prev, icon: iconName }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    if (formState.id) { // Editing existing category
      dispatch({ type: 'UPDATE_CATEGORY', payload: formState as Category });
    } else { // Adding new category
      const newCategory: Category = {
        ...formState,
        id: `cat-${new Date().getTime()}`,
      };
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {categoryToEdit ? t('category.modal.edit.title') : t('category.modal.add.title')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('category.name')}</label>
              <input
                type="text"
                name="name"
                id="name"
                value={formState.name}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="color" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('category.color')}</label>
              <div className="mt-1 flex items-center gap-2">
                 <input
                    type="color"
                    name="color"
                    id="color"
                    value={formState.color}
                    onChange={handleChange}
                    className="p-1 h-10 w-14 block bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                 />
                 <input
                    type="text"
                    value={formState.color}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                 />
              </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('category.icon')}</label>
                <div className="mt-2 grid grid-cols-6 sm:grid-cols-8 gap-2">
                    {Object.keys(ICON_MAP).map(iconName => {
                        const IconComponent = getIconComponentByName(iconName);
                        const isActive = formState.icon === iconName;
                        return (
                            <button
                                key={iconName}
                                type="button"
                                onClick={() => handleIconChange(iconName)}
                                className={`w-full aspect-square rounded-md flex items-center justify-center transition-colors ${isActive ? 'bg-indigo-600 text-white ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-indigo-500' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
                            >
                                <IconComponent className="w-5 h-5" />
                            </button>
                        )
                    })}
                </div>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center justify-end p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('event.cancel')}</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                {t('event.save')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryModal;
