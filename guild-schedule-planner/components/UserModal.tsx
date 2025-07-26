import React, { useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Permissions } from '../types';
import { useTranslation } from '../hooks/useTranslation';
import { XMarkIcon, CameraIcon, UserCircleIcon } from './icons';
import ImageCropModal from './ImageCropModal';

interface UserModalProps {
  userToEdit?: User;
  onClose: () => void;
}

const defaultPermissions: Permissions = {
  canManageUsers: false,
  canManageCategories: false,
  canManageSettings: false,
};

const UserModal: React.FC<UserModalProps> = ({ userToEdit, onClose }) => {
  const { dispatch } = useAppContext();
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const getInitialState = (): User => {
    if (userToEdit) {
      return { ...userToEdit };
    }
    return {
      id: '',
      name: '',
      avatar: '',
      role: 'member' as const,
      permissions: { ...defaultPermissions },
    };
  };

  const [formState, setFormState] = useState<User>(getInitialState());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value as any }));
  };

  const handlePermissionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, checked } = e.target;
      setFormState(prev => ({
          ...prev,
          permissions: {
              ...prev.permissions,
              [name]: checked,
          }
      }));
  };
  
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      const isAdmin = value === 'admin';
      setFormState(prev => ({
          ...prev,
          role: value as 'admin' | 'member',
          permissions: {
              canManageUsers: isAdmin,
              canManageCategories: isAdmin,
              canManageSettings: isAdmin,
          }
      }));
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleCropSave = (croppedImageUrl: string) => {
    setFormState(prev => ({ ...prev, avatar: croppedImageUrl }));
    setImageSrc(null); // Close modal
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name) return;

    if (formState.id) { // Editing existing user
      dispatch({ type: 'UPDATE_USER', payload: formState });
    } else { // Adding new user
      const newUser: User = {
        ...formState,
        id: `user-${new Date().getTime()}`,
        avatar: formState.avatar || `https://picsum.photos/seed/user${new Date().getTime()}/100/100`
      };
      dispatch({ type: 'ADD_USER', payload: newUser });
    }
    onClose();
  };

  const AvatarComponent = formState.avatar ? (
    <img src={formState.avatar} alt={formState.name} className="w-20 h-20 rounded-full object-cover bg-slate-200 dark:bg-slate-700" />
  ) : (
    <UserCircleIcon className="w-20 h-20 text-slate-400 dark:text-slate-500" />
  );

  return (
    <>
    {imageSrc && (
        <ImageCropModal
          imageSrc={imageSrc}
          onClose={() => setImageSrc(null)}
          onSave={handleCropSave}
          aspect={1}
          circularCrop={true}
        />
      )}
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {userToEdit ? t('user.modal.edit.title') : t('user.modal.add.title')}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative group flex-shrink-0">
                    {AvatarComponent}
                    <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={t('user.uploadAvatar')}
                    >
                    <CameraIcon className="w-8 h-8 text-white" />
                    </button>
                </div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />
                <div className="flex-1">
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('user.name')}</label>
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
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('user.role')}</label>
              <select
                name="role"
                id="role"
                value={formState.role}
                onChange={handleRoleChange}
                className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="member">{t('user.role.member')}</option>
                <option value="admin">{t('user.role.admin')}</option>
              </select>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('user.permissions')}</label>
                <div className="mt-2 space-y-2">
                    <label className="flex items-center">
                        <input type="checkbox" name="canManageUsers" checked={formState.permissions.canManageUsers} onChange={handlePermissionChange} disabled={formState.role === 'admin'} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                        <span className="ml-3 block text-sm text-slate-700 dark:text-slate-300">{t('user.permissions.manageUsers')}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="canManageCategories" checked={formState.permissions.canManageCategories} onChange={handlePermissionChange} disabled={formState.role === 'admin'} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                        <span className="ml-3 block text-sm text-slate-700 dark:text-slate-300">{t('user.permissions.manageCategories')}</span>
                    </label>
                    <label className="flex items-center">
                        <input type="checkbox" name="canManageSettings" checked={formState.permissions.canManageSettings} onChange={handlePermissionChange} disabled={formState.role === 'admin'} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50" />
                        <span className="ml-3 block text-sm text-slate-700 dark:text-slate-300">{t('user.permissions.manageSettings')}</span>
                    </label>
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
    </>
  );
};

export default UserModal;