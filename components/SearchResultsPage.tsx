// Import React and necessary types.
import React from 'react';
import { SearchResults, User, PostData, ReactionType } from '../types';
import Post from './Post';

// Define the props interface for the SearchResultsPage component.
interface SearchResultsPageProps {
  results: SearchResults;
  onViewProfile: (user: User) => void;
  onSelectPost: (postId: number) => void;
  onReactToPost: (postId: number, reaction: ReactionType | null) => void;
  onApplyToTeam: (postId: number) => void;
  onManageTeam: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  allUsers: { [key: string]: User };
  currentUser: User;
  onToggleSave: (postId: number) => void;
  savedPostIds: Set<number>;
  onTagClick: (tag: string) => void;
}

// A reusable component for displaying a user card in search results.
const UserCard: React.FC<{ user: User; onViewProfile: (user: User) => void }> = ({ user, onViewProfile }) => (
    <div className="bg-white dark:bg-[#242526] p-3 rounded-lg shadow-md flex items-center justify-between">
        <button onClick={() => onViewProfile(user)} className="flex items-center space-x-3 group text-left min-w-0">
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="min-w-0">
                <p className="font-bold group-hover:underline truncate">{user.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.bio || 'SaaS Enthusiast'}</p>
            </div>
        </button>
    </div>
);

// The SearchResultsPage component definition.
const SearchResultsPage: React.FC<SearchResultsPageProps> = ({
    results,
    onViewProfile,
    onSelectPost,
    onReactToPost,
    onApplyToTeam,
    onManageTeam,
    onDeletePost,
    allUsers,
    currentUser,
    onToggleSave,
    savedPostIds,
    onTagClick,
}) => {
    return (
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-4 px-4 md:px-0">Search Results</h1>

                {/* Display user results if any are found. */}
                {results.users.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold mb-3 px-4 md:px-0">Users</h2>
                        <div className="space-y-3 px-4 md:px-0">
                            {results.users.map(user => <UserCard key={user.id} user={user} onViewProfile={onViewProfile} />)}
                        </div>
                    </div>
                )}

                {/* Display post results if any are found. */}
                {results.posts.length > 0 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-3 px-4 md:px-0">Posts</h2>
                        <div className="space-y-4">
                            {results.posts.map(post => (
                                <Post
                                    key={post.id}
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
                            ))}
                        </div>
                    </div>
                )}

                {/* Display a message if no results are found. */}
                {results.users.length === 0 && results.posts.length === 0 && (
                    <div className="text-center py-10 bg-white dark:bg-[#242526] rounded-lg shadow-md mx-4 md:mx-0">
                         <i className="fa-solid fa-search text-4xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                        <p className="text-neutral-500 dark:text-neutral-400">No results found.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export the component as the default export.
export default SearchResultsPage;