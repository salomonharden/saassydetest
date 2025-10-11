// Import necessary React hooks for state and component lifecycle.
import React, { useState, useRef, useEffect } from 'react';
// Import shared type definitions for User, Page, and Notification.
import { User, Page, Notification } from '../types';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the Header component.
interface HeaderProps {
  onNavigate: (page: Page, contextId?: string | number) => void; // Function to handle main page navigation.
  isDarkMode: boolean; // Boolean indicating if dark mode is active.
  onToggleTheme: () => void; // Function to toggle the dark/light theme.
  currentUser: User; // The currently logged-in user object.
  onCreatePostClick: () => void; // Function to open the create post modal.
  notifications: Notification[]; // Array of user's notifications.
  allUsers: { [key: string]: User }; // A map of all users for looking up actor names.
  onNotificationClick: (notification: Notification) => void; // Function to handle clicking a notification.
  searchQuery: string; // The current value of the search input.
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Handler for search input changes.
  onClearSearch: () => void; // Function to clear the search input.
  showLogoAndSearch?: boolean; // New prop to control visibility of logo and search.
  onLogout: () => void;
}

// The Header functional component definition.
const Header: React.FC<HeaderProps> = ({ 
  onNavigate, isDarkMode, onToggleTheme, currentUser, onCreatePostClick,
  notifications, allUsers, onNotificationClick, searchQuery, onSearchChange, onClearSearch,
  showLogoAndSearch = true, onLogout
}) => {
  // Use the i18n hook to get the translation function.
  const { t } = useI18n();
  // State to manage the visibility of the user profile dropdown.
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // State to manage the visibility of the notifications dropdown.
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  // Ref to the user dropdown DOM element, used for detecting outside clicks.
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Ref to the notifications dropdown DOM element.
  const notificationsRef = useRef<HTMLDivElement>(null);

  // useEffect hook to handle clicks outside of the dropdowns to close them.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If the click is outside the user dropdown, close it.
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      // If the click is outside the notifications dropdown, close it.
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    // Add the event listener to the document.
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup function to remove the event listener when the component unmounts.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs only once on mount.

  // Check if there are any unread notifications to display the indicator dot.
  const hasUnreadNotifications = notifications.some(n => !n.read);
  
  // Function to generate the descriptive text for a notification.
  const formatNotificationText = (notification: Notification): string => {
    const actor = allUsers[notification.actorId]; // Get the user who triggered the notification.
    if (!actor) return 'A notification from a user.'; // Fallback text.

    // Return text based on the notification type.
    switch (notification.type) {
      case 'like':
        return `liked your post.`;
      case 'comment':
        return `commented on your post.`;
      case 'follow':
        return `started following you.`;
      case 'team_accept':
        return `accepted your application to join their team.`;
      case 'team_apply':
        return `applied to join your team.`;
      default:
        return 'New notification.';
    }
  };

  // The JSX for the Header component.
  return (
    // The main header element with fixed positioning and styling.
    <header className="fixed top-0 z-50 flex items-center justify-between w-full p-2 bg-white dark:bg-[#242526] border-b border-neutral-200 dark:border-neutral-700 shadow-md h-16">
      {/* Left section of the header. */}
      <div className="flex items-center flex-shrink-0">
        {/* Logo, clickable to navigate home. Its visibility is controlled by opacity. */}
        <div
          onClick={() => { if(showLogoAndSearch) { onNavigate('home'); onClearSearch(); } }}
          className={`cursor-pointer transition-transform hover:scale-110 p-1 transition-opacity duration-300 ${showLogoAndSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
          aria-label="Home"
          aria-hidden={!showLogoAndSearch}
        >
          <img
            src="https://i.postimg.cc/c4yPXcZC/logo-1.png"
            alt="App Logo"
            className="h-11 w-23"
          />
        </div>
      </div>

      {/* Center section containing the search bar. Its visibility is controlled by opacity. */}
      <div className={`flex-grow flex justify-center mx-2 sm:mx-4 transition-opacity duration-300 ${showLogoAndSearch ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="relative w-full max-w-md">
          {/* Search icon inside the input field. */}
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
          </div>
          {/* The search input field. */}
          <input
            type="text"
            placeholder={t('header.searchPlaceholder')}
            value={searchQuery}
            onChange={onSearchChange}
            disabled={!showLogoAndSearch}
            className="bg-neutral-100 dark:bg-[#3A3B3C] text-neutral-800 dark:text-gray-200 rounded-full py-2 pl-10 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {/* Clear search button, visible only when there is a query. */}
          {searchQuery && (
            <button 
                onClick={onClearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                aria-label="Clear search"
            >
                <i className="fa-solid fa-times-circle"></i>
            </button>
          )}
        </div>
      </div>
      
      {/* Right section with action buttons and user menu. */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        {/* "Create Post" button, hidden on small screens. */}
        <button onClick={onCreatePostClick} className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors" aria-label={t('header.createPost')}>
            <i className="fa-solid fa-plus text-xl"></i>
        </button>
        
        {/* Notifications Dropdown container. */}
        <div className="relative" ref={notificationsRef}>
            {/* Notifications button. */}
            <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors"
                aria-label={t('header.notifications')}
            >
                <i className="fa-solid fa-bell text-xl"></i>
                {/* Unread notification indicator dot. */}
                {hasUnreadNotifications && (
                  <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#242526]"></span>
                )}
            </button>
            {/* The notifications dropdown panel, rendered conditionally. */}
            {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#242526] border border-neutral-200 dark:border-neutral-600 rounded-lg shadow-xl py-1 max-h-[80vh] overflow-y-auto">
                    <div className="px-4 py-2">
                      <h3 className="font-bold text-lg">{t('header.notifications')}</h3>
                    </div>
                    <hr className="border-neutral-200 dark:border-neutral-600"/>
                    {/* Check if there are any notifications to display. */}
                    {notifications.length > 0 ? (
                      <ul>
                        {/* Map over the notifications array to render each one. */}
                        {notifications.map(notification => {
                          const actor = allUsers[notification.actorId]; // Look up the actor.
                          if (!actor) return null; // Don't render if actor not found.
                          return (
                            <li key={notification.id}>
                              <button 
                                onClick={() => {
                                  onNotificationClick(notification); // Handle click action.
                                  setIsNotificationsOpen(false); // Close dropdown on click.
                                }}
                                className={`w-full text-left flex items-start p-3 space-x-3 transition-colors ${!notification.read ? 'bg-violet-50 dark:bg-violet-900/30' : ''} hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]`}
                              >
                                <img src={actor.avatarUrl} alt={actor.name} className="w-10 h-10 rounded-full flex-shrink-0"/>
                                <div className="flex-grow">
                                  <p className="text-sm">
                                    <span className="font-bold">{actor.name}</span> {formatNotificationText(notification)}
                                  </p>
                                  <p className="text-xs text-accent font-semibold mt-1">{notification.timestamp}</p>
                                </div>
                                {/* Unread indicator dot for individual notification. */}
                                {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      // Message shown when there are no notifications.
                      <p className="p-4 text-sm text-neutral-500 dark:text-neutral-400 text-center">{t('header.noNotifications')}</p>
                    )}
                </div>
            )}
        </div>

        {/* User Dropdown container. */}
        <div className="relative" ref={dropdownRef}>
            {/* Button to open the user dropdown. */}
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-neutral-100 dark:bg-[#3A3B3C] hover:bg-neutral-200 dark:hover:bg-neutral-600 p-1 pr-2 rounded-md transition-colors"
            >
                <img src={currentUser.avatarUrl} alt="User Avatar" className="w-7 h-7 rounded-md" />
                <div className="hidden lg:flex flex-col items-start">
                    <span className="text-xs font-semibold">{currentUser.name}</span>
                </div>
                <i className="fa-solid fa-chevron-down text-xs text-neutral-500 dark:text-neutral-300"></i>
            </button>
            {/* The user dropdown panel, rendered conditionally. */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#242526] border border-neutral-200 dark:border-neutral-600 rounded-md shadow-lg py-1">
                    {/* Profile link. */}
                    <button onClick={() => { onNavigate('profile', currentUser.id); setIsDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                        <i className="fa-solid fa-user w-6 mr-2"></i> {t('header.profile')}
                    </button>
                    {/* Settings link (placeholder). */}
                    <button onClick={() => { onNavigate('settings'); setIsDropdownOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                        <i className="fa-solid fa-cog w-6 mr-2"></i> {t('header.settings')}
                    </button>
                    <hr className="border-neutral-200 dark:border-neutral-600 my-1"/>
                    {/* Theme toggle button. */}
                    <button onClick={onToggleTheme} className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                        {isDarkMode ? (
                            <><i className="fa-solid fa-sun w-6 mr-2"></i> {t('header.lightMode')}</>
                        ) : (
                            <><i className="fa-solid fa-moon w-6 mr-2"></i> {t('header.darkMode')}</>
                        )}
                    </button>
                    <hr className="border-neutral-200 dark:border-neutral-600 my-1"/>
                    {/* Log Out button. */}
                    <button onClick={onLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                        <i className="fa-solid fa-right-from-bracket w-6 mr-2"></i> {t('header.logout')}
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

// Export the Header component.
export default Header;