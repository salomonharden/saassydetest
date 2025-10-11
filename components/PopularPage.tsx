// Import React hooks and type definitions.
import React, { useMemo } from 'react';
import { PostData, User, ReactionType, reactionWeights } from '../types';
import Post from './Post';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the PopularPage component.
interface PopularPageProps {
    allPosts: PostData[];
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

// The PopularPage functional component.
const PopularPage: React.FC<PopularPageProps> = ({ 
    allPosts, 
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
    
    // useMemo hook to calculate and sort popular posts. This calculation only re-runs if `allPosts` changes.
    const popularPosts = useMemo(() => {
        return [...allPosts]
            .map(post => {
                // Calculate a popularity score for each post.
                // Corrected: Add generic type argument to reduce for correct type inference of the accumulator.
                const totalReactionsScore = (Object.entries(post.reactions || {}) as [ReactionType, number][])
                    .reduce<number>((sum, [reaction, count]) => sum + (count * (reactionWeights[reaction] || 0)), 0);

                const totalComments = post.commentsData?.length || 0;
                const score = totalReactionsScore + (totalComments * 2);
                return { ...post, score };
            })
            // Sort posts in descending order based on the score.
            .sort((a, b) => b.score - a.score);
    }, [allPosts]);

    return (
        // Main container for the Popular page.
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6 space-y-4">
            {/* Page header with a back button and title. */}
            <div className="px-4 md:px-0 animate-fade-in-slide-up">
                <div className="relative flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Popular Ideas</h1>
                </div>
            </div>

            {/* Render the list of popular posts. */}
            {popularPosts.length > 0 ? (
                popularPosts.map((post, index) => (
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
                // Message to display if there are no posts.
                <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-8 text-center text-neutral-500 dark:text-neutral-400 animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
                    <p>No posts available to display.</p>
                </div>
            )}
        </div>
    );
};

export default PopularPage;