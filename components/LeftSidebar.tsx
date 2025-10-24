// Import React library.
import React from 'react';
// Import shared type definitions for Page and Notification.
import { Page, Notification } from '../types';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the SidebarLink component.
interface SidebarLinkProps {
  icon: string; // The Font Awesome icon class string.
  text: string; // The text label for the link.
  onClick?: () => void; // Optional click handler.
  isActive?: boolean; // Optional flag to indicate if the link is active.
  hasNotification?: boolean; // Optional flag to show a notification dot.
}

// A reusable component for a single link in the sidebar.
const SidebarLink: React.FC<SidebarLinkProps> = ({ icon, text, onClick, isActive = false, hasNotification = false }) => {
  // Define CSS classes for the active state.
  const activeClasses = 'bg-violet-100 text-accent dark:bg-[#3A3B3C]';
  // Define CSS classes for the inactive state.
  const inactiveClasses = 'hover:bg-neutral-200 dark:hover:bg-[#3A3B3C] text-neutral-700 dark:text-neutral-200';

  // Return a button element styled as a sidebar link.
  return (
    <button onClick={onClick} className={`relative w-full flex items-center p-2 rounded-lg transition-colors duration-200 text-left ${isActive ? activeClasses : inactiveClasses}`}>
      {/* Icon for the link. */}
      <i className={`fa-solid ${icon} w-8 text-center text-xl mr-3`}></i>
      {/* Text label for the link. */}
      <span className="font-semibold">{text}</span>
      {/* Notification dot, rendered conditionally. */}
      {hasNotification && (
          <span className="absolute top-1/2 -translate-y-1/2 right-3 block h-2 w-2 rounded-full bg-red-500"></span>
      )}
    </button>
  );
};

// A simple component for rendering section headers in the sidebar.
const SectionHeader: React.FC<{ title: string }> = ({ title }) => (
    <h2 className="text-xs font-bold text-neutral-500 dark:text-neutral-400 mt-4 px-2 uppercase tracking-wider">{title}</h2>
);

// Define the props interface for the LeftSidebar component.
interface LeftSidebarProps {
    onNavigate: (page: Page) => void; // Function to handle page navigation.
    currentPage: Page; // The currently active page.
    notifications: Notification[]; // Array of notifications to check for unread items.
    onOpenFeedbackModal: () => void;
}

// The LeftSidebar component.
const LeftSidebar: React.FC<LeftSidebarProps> = ({ onNavigate, currentPage, notifications, onOpenFeedbackModal }) => {
  // Use the i18n hook to get the translation function.
  const { t } = useI18n();
  // Determine if there are any unread notifications to display the indicator.
  const hasUnreadNotifications = notifications.some(n => !n.read);

  // Return the main aside element for the sidebar.
  return (
    <aside className={`
      hidden md:flex flex-col
      w-64 p-4 bg-neutral-50 dark:bg-black shadow-lg 
      sticky top-16 h-[calc(100vh-4rem)]
      animate-slide-in-left
    `}>
      {/* The main navigation links container. */}
      <nav className="flex-grow flex flex-col space-y-1">
        {/* Feeds section. */}
        <SectionHeader title={t('sidebar.feeds')} />
        <SidebarLink icon="fa-house" text={t('sidebar.home')} onClick={() => onNavigate('home')} isActive={currentPage === 'home'}/>
        <SidebarLink icon="fa-arrow-trend-up" text={t('sidebar.popular')} onClick={() => onNavigate('popular')} isActive={currentPage === 'popular'} />
        <SidebarLink icon="fa-bookmark" text={t('sidebar.saved')} onClick={() => onNavigate('saved')} isActive={currentPage === 'saved'} />
        <SidebarLink icon="fa-bell" text={t('sidebar.notifications')} onClick={() => onNavigate('notifications')} isActive={currentPage === 'notifications'} hasNotification={hasUnreadNotifications} />
        <SidebarLink icon="fa-user-group" text={t('sidebar.following')} onClick={() => onNavigate('following')} isActive={currentPage === 'following'} />
        <SidebarLink icon="fa-briefcase" text={t('sidebar.teams')} onClick={() => onNavigate('teams')} isActive={currentPage === 'teams'} />
      
        <div className="mt-auto">
            <SectionHeader title={t('sidebar.admin')} />
            <SidebarLink icon="fa-chart-pie" text={t('sidebar.dashboard')} onClick={() => onNavigate('admin')} isActive={currentPage === 'admin'} />
            <SectionHeader title={t('sidebar.account')} />
            <SidebarLink icon="fa-cog" text={t('sidebar.settings')} onClick={() => onNavigate('settings')} isActive={currentPage === 'settings'} />
        </div>
      </nav>
      <div className="mt-4 flex-shrink-0">
        <button onClick={onOpenFeedbackModal} className="w-full bg-white dark:bg-[#3A3B3C] rounded-lg shadow-md p-4 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors text-left">
            <div className="flex items-center space-x-3">
                <i className="fa-solid fa-comment-dots text-accent text-2xl"></i>
                <div>
                    <h2 className="font-bold text-neutral-900 dark:text-neutral-100">Share Feedback</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Have a suggestion or found a bug?</p>
                </div>
            </div>
        </button>
      </div>

    </aside>
  );
};

// Export the LeftSidebar component.
export default LeftSidebar;