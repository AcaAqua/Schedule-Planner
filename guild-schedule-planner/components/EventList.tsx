import React from 'react';
import { Event, User, Category } from '../types';
import { StarIcon, UserCircleIcon, getIconComponentByName } from './icons';
import { useTranslation } from '../hooks/useTranslation';

interface EventListProps {
    events: Event[];
    onEditEvent: (event: Event) => void;
    users: User[];
    categories: Category[];
    favorites: string[];
    onToggleFavorite: (e: React.MouseEvent, eventId: string) => void;
    currentUserId: string;
}

const StatusBadge: React.FC<{ status: 'published' | 'draft' | 'private' }> = ({ status }) => {
    const { t } = useTranslation();
    if (status === 'published') {
        return null;
    }
    const statusText = t(`event.status.${status}`);
    return (
        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 dark:text-slate-300 dark:bg-slate-700 rounded-md">
            {statusText}
        </span>
    );
};

export const EventList: React.FC<EventListProps> = ({ events, onEditEvent, users, categories, favorites, onToggleFavorite, currentUserId }) => {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <div className="p-4 md:p-6 space-y-4">
            {sortedEvents.map(event => {
                const category = categories.find(c => c.id === event.categoryId);
                const author = users.find(u => u.id === event.authorId);
                const isFavorite = favorites.includes(event.id);
                const IconComponent = category ? getIconComponentByName(category.icon) : null;
                const isOwner = event.authorId === currentUserId;

                return (
                    <div key={event.id} onClick={() => onEditEvent(event)} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow animate-slideIn">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-shrink-0 sm:w-40 text-center space-y-2">
                                <p className="font-semibold text-slate-700 dark:text-slate-200">{event.start.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{event.start.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })} - {event.end.toLocaleTimeString('default', { hour: '2-digit', minute: '2-digit' })}</p>
                                {author && (
                                    <div className="flex items-center justify-center gap-2">
                                        {author.avatar ? <img src={author.avatar} alt={author.name} className="w-6 h-6 rounded-full object-cover" /> : <UserCircleIcon className="w-6 h-6 text-slate-400" />}
                                        <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{author.name}</span>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{event.title}</h3>
                                        {isOwner && <StatusBadge status={event.status} />}
                                    </div>
                                    <button onClick={(e) => onToggleFavorite(e, event.id)} className="p-2 -mt-2 -mr-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0">
                                        <StarIcon className={`w-5 h-5 transition-colors ${isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400 dark:text-slate-500'}`} />
                                    </button>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{event.description}</p>
                                {category && IconComponent && (
                                    <div className="mt-2 inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: `${category.color}20`, color: category.color }}>
                                        <IconComponent className="w-3 h-3" />
                                        <span>{category.name}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
