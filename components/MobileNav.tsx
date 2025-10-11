// Import React library.
import React from 'react';

// Define the props interface for the MobileNav component.
interface MobileNavProps {
  onNavigate: (page: 'home' | 'profile') => void; // Function to handle navigation.
  currentPage: 'home' | 'profile'; // The currently active page.
}

// A reusable sub-component for a single navigation button in the mobile nav bar.
const NavButton: React.FC<{
  icon: string; // The Font Awesome icon class.
  isActive: boolean; // Flag to indicate if this button's page is active.
  onClick: (e: React.MouseEvent) => void; // The click handler.
}> = ({ icon, isActive, onClick }) => {
  // Define CSS classes for the active state.
  const activeClasses = "text-[#a452fd]";
  // Define CSS classes for the inactive state.
  const inactiveClasses = "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white";
  // Return an anchor tag styled as a nav button.
  return (
    <a href="#" onClick={onClick} className={`flex-1 text-center py-3 text-2xl transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}>
      {/* The icon for the button. */}
      <i className={`fa-solid ${icon}`}></i>
    </a>
  );
};

// The MobileNav functional component. Note: This component doesn't seem to be used in the main App.tsx.
const MobileNav: React.FC<MobileNavProps> = ({ onNavigate, currentPage }) => {
  // Return the main navigation container.
  return (
    // A fixed navigation bar at the top of the screen, only visible on small screens (based on lg:hidden).
    <nav className="fixed top-0 z-40 w-full h-14 bg-white dark:bg-[#525252] border-b border-neutral-200 dark:border-neutral-700 shadow-md lg:hidden">
      {/* Flex container for the navigation buttons. */}
      <div className="flex h-full items-center">
        {/* Home button. */}
        <NavButton icon="fa-house" isActive={currentPage === 'home'} onClick={(e) => { e.preventDefault(); onNavigate('home'); }} />
        {/* Placeholder 'Following' button. */}
        <NavButton icon="fa-user-group" isActive={false} onClick={(e) => e.preventDefault()} />
        {/* Placeholder 'Teams' button. */}
        <NavButton icon="fa-briefcase" isActive={false} onClick={(e) => e.preventDefault()} />
        {/* Profile button (using a 'bars' icon, likely should be 'fa-user'). */}
        <NavButton icon="fa-bars" isActive={currentPage === 'profile'} onClick={(e) => { e.preventDefault(); onNavigate('profile'); }} />
      </div>
    </nav>
  );
};

// Export the MobileNav component.
export default MobileNav;
