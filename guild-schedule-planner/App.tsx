import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
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
import UserSwitchModal from './components/UserSwitchModal';
import ActivityLogView from './components/ActivityLogView';
import ShareModal from './components/ShareModal';
import ToastContainer from './components/ToastContainer';

const AppContent: React.FC = () => {
  const { state, dispatch, generatedEvents } = useAppContext();
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
  
  const [isUserSwitchModalOpen, setIsUserSwitchModalOpen] = useState(false);
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
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    const eventToShow = generatedEvents.find(e => e.id === eventId);
    if (eventToShow) {
      handleEditEvent(eventToShow);
    } else {
      // Fallback for recurring event templates where the instance might not be generated
      const template = state.events.find(e => e.id === eventId);
      if (template) {
        handleEditEvent(template);
      }
    }
  };


  const renderView = () => {
    switch (state.currentView) {
      case 'calendar':
        return <CalendarView onEditEvent={handleEditEvent} />;
      case 'settings':
        return <SettingsView onEditUser={(user) => setUserModalState({ isOpen: true, user })} onAddUser={() => setUserModalState({ isOpen: true, user: undefined })} />;
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
              onSwitchUser={() => setIsUserSwitchModalOpen(true)}
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
        {isUserSwitchModalOpen && (
          <UserSwitchModal 
            onClose={() => setIsUserSwitchModalOpen(false)}
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

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;