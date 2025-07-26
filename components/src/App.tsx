
import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import CalendarView from './components/CalendarView';
import SettingsView from './components/SettingsView';
import GuideView from './components/GuideView';
import ProfileView from './components/ProfileView';
import FavoritesView from './components/FavoritesView';
import { Event, User } from './types';
import EventModal from './components/EventModal';
import RecurringConfirmModal from './components/RecurringConfirmModal';
import UserModal from './components/UserModal';
import ActivityLogView from './components/ActivityLogView';
import ShareModal from './components/ShareModal';
import ToastContainer from './components/ToastContainer';
import LoginView from './components/LoginView';

const AppContent: React.FC = () => {
  const { state, generatedEvents, markNotificationAsRead } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | undefined>(undefined);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [recurringModalState, setRecurringModalState] = useState<{
    isOpen: boolean;
    event?: Event;
    action?: 'update' | 'delete';
  }>({ isOpen: false });

  const [userModalState, setUserModalState] = useState<{
    isOpen: boolean;
    user?: User;
  }>({ isOpen: false });
  
  const [shareEvent, setShareEvent] = useState<Event | null>(null);

  const handleEditEvent = (event: Event) => {
    setEventToEdit(event);
    setIsModalOpen(true);
  }

  const handleAddNewEvent = () => {
    setEventToEdit(undefined);
    setIsModalOpen(true);
  }

  const handleCloseEventModal = () => {
    setIsModalOpen(false);
    setEventToEdit(undefined);
  }
  
  const handleNotificationClick = (eventId: string, notificationId: string) => {
    markNotificationAsRead(notificationId);
    const eventToShow = generatedEvents.find(e => e.id === eventId || e.recurringEventId === eventId);
    if (eventToShow) {
      handleEditEvent(eventToShow);
    } else if (state.events) {
      const template = state.events.find(e => e.id === eventId);
      if (template) {
        handleEditEvent(template);
      }
    }
  };

  const renderView = () => {
    if (!state.currentUser) return null; // or a loading spinner
    switch (state.currentView) {
      case 'calendar':
        return <CalendarView onEditEvent={handleEditEvent} />;
      case 'settings':
        return <SettingsView onEditUser={(user) => setUserModalState({ isOpen: true, user })} />;
      case 'favorites':
        return <FavoritesView onEditEvent={handleEditEvent} />;
      case 'guide':
        return <GuideView />;
      case 'profile':
        return <ProfileView />;
      case 'activityLog':
        return <ActivityLogView />;
      default:
        return <CalendarView onEditEvent={handleEditEvent} />;
    }
  };

  if (!state.settings || !state.currentUser || state.users === null || state.categories === null) {
      return <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><p>Loading Planner Data...</p></div>;
  }

  const backgroundStyle: React.CSSProperties = state.settings.backgroundUrl
    ? { backgroundImage: `url(${state.settings.backgroundUrl})` }
    : {};

  return (
    <div className={`flex h-screen font-sans antialiased bg-slate-100 dark:bg-slate-900 ${state.settings.language === 'ja' ? 'font-jp' : ''}`}>
        <ToastContainer />
        <div className="absolute inset-0 bg-cover bg-center transition-opacity duration-500 opacity-20 dark:opacity-10" style={backgroundStyle}></div>
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <div className="flex flex-col flex-1 z-10">
            <Header
              onAddNewEvent={handleAddNewEvent}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              onNotificationClick={handleNotificationClick}
            />
            <main className="flex-1 overflow-y-auto">
              {renderView()}
            </main>
        </div>
        {isModalOpen && <EventModal eventToEdit={eventToEdit} onClose={handleCloseEventModal} setRecurringModalState={setRecurringModalState} onShareRequest={setShareEvent} />}
        {recurringModalState.isOpen && recurringModalState.event && recurringModalState.action && (
            <RecurringConfirmModal 
                event={recurringModalState.event}
                action={recurringModalState.action}
                onClose={() => {
                  setRecurringModalState({ isOpen: false });
                  handleCloseEventModal();
                }}
            />
        )}
        {userModalState.isOpen && (
          <UserModal
            userToEdit={userModalState.user}
            onClose={() => setUserModalState({ isOpen: false, user: undefined })}
          />
        )}
        {shareEvent && (
          <ShareModal 
            event={shareEvent} 
            onClose={() => setShareEvent(null)} 
          />
        )}
    </div>
  );
};

const App: React.FC = () => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="w-screen h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900"><p>Loading Authentication...</p></div>;
    }
    
    return currentUser ? (
        <AppProvider>
            <AppContent />
        </AppProvider>
    ) : (
        <LoginView />
    );
};

const Root: React.FC = () => (
    <AuthProvider>
        <App />
    </AuthProvider>
);

export default Root;
