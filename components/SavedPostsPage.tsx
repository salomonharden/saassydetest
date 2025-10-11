// Import React and necessary types.
import React from 'react';
import { PostData, User, ReactionType } from '../types';
import Post from './Post';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the SavedPostsPage component.
interface SavedPostsPageProps {
    savedPosts: PostData[];
    currentUser: User;
    allUsers: { [key: string]: User };
    onSelectPost: (postId: number) => void;
    onReactToPost: (postId: number, reaction: ReactionType | null) => void;
    onViewProfile: (user: User) => void;
    onApplyToTeam: (postId: number) => void;
    onManageTeam: (postId: number) => void;
    onDeletePost: (postId: number) => void;
    onToggleSave: (postId: number) => void;
    savedPostIds: Set<number>;
    onTagClick: (tag: string) => void;
}

// The SavedPostsPage functional component.
const SavedPostsPage: React.FC<SavedPostsPageProps> = ({
    savedPosts,
    currentUser,
    allUsers,
    onSelectPost,
    onReactToPost,
    onViewProfile,
    onApplyToTeam,
    onManageTeam,
    onDeletePost,
    onToggleSave,
    savedPostIds,
    onTagClick
}) => {
    // Use the i18n hook to get the translation function.
    const { t } = useI18n();
    return (
        // Main container for the Saved Posts page.
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6 space-y-4">
            {/* Page header with a back button and title. */}
            <div className="px-4 md:px-0 animate-fade-in-slide-up">
                <div className="relative flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Saved Posts</h1>
                </div>
            </div>

            {/* Conditional rendering based on whether there are saved posts. */}
            {savedPosts.length > 0 ? (
                // If there are saved posts, map over them and render a Post component for each.
                savedPosts.map((post, index) => (
                    <div key={post.id} className="animate-fade-in-slide-up" style={{ animationDelay: `${100 + index * 100}ms` }}>
                        <Post
                            post={post}
                            onSelectPost={onSelectPost}
                            onReactToPost={onReactToPost}
                            onViewProfile={onViewProfile}
                            allUsers={allUsers}
                            currentUser={currentUser}
                            onApplyToTeam={onApplyToTeam}
                            onManageTeam={onManageTeam}
                            onDeletePost={onDeletePost}
                            onToggleSave={onToggleSave}
                            isSaved={savedPostIds.has(post.id)}
                            onTagClick={onTagClick}
                        />
                    </div>
                ))
            ) : (
                // If there are no saved posts, display a message.
                <div className="text-center py-10 bg-white dark:bg-[#242526] rounded-lg shadow-md mt-6 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
                    <i className="fa-solid fa-bookmark text-4xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                    <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">No saved posts</h3>
                    <p className="text-neutral-500 dark:text-neutral-400">You can save posts to find them easily later.</p>
                </div>
            )}
        </div>
    );
};

export default SavedPostsPage;