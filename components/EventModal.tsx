

import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Event, Comment, RecurringPattern } from '../types';
import { XMarkIcon, ChevronDownIcon, UserCircleIcon, StarIcon, TrashIcon, ShareIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import ImageCropModal from './ImageCropModal';

interface EventModalProps {
  eventToEdit?: Event;
  onClose: () => void;
  setRecurringModalState: (state: { isOpen: boolean; event?: Event; action?: 'update' | 'delete' }) => void;
  onShareRequest: (event: Event) => void;
}

const formatTimeAgo = (date: Date, t: (key: string) => string): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 5) return t('time.ago.justnow');
  if (seconds < 60) return `${seconds}${t('time.ago.seconds')}`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes === 1) return t('time.ago.minute');
  if (minutes < 60) return `${minutes}${t('time.ago.minutes')}`;
  
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return t('time.ago.hour');
  if (hours < 24) return `${hours}${t('time.ago.hours')}`;

  const days = Math.floor(hours / 24);
  if (days === 1) return t('time.ago.day');
  return `${days}${t('time.ago.days')}`;
}


const EventModal: React.FC<EventModalProps> = ({ eventToEdit, onClose, setRecurringModalState, onShareRequest }) => {
  const { state, dispatch } = useAppContext();
  const { t } = useTranslation();
  const { categories, currentUser, users, favorites, comments } = state;
  const [detailsExpanded, setDetailsExpanded] = useState(!!(eventToEdit?.description || eventToEdit?.image || eventToEdit?.isRecurring));
  
  const getInitialState = () => {
    const toLocalISOString = (date: Date) => {
        const tzoffset = (new Date()).getTimezoneOffset() * 60000;
        return (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
    }
    
    if (eventToEdit) {
      return {
        ...eventToEdit,
        start: toLocalISOString(new Date(eventToEdit.start)),
        end: toLocalISOString(new Date(eventToEdit.end)),
        isRecurring: eventToEdit.isRecurring || !!eventToEdit.recurringEventId,
        recurringPattern: eventToEdit.recurringPattern || { frequency: 'weekly', days: [] }
      };
    }
    
    const lastCategory = localStorage.getItem('lastUsedCategory') || categories[0].id;
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return {
      title: '',
      description: '',
      start: toLocalISOString(now),
      end: toLocalISOString(oneHourLater),
      categoryId: lastCategory,
      image: '',
      status: 'draft' as const,
      isRecurring: false,
      recurringPattern: { frequency: 'weekly' as const, days: [] as number[] }
    };
  };

  const [formState, setFormState] = useState(getInitialState);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const eventImageInputRef = useRef<HTMLInputElement>(null);
  
  const author = eventToEdit ? users.find(u => u.id === eventToEdit.authorId) : null;
  const isFavorite = eventToEdit ? favorites.includes(eventToEdit.id) : false;
  
  // Permission Check
  const canEdit = !eventToEdit || currentUser.role === 'admin' || currentUser.id === eventToEdit.authorId;

  const eventComments = eventToEdit ? comments.filter(c => c.eventId === eventToEdit.id || c.eventId === eventToEdit.recurringEventId).sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];
  const [newComment, setNewComment] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isChecked = (e.target as HTMLInputElement).checked;

    if(name === 'isRecurring') {
        setFormState(prev => ({...prev, isRecurring: isChecked}));
        if(isChecked) setDetailsExpanded(true);
    } else {
        setFormState(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleRecurringDayChange = (day: number) => {
      setFormState(prev => {
          const currentDays = prev.recurringPattern?.days || [];
          const newDays = currentDays.includes(day)
            ? currentDays.filter(d => d !== day)
            : [...currentDays, day];
          return { ...prev, recurringPattern: { ...prev.recurringPattern, frequency: 'weekly', days: newDays.sort() } as RecurringPattern };
      });
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImageCropSave = (croppedImageUrl: string) => {
    setFormState(prev => ({ ...prev, image: croppedImageUrl }));
    setImageToCrop(null);
  };

  const handleToggleFavorite = () => {
    if (eventToEdit) {
      dispatch({ type: 'TOGGLE_FAVORITE', payload: eventToEdit.id });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    
    const eventData: Event = {
      ...(eventToEdit || {}),
      ...formState,
      id: eventToEdit?.id || `event-${new Date().getTime()}`,
      authorId: eventToEdit?.authorId || currentUser.id,
      start: new Date(formState.start),
      end: new Date(formState.end),
      recurringPattern: formState.isRecurring ? formState.recurringPattern : undefined,
    };

    if (eventToEdit?.recurringEventId) {
      setRecurringModalState({ isOpen: true, event: eventData, action: 'update' });
      return;
    }

    const action = eventToEdit ? 'UPDATE_EVENT' : 'ADD_EVENT';
    dispatch({ type: action, payload: eventData });

    if (!eventToEdit) {
      localStorage.setItem('lastUsedCategory', formState.categoryId);
    }
    onClose();
  };
  
  const handleDelete = () => {
    if (eventToEdit && canEdit) {
        if(eventToEdit.recurringEventId) {
            setRecurringModalState({isOpen: true, event: eventToEdit, action: 'delete'});
            return;
        }
      dispatch({ type: 'DELETE_EVENT', payload: { eventId: eventToEdit.id, eventName: eventToEdit.title } });
      onClose();
    }
  };
  
  const handlePostComment = () => {
    if (!newComment.trim() || !eventToEdit) return;
    const comment: Comment = {
      id: `comment-${new Date().getTime()}`,
      eventId: eventToEdit.recurringEventId || eventToEdit.id,
      authorId: currentUser.id,
      content: newComment.trim(),
      createdAt: new Date(),
    };
    dispatch({ type: 'ADD_COMMENT', payload: comment });
    setNewComment('');
  };

  const handleDeleteComment = (commentId: string) => {
      if (window.confirm(t('event.comments.delete.confirm'))) {
          dispatch({ type: 'DELETE_COMMENT', payload: commentId });
      }
  };

  return (
    <>
     {imageToCrop && (
        <ImageCropModal
            imageSrc={imageToCrop}
            onClose={() => setImageToCrop(null)}
            onSave={handleImageCropSave}
            aspect={16 / 9}
            circularCrop={false}
        />
     )}
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col animate-slideIn">
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{eventToEdit ? t('event.modal.edit.title') : t('event.modal.add.title')}</h2>
            {eventToEdit && (
                <>
                <button
                  onClick={handleToggleFavorite}
                  className="p-1 rounded-full hover:bg-yellow-100/50 dark:hover:bg-yellow-400/10"
                  aria-label={isFavorite ? t('event.favorite.remove') : t('event.favorite.add')}
                >
                  <StarIcon className={`w-6 h-6 transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 dark:text-slate-500'}`} />
                </button>
                <button
                    onClick={() => onShareRequest(eventToEdit)}
                    className="p-1 rounded-full text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400"
                    aria-label={t('share.title')}
                >
                    <ShareIcon className="w-5 h-5" />
                </button>
                </>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto">
            <fieldset disabled={!canEdit} className="disabled:opacity-75">
            <div className="p-6 space-y-4">
              {author && (
                <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-md">
                  {author.avatar ? <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover" /> : <UserCircleIcon className="w-6 h-6 text-slate-400" />}
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t('event.author')}: {author.name}</span>
                </div>
              )}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.title')}</label>
                <input type="text" name="title" id="title" value={formState.title} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50" />
              </div>
              <div>
                <label htmlFor="categoryId" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.category')}</label>
                <select name="categoryId" id="categoryId" value={formState.categoryId} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50">
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.start')}</label>
                  <input type="datetime-local" name="start" id="start" value={formState.start} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50" />
                </div>
                <div>
                  <label htmlFor="end" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.end')}</label>
                  <input type="datetime-local" name="end" id="end" value={formState.end} onChange={handleChange} required className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50" />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <button type="button" onClick={() => setDetailsExpanded(!detailsExpanded)} className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300">
                  <span>{t('event.moreOptions')}</span>
                  <ChevronDownIcon className={`w-5 h-5 transition-transform ${detailsExpanded ? 'rotate-180' : ''}`} />
                </button>
                {detailsExpanded && (
                  <div className="mt-4 space-y-4 animate-fadeIn">
                    <div className="relative">
                        <label className="flex items-center">
                            <input type="checkbox" name="isRecurring" checked={formState.isRecurring} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed" />
                            <span className="ml-3 block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.repeat')}</span>
                        </label>
                        {formState.isRecurring && (
                            <div className="mt-4 pl-7">
                                <p className="text-sm text-slate-600 dark:text-slate-400">{t('event.repeat.days')}</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                        <button
                                            type="button"
                                            key={index}
                                            onClick={() => handleRecurringDayChange(index)}
                                            disabled={!canEdit}
                                            className={`w-8 h-8 rounded-full text-xs font-semibold flex items-center justify-center transition-colors disabled:cursor-not-allowed ${formState.recurringPattern?.days.includes(index) ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'}`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.description')}</label>
                      <textarea name="description" id="description" value={formState.description} onChange={handleChange} rows={3} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50"></textarea>
                    </div>
                     <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.image')}</label>
                      <div className="mt-1">
                        {formState.image ? (
                          <div className="relative group">
                            <img src={formState.image} alt="Event" className="w-full h-auto rounded-md object-cover bg-slate-200 dark:bg-slate-700" />
                            {canEdit && <button
                              type="button"
                              onClick={() => setFormState(prev => ({ ...prev, image: '' }))}
                              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label={t('event.removeImage')}
                            >
                              <XMarkIcon className="w-5 h-5" />
                            </button>}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => eventImageInputRef.current?.click()}
                            disabled={!canEdit}
                            className="w-full flex justify-center px-6 py-10 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md hover:border-indigo-500 dark:hover:border-indigo-400 disabled:cursor-not-allowed disabled:hover:border-slate-300 dark:disabled:hover:border-slate-600"
                          >
                            <div className="space-y-1 text-center">
                              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <p className="text-sm text-slate-600 dark:text-slate-400">{t('event.uploadImage')}</p>
                            </div>
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={eventImageInputRef}
                        onChange={handleImageFileChange}
                        accept="image/*"
                        className="hidden"
                        disabled={!canEdit}
                      />
                    </div>
                    
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t('event.status')}</label>
                        <select name="status" id="status" value={formState.status} onChange={handleChange} disabled={!canEdit} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-700/50">
                            <option value="published">{t('event.status.published')}</option>
                            <option value="draft">{t('event.status.draft')}</option>
                            <option value="private">{t('event.status.private')}</option>
                        </select>
                    </div>
                    
                  </div>
                )}
              </div>
            </div>
            </fieldset>

            {state.settings.enableComments && eventToEdit && (
              <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 mt-4">
                <h3 className="text-md font-semibold text-slate-800 dark:text-slate-200 mb-4 pt-4">{t('event.comments.title')} ({eventComments.length})</h3>
                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {eventComments.map(comment => {
                      const commentAuthor = users.find(u => u.id === comment.authorId);
                      const canDeleteComment = currentUser.role === 'admin' || currentUser.id === comment.authorId;
                      return (
                        <div key={comment.id} className="flex items-start gap-3 group">
                          {commentAuthor?.avatar ? <img src={commentAuthor.avatar} alt={commentAuthor.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <UserCircleIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />}
                          <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{commentAuthor?.name || 'Unknown User'}</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400">{formatTimeAgo(comment.createdAt, t)}</span>
                              </div>
                              <p className="text-sm text-slate-700 dark:text-slate-300 mt-1 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                          {canDeleteComment && (
                              <button type="button" onClick={() => handleDeleteComment(comment.id)} className="p-1 rounded-full text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <TrashIcon className="w-4 h-4"/>
                              </button>
                          )}
                        </div>
                      )
                  })}
                </div>
                <div className="mt-4 flex items-start gap-3">
                  {currentUser.avatar ? <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" /> : <UserCircleIcon className="w-8 h-8 text-slate-400 flex-shrink-0" />}
                  <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={t('event.comments.placeholder')}
                        rows={2}
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={handlePostComment}
                        disabled={!newComment.trim()}
                        className="mt-2 px-4 py-1.5 text-xs font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                      >
                        {t('event.comments.post')}
                      </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-shrink-0 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
            <div>
              {eventToEdit && canEdit && (
                <button type="button" onClick={handleDelete} className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md">{t('event.delete')}</button>
              )}
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600">{t('event.cancel')}</button>
              {canEdit && (
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    {eventToEdit ? t('event.save') : t('event.create')}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default EventModal;