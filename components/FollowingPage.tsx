// Import React and the useState hook.
import React, { useState } from 'react';
// Import the User type definition.
import { User } from '../types';
import { useI18n } from '../App';

// Define the props interface for the user card component.
interface FollowingUserCardProps {
    user: User; // The user data to display in the card.
    onToggleFollow: (userId: string) => void; // Function to handle the unfollow action.
    onViewProfile: (user: User) => void; // Function to navigate to the user's profile.
}

// A reusable component for displaying a single user in the "Following" list.
const FollowingUserCard: React.FC<FollowingUserCardProps> = ({ user, onToggleFollow, onViewProfile }) => {
    // State to track if the mouse is hovering over the "Following" button to change its text.
    const [isHovering, setIsHovering] = useState(false);
    const { t } = useI18n();

    return (
        // The main card container.
        <div className="bg-white dark:bg-black rounded-lg shadow-md p-4 flex items-center justify-between space-x-4">
            {/* Clickable area for user info, which navigates to their profile. */}
            <button onClick={() => onViewProfile(user)} className="flex items-center space-x-4 flex-grow min-w-0 group">
                {/* User's avatar. */}
                <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full flex-shrink-0 group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-accent dark:group-hover:ring-offset-black transition-all" />
                {/* User's name and bio. */}
                <div className="text-left min-w-0">
                    <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:underline">{user.name}</p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.bio || 'No bio available.'}</p>
                </div>
            </button>
            {/* The "Following" / "Unfollow" button. */}
            <button
                onClick={() => onToggleFollow(user.id)}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="flex-shrink-0 w-32 flex items-center justify-center bg-violet-100 text-accent dark:bg-[#3A3B3C] dark:text-neutral-200 border border-accent px-3 py-2 rounded-lg font-semibold hover:bg-red-100 hover:text-red-600 hover:border-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-500 dark:hover:border-red-500 transition-colors text-sm"
                aria-label={`Unfollow ${user.name}`}
            >
                {/* The icon and text change on hover. */}
                <i className={`fa-solid ${isHovering ? 'fa-user-minus' : 'fa-user-check'} mr-2`}></i>
                <span>{isHovering ? t('followingPage.unfollow') : t('followingPage.following')}</span>
            </button>
        </div>
    );
};


// Define the props interface for the main page component.
interface FollowingPageProps {
    users: User[]; // The array of users that the current user is following.
    onToggleFollow: (userId: string) => void; // Function to handle unfollowing.
    onViewProfile: (user: User) => void; // Function to navigate to a user's profile.
}

// The FollowingPage functional component.
const FollowingPage: React.FC<FollowingPageProps> = ({ users, onToggleFollow, onViewProfile }) => {
    const { t } = useI18n();
    return (
        // The main container for the page.
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-4 py-6">
            {/* The page title. */}
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>{t('followingPage.title')}</h1>

            {/* The container for the list of user cards. */}
            <div className="space-y-4">
                {/* Conditional rendering based on whether the user is following anyone. */}
                {users.length > 0 ? (
                    // If they are, map over the users array and render a card for each one.
                    users.map((user, index) => (
                        <div key={user.id} className="animate-fade-in-slide-up" style={{ animationDelay: `${200 + index * 100}ms` }}>
                            <FollowingUserCard 
                                user={user} 
                                onToggleFollow={onToggleFollow} 
                                onViewProfile={onViewProfile} 
                            />
                        </div>
                    ))
                ) : (
                    // If not, display a message indicating they aren't following anyone.
                    <div className="text-center py-10 bg-white dark:bg-black rounded-lg shadow-md animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
                        <i className="fa-solid fa-user-group text-4xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                        <p className="text-neutral-500 dark:text-neutral-400">{t('followingPage.noFollowing')}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export the FollowingPage component.
export default FollowingPage;