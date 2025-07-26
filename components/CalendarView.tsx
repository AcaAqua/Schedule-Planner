



import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ViewMode, Event, Category, User } from '../types';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from './icons';
import { useTranslation } from '../hooks/useTranslation';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { EventList } from './EventList';

interface CalendarViewProps {
  onEditEvent: (event: Event) => void;
}

const CalendarHeader: React.FC<{
  currentDate: Date;
  viewMode: ViewMode;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (view: ViewMode) => void;
}> = ({ currentDate, viewMode, onPrev, onNext, onToday, onViewChange }) => {
  const formatHeaderDate = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' });
      case 'week':
        const start = new Date(currentDate);
        const isMobile = useMediaQuery('(max-width: 768px)');
        const daysToShow = isMobile ? 3 : 7;
        if (!isMobile) {
            start.setDate(start.getDate() - start.getDay());
        }
        const end = new Date(start);
        end.setDate(end.getDate() + daysToShow - 1);
        return `${start.toLocaleDateString('default', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' })}`;
      case 'list':
        return 'All Events';
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 md:p-6 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 min-w-[200px]">{formatHeaderDate()}</h2>
        <div className="flex items-center gap-2">
          <button onClick={onPrev} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronLeftIcon className="w-5 h-5" /></button>
          <button onClick={onNext} className="p-2 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"><ChevronRightIcon className="w-5 h-5" /></button>
          <button onClick={onToday} className="px-3 py-1.5 text-sm font-semibold border border-slate-300 dark:border-slate-600 rounded-md text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">Today</button>
        </div>
      </div>
      <div className="flex items-center bg-slate-200 dark:bg-slate-700 rounded-md p-1">
        {(['month', 'week', 'list'] as ViewMode[]).map(v => (
          <button key={v} onClick={() => onViewChange(v)} className={`px-3 py-1 text-sm font-medium rounded capitalize transition-colors ${viewMode === v ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>{v}</button>
        ))}
      </div>
    </div>
  );
};

const MonthView: React.FC<{ 
    date: Date; 
    events: Event[]; 
    onEditEvent: (event: Event) => void;
    onToggleFavorite: (e: React.MouseEvent, eventId: string) => void;
}> = ({ date, events, onEditEvent, onToggleFavorite }) => {
  const { state } = useAppContext();
  const { favorites, categories, currentUser } = state;

  const daysInMonth = useMemo(() => {
    const days = [];
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= lastDate; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [date]);

  const today = new Date();

  const StatusBadge: React.FC<{ status: Event['status'] }> = ({ status }) => {
    const { t } = useTranslation();
    if (status === 'published') return null;
    const statusText = t(`event.status.${status}`);
    return (
        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-200 dark:text-slate-300 dark:bg-slate-700 rounded-md">
            {statusText}
        </span>
    );
  };

  return (
    <div className="grid grid-cols-7 flex-1">
      <div className="grid grid-cols-7 col-span-7 border-b border-slate-200 dark:border-slate-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 col-span-7">
        {daysInMonth.map((day, index) => {
          const isToday = day && day.toDateString() === today.toDateString();
          const eventsForDay = day ? events.filter(e => new Date(e.start).toDateString() === day.toDateString()) : [];
          return (
            <div key={index} className="relative min-h-[120px] p-2 border-r border-b border-slate-200 dark:border-slate-700 last:border-r-0">
              {day && <span className={`absolute top-2 right-2 text-sm font-medium ${isToday ? 'bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-500 dark:text-slate-400'}`}>{day.getDate()}</span>}
              <div className="mt-8 space-y-1">
                {eventsForDay.map(event => {
                    const category = categories.find(c => c.id === event.categoryId);
                    const isFavorite = favorites.includes(event.id);
                    const isOwner = event.authorId === currentUser.id;
                    return (
                        <button 
                            key={event.id} 
                            onClick={() => onEditEvent(event)} 
                            className="relative group w-full text-left p-1.5 rounded-md text-xs text-white truncate hover:opacity-90"
                            style={{ backgroundColor: category?.color || '#6b7280' }}
                        >
                            <span className="pr-5">{event.title}</span>
                             {isOwner && <StatusBadge status={event.status} />}
                            <div 
                                onClick={(e) => onToggleFavorite(e, event.id)}
                                className="absolute right-0 top-0 bottom-0 flex items-center px-1.5 rounded-r-md opacity-0 group-hover:opacity-100 bg-black/20 hover:bg-black/40 transition-opacity"
                            >
                                <StarIcon className={`w-4 h-4 transition-colors ${isFavorite ? 'text-yellow-300 fill-yellow-300' : 'text-white/70'}`} />
                            </div>
                        </button>
                    );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const WeekView: React.FC<{
    date: Date;
    events: Event[];
    onEditEvent: (event: Event) => void;
}> = ({ date, events, onEditEvent }) => {
    const { state } = useAppContext();
    const { categories, currentUser } = state;
    const isMobile = useMediaQuery('(max-width: 768px)');
    const daysToShow = isMobile ? 3 : 7;
    
    const weekDays = useMemo(() => {
        const startOfWeek = new Date(date);
        if(!isMobile) {
            startOfWeek.setDate(date.getDate() - date.getDay());
        }
        return Array.from({ length: daysToShow }, (_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            return day;
        });
    }, [date, isMobile, daysToShow]);

    const today = new Date();

    const timeSlots = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

    const calculateEventPosition = (event: Event) => {
        const start = new Date(event.start);
        const end = new Date(event.end);

        const startMinutes = start.getHours() * 60 + start.getMinutes();
        const endMinutes = end.getHours() * 60 + end.getMinutes();
        const duration = Math.max(30, endMinutes - startMinutes); // min 30min height

        const top = (startMinutes / (24 * 60)) * 100;
        const height = (duration / (24 * 60)) * 100;

        return { top: `${top}%`, height: `${height}%` };
    };
    
    const StatusBadge: React.FC<{ status: Event['status'] }> = ({ status }) => {
        const { t } = useTranslation();
        if (status === 'published') return null;
        const statusText = t(`event.status.${status}`);
        return (
            <span className="ml-1 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white bg-black/20 rounded-sm">
                {statusText}
            </span>
        );
    };

    const gridColsClass = `grid-cols-${daysToShow}`;

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-slate-800">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr] flex-shrink-0 z-10 shadow-sm">
                <div className="w-14 border-r border-slate-200 dark:border-slate-700"></div>
                <div className={`grid ${gridColsClass}`}>
                    {weekDays.map(day => (
                        <div key={day.toISOString()} className="p-2 text-center border-l border-slate-200 dark:border-slate-700 first:border-l-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">{day.toLocaleDateString('default', { weekday: 'short' })}</p>
                            <p className={`text-lg font-semibold ${day.toDateString() === today.toDateString() ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {day.getDate()}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Body */}
            <div className="flex-1 grid grid-cols-[auto_1fr] overflow-y-auto">
                {/* Time column */}
                <div className="w-14 text-right">
                    {timeSlots.map(time => (
                        <div key={time} className="h-16 pr-2 -mt-2.5 text-xs text-slate-400 dark:text-slate-500 flex items-start justify-end pt-2">
                            {time !== '00:00' && <span>{time}</span>}
                        </div>
                    ))}
                </div>

                {/* Event grid */}
                <div className={`grid ${gridColsClass} relative col-start-2`}>
                    {/* Grid lines */}
                    {timeSlots.map(time => (
                         <div key={time} className={`col-span-${daysToShow} h-16 border-t border-slate-200 dark:border-slate-700`}></div>
                    ))}
                    
                    {/* Events */}
                    {weekDays.map((day, dayIndex) => (
                        <div key={day.toISOString()} className="relative border-l border-slate-200 dark:border-slate-700" style={{ gridColumn: dayIndex + 1 }}>
                            {events
                                .filter(event => new Date(event.start).toDateString() === day.toDateString())
                                .map(event => {
                                    const { top, height } = calculateEventPosition(event);
                                    const category = categories.find(c => c.id === event.categoryId);
                                    const isOwner = event.authorId === currentUser.id;

                                    return (
                                        <button
                                            key={event.id}
                                            onClick={() => onEditEvent(event)}
                                            className="absolute w-[calc(100%-0.5rem)] ml-1 p-2 text-left text-white rounded-lg shadow-md overflow-hidden hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                            style={{
                                                top,
                                                height,
                                                backgroundColor: category?.color || '#6b7280',
                                            }}
                                            title={event.title}
                                        >
                                            <div className="font-bold text-xs truncate">
                                                <span>{event.title}</span>
                                                {isOwner && <StatusBadge status={event.status} />}
                                            </div>
                                            <p className="text-xs opacity-80 truncate">{new Date(event.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(event.end).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </button>
                                    );
                                })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const CalendarView: React.FC<CalendarViewProps> = ({ onEditEvent }) => {
  const { state, dispatch, generatedEvents } = useAppContext();
  const { favorites, users, categories, activeCategoryFilter, isFavoritesFilterActive, currentUser } = state;
  const isMobile = useMediaQuery('(max-width: 768px)');

  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');

  const filteredEvents = useMemo(() => {
    let events = generatedEvents;

    if (isFavoritesFilterActive) {
      events = events.filter(e => favorites.includes(e.id));
    }

    if (activeCategoryFilter) {
      events = events.filter(e => e.categoryId === activeCategoryFilter);
    }
    
    return events;
  }, [generatedEvents, activeCategoryFilter, isFavoritesFilterActive, favorites]);

  const handlePrev = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() - (isMobile ? 1 : 7));
      else newDate.setMonth(newDate.getMonth() -1); // Fallback for list
      return newDate;
    });
  };

  const handleNext = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
      else if (viewMode === 'week') newDate.setDate(newDate.getDate() + (isMobile ? 1 : 7));
      else newDate.setMonth(newDate.getMonth() + 1); // Fallback for list
      return newDate;
    });
  };
  
  const handleToday = () => setCurrentDate(new Date());
  
  const handleToggleFavorite = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_FAVORITE', payload: eventId });
  };

  const renderCurrentView = () => {
      switch(viewMode) {
          case 'month':
              return <MonthView 
                date={currentDate} 
                events={filteredEvents} 
                onEditEvent={onEditEvent}
                onToggleFavorite={handleToggleFavorite}
              />;
          case 'week':
              return <WeekView
                date={currentDate}
                events={filteredEvents}
                onEditEvent={onEditEvent}
              />;
          case 'list':
              return <EventList
                events={filteredEvents}
                onEditEvent={onEditEvent}
                users={users}
                categories={categories}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                currentUserId={currentUser.id}
              />;
          default:
              return null;
      }
  }

  return (
    <div className="flex flex-col h-full">
      <CalendarHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onViewChange={setViewMode}
      />
      <div className="flex-1 overflow-y-auto">
        {renderCurrentView()}
      </div>
    </div>
  );
};

export default CalendarView;