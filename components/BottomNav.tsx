import React from 'react';
import { Page, Notification } from '../types';
import { useI18n } from '../App';

interface BottomNavProps {
    onNavigate: (page: Page, contextId?: string) => void;
    currentPage: Page;
    notifications: Notification[];
    currentUserId: string;
}

const NavButton: React.FC<{
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}> = ({ icon, label, isActive, onClick, hasNotification = false }) => {
    const activeClasses = 'text-accent';
    const inactiveClasses = 'text-neutral-500 dark:text-neutral-400';

    return (
        <button 
            onClick={onClick}
            className={`flex-1 flex flex-col items-center justify-center p-2 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
            aria-label={label}
        >
            <div className="relative">
                <i className={`fa-solid ${icon} text-2xl`}></i>
                {hasNotification && (
                    <span className="absolute -top-0.5 -right-0.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#242526]"></span>
                )}
            </div>
            <span className="text-xs mt-1 font-semibold">{label}</span>
        </button>
    );
};


const BottomNav: React.FC<BottomNavProps> = ({ onNavigate, currentPage, notifications, currentUserId }) => {
    const { t } = useI18n();
    const hasUnreadNotifications = notifications.some(n => !n.read);

    // Determines if the profile page is active, for any user
    const isProfileActive = currentPage === 'profile';

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white dark:bg-[#242526] border-t border-neutral-200 dark:border-neutral-700 shadow-[0_-2px_5px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_5px_rgba(0,0,0,0.2)] flex items-stretch">
            <NavButton 
                icon="fa-house"
                label={t('bottomNav.home')}
                isActive={currentPage === 'home'}
                onClick={() => onNavigate('home')}
            />
            <NavButton 
                icon="fa-arrow-trend-up"
                label={t('bottomNav.popular')}
                isActive={currentPage === 'popular'}
                onClick={() => onNavigate('popular')}
            />
             <NavButton 
                icon="fa-bell"
                label={t('bottomNav.notifications')}
                isActive={currentPage === 'notifications'}
                onClick={() => onNavigate('notifications')}
                hasNotification={hasUnreadNotifications}
            />
            <NavButton 
                icon="fa-user"
                label={t('bottomNav.profile')}
                isActive={isProfileActive}
                onClick={() => onNavigate('profile', currentUserId)}
            />
        </nav>
    );
};

export default BottomNav;