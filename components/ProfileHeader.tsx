// Import React and the useState hook.
import React, { useState } from 'react';
// Import the User type definition.
import { User, Page } from '../types';
import { useI18n } from '../App';

// Define the props interface for the ProfileHeader component.
interface ProfileHeaderProps {
  user: User; // The user whose profile is being displayed.
  currentUser: User; // The currently logged-in user.
  activeTab: 'posts' | 'about'; // The currently active tab ('posts' or 'about').
  onTabChange: (tab: 'posts' | 'about') => void; // Function to change the active tab.
  isFollowing: boolean; // Boolean indicating if the current user is following this user.
  onToggleFollow: (userId: string) => void; // Function to follow or unfollow the user.
  postsCount: number; // The total number of posts by the user.
  onNavigate: (page: Page) => void;
  onBack?: () => void;
}

// The ProfileHeader functional component.
const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, currentUser, activeTab, onTabChange, isFollowing, onToggleFollow, postsCount, onNavigate, onBack }) => {
  const { t } = useI18n();
  // State to track if the mouse is hovering over the "Following" button to change its text to "Unfollow".
  const [isHoveringFollow, setIsHoveringFollow] = useState(false);
  // Check if the profile being viewed is the current user's own profile.
  const isOwnProfile = user.id === currentUser.id;

  // A reusable sub-component for the navigation tabs ('Posts', 'About').
  const NavButton: React.FC<{ tabName: 'posts' | 'about'; children: React.ReactNode }> = ({ tabName, children }) => {
    // Determine if this tab button is currently active.
    const isActive = activeTab === tabName;
    return (
        <button
            onClick={() => onTabChange(tabName)}
            className={`py-3 px-2 sm:px-4 font-semibold whitespace-nowrap text-sm sm:text-base ${
                // Apply different styles based on whether the tab is active or not.
                isActive
                    ? 'text-accent border-b-4 border-accent'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-black/10 rounded-lg transition-colors'
            }`}
        >
            {children}
        </button>
    );
  };

  // The main JSX for the profile header.
  return (
    <div className="sticky top-16 z-30 animate-fade-in-slide-up">
        {/* This div matches the content container below it for width and horizontal padding */}
        <div className="w-full lg:max-w-2xl mx-auto px-0 md:px-4 pt-4">
            {/* This is the actual floating, rounded card, styled like the team chat header */}
            <div className="relative bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg border border-neutral-200 dark:border-neutral-800 rounded-xl">
                {onBack && (
                     <button onClick={onBack} aria-label="Back" className="absolute top-2 left-2 w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors">
                        <i className="fa-solid fa-arrow-left text-lg"></i>
                    </button>
                )}
                {/* Inner padding for the content. */}
                <div className="px-4 py-4">

                    {/* Avatar & Main Info section */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-end sm:space-x-5 pt-4">
                      <div className="flex-shrink-0 -mt-20 sm:-mt-20"> {/* Negative margin to pull avatar up */}
                        <img
                          className="h-32 w-32 sm:h-40 sm:w-40 rounded-full object-cover ring-4 ring-white dark:ring-black"
                          src={user.avatarUrl}
                          alt={user.name}
                        />
                      </div>
                      <div className="mt-4 sm:mt-0 flex-grow flex flex-col sm:flex-row justify-between items-center w-full pb-4">
                        {/* User's name and bio */}
                        <div className="text-center sm:text-left">
                          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{user.name}</h1>
                          {user.bio && <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-lg mt-1">{user.bio}</p>}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-2 mt-4 sm:mt-0">
                          {isOwnProfile ? (
                              <button onClick={() => onNavigate('settings')} className="flex items-center justify-center bg-neutral-200 dark:bg-[#3A3B3C] text-neutral-800 dark:text-neutral-200 px-4 py-2 rounded-lg font-semibold hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">
                                  <i className="fa-solid fa-pen-to-square mr-2"></i> Edit Profile
                              </button>
                          ) : (
                            isFollowing ? (
                              <button
                                  onClick={() => onToggleFollow(user.id)}
                                  onMouseEnter={() => setIsHoveringFollow(true)}
                                  onMouseLeave={() => setIsHoveringFollow(false)}
                                  className="w-32 flex items-center justify-center bg-violet-100 text-accent dark:bg-[#3A3B3C] dark:text-neutral-200 border border-accent px-4 py-2 rounded-lg font-semibold hover:bg-red-100 hover:text-red-600 hover:border-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500 dark:hover:border-red-500 transition-colors"
                              >
                                  <i className={`fa-solid ${isHoveringFollow ? 'fa-user-minus' : 'fa-user-check'} mr-2`}></i>
                                  <span>{isHoveringFollow ? 'Unfollow' : 'Following'}</span>
                              </button>
                            ) : (
                              <button
                                  onClick={() => onToggleFollow(user.id)}
                                  className="w-32 flex items-center justify-center bg-accent text-accent-text-over px-4 py-2 rounded-lg font-semibold hover:bg-accent-hover transition-colors"
                              >
                                  <i className="fa-solid fa-user-plus mr-2"></i> Follow
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Divider line. */}
                    <hr className="border-neutral-200/50 dark:border-neutral-800/50 mt-2" />

                    {/* Profile navigation and stats */}
                    <div className="flex justify-between items-center">
                        {/* Profile navigation tabs */}
                        <nav className="flex space-x-2 sm:space-x-4 lg:hidden">
                            <NavButton tabName="posts">Posts</NavButton>
                            <NavButton tabName="about">About</NavButton>
                        </nav>
                        {/* Stats section */}
                        <div className="w-full flex justify-center lg:justify-end space-x-4 sm:space-x-8 text-center py-2">
                            <div>
                                <span className="font-bold text-lg">{postsCount}</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400"> Posts</span>
                            </div>
                            <div>
                                <span className="font-bold text-lg">{(user.followersCount || 0).toLocaleString()}</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400"> Followers</span>
                            </div>
                            <div>
                                <span className="font-bold text-lg">{(user.followingCount || 0).toLocaleString()}</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400"> Following</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// Export the ProfileHeader component.
export default ProfileHeader;