
import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import ImageCropModal from './ImageCropModal';
import { CameraIcon, UserCircleIcon } from './icons';
import { User } from '../types';

const ProfileView: React.FC = () => {
  const { state, updateUser } = useAppContext();
  const { t } = useTranslation();
  const { currentUser } = state;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    avatar: currentUser?.avatar || '',
  });

  const [imageSrc, setImageSrc] = useState<string | null>(null);

  useEffect(() => {
    if(currentUser) {
        setFormData({ name: currentUser.name, avatar: currentUser.avatar });
    }
  }, [currentUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleCropSave = (croppedImageUrl: string) => {
    setFormData(prev => ({ ...prev, avatar: croppedImageUrl }));
    setImageSrc(null); // Close modal
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
      if(currentUser) {
        const updatedUserData: User = {
            ...currentUser,
            name: formData.name,
            avatar: formData.avatar,
        };
        updateUser(updatedUserData);
      }
  };
  
  if (!currentUser) {
      return <div>Loading profile...</div>;
  }

  const AvatarComponent = formData.avatar ? (
    <img src={formData.avatar} alt={formData.name} className="w-24 h-24 rounded-full object-cover bg-slate-200 dark:bg-slate-700" />
  ) : (
    <UserCircleIcon className="w-24 h-24 text-slate-400 dark:text-slate-500" />
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
      <div className="p-6 md:p-8 animate-fadeIn">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
          {t('profile.title')}
        </h1>
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-800 rounded-lg shadow-md">
          <div className="p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              {t('profile.section.title')}
            </h2>
            
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
              <div className="relative group flex-shrink-0">
                {AvatarComponent}
                <button
                  onClick={handleAvatarClick}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label={t('profile.upload.avatar')}
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
              <div className="flex-1 w-full">
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t('profile.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('profile.role')}
              </label>
              <input
                type="text"
                readOnly
                value={currentUser.role}
                className="mt-1 block w-full capitalize px-3 py-2 bg-slate-100 dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm sm:text-sm cursor-not-allowed"
              />
            </div>
          </div>
          <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end">
              <button
                  type="button"
                  onClick={handleSave}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                  {t('profile.save')}
              </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileView;
