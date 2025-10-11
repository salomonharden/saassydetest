// Import React library.
import React from 'react';
// Import necessary type definitions.
import { Notification, User } from '../types';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the NotificationsPage component.
interface NotificationsPageProps {
    notifications: Notification[]; // An array of notification objects to display.
    allUsers: { [key: string]: User }; // A map of all users to look up actor details.
    onNotificationClick: (notification: Notification) => void; // Function to handle clicking on a notification.
}

// The NotificationsPage functional component.
const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, allUsers, onNotificationClick }) => {
    // Use the i18n hook to get the translation function.
    const { t } = useI18n();

    // A helper function to generate the descriptive text for a notification.
    const formatNotificationText = (notification: Notification): string => {
        const actor = allUsers[notification.actorId]; // Look up the user who performed the action.
        if (!actor) return 'A notification from a user.'; // Fallback text if the user isn't found.

        // Return different text based on the notification type.
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
    
    // Return the JSX for the notifications page.
    return (
        // Main container for the page.
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-4 py-6">
            {/* The page title. */}
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">Notifications</h1>

            {/* The container for the list of notifications. */}
            <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md">
                {/* Conditional rendering based on whether there are any notifications. */}
                {notifications.length > 0 ? (
                    <ul>
                        {/* Map over the notifications array to render each one as a list item. */}
                        {notifications.map((notification, index) => {
                            const actor = allUsers[notification.actorId]; // Look up the actor.
                            if (!actor) return null; // Don't render if the actor is not found.
                            return (
                                <li key={notification.id} className={index > 0 ? 'border-t border-neutral-200 dark:border-neutral-600' : ''}>
                                {/* Each notification is a clickable button. */}
                                <button 
                                    onClick={() => onNotificationClick(notification)}
                                    className={`w-full text-left flex items-start p-4 space-x-4 transition-colors ${!notification.read ? 'bg-violet-50 dark:bg-violet-900/30' : ''} hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]`}
                                >
                                    {/* Actor's avatar. */}
                                    <img src={actor.avatarUrl} alt={actor.name} className="w-12 h-12 rounded-full flex-shrink-0"/>
                                    {/* Notification text content. */}
                                    <div className="flex-grow">
                                    <p className="text-sm">
                                        <span className="font-bold">{actor.name}</span> {formatNotificationText(notification)}
                                    </p>
                                    <p className="text-xs text-[#a452fd] font-semibold mt-1">{notification.timestamp}</p>
                                    </div>
                                    {/* The blue dot indicator for unread notifications. */}
                                    {!notification.read && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>}
                                </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    // Message to display when there are no notifications.
                    <div className="text-center py-10">
                        <i className="fa-solid fa-bell-slash text-4xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                        <p className="text-neutral-500 dark:text-neutral-400">You don't have any notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export the NotificationsPage component.
export default NotificationsPage;