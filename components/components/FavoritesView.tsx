




import React from 'react';
import { useAppContext } from '../context/AppContext';
import { useTranslation } from '../hooks/useTranslation';
import { Event } from '../types';
import { StarIcon } from './icons';
import { EventList } from './EventList';

interface FavoritesViewProps {
  onEditEvent: (event: Event) => void;
}

const FavoritesView: React.FC<FavoritesViewProps> = ({ onEditEvent }) => {
    const { state, generatedEvents, toggleFavorite } = useAppContext();
    const { t } = useTranslation();
    const { currentUser, users, categories, favorites } = state;

    const favoriteEvents = generatedEvents
        .filter(event => favorites.includes(event.id))
        .sort((a,b) => a.start.getTime() - b.start.getTime());
    
    const handleToggleFavorite = (e: React.MouseEvent, eventId: string) => {
        e.stopPropagation();
        toggleFavorite(eventId);
    };

    return (
        <div className="p-6 md:p-8 animate-fadeIn">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">{t('favorites.title')}</h1>
            
            {favoriteEvents.length > 0 ? (
                <EventList
                    events={favoriteEvents}
                    onEditEvent={onEditEvent}
                    users={users}
                    categories={categories}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    currentUserId={currentUser.id}
                />
            ) : (
                <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                    <StarIcon className="w-12 h-12 mx-auto text-slate-400 dark:text-slate-500" />
                    <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-slate-100">{t('favorites.empty')}</h3>
                </div>
            )}
        </div>
    );
};

export default FavoritesView;