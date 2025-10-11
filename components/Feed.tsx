// Import React and necessary types.
import React from 'react';
import { PostData, User, ReactionType, FeedSortType } from '../types';

// Import child components.
import Post from './Post';
import CreatePost from './CreatePost';
import PostSkeleton from './PostSkeleton';
import FeedSorter from './FeedSorter';
import WhoToFollowCarousel from './WhoToFollowCarousel';

// Define the props interface for the Feed component.
interface FeedProps {
  posts: PostData[];
  onSelectPost: (postId: number) => void;
  onReactToPost: (postId: number, reaction: ReactionType | null) => void;
  onViewProfile: (user: User) => void;
  allUsers: { [key: string]: User };
  currentUser: User;
  onCreatePostClick: () => void;
  onApplyToTeam: (postId: number) => void;
  onManageTeam: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  onToggleSave: (postId: number) => void;
  savedPostIds: Set<number>;
  onTagClick: (tag: string) => void;
  isLoading?: boolean;
  feedSortType?: FeedSortType;
  onSortChange?: (sortType: FeedSortType) => void;
  suggestedUsers?: User[];
  onToggleFollow?: (userId: string) => void;
}

// The Feed functional component.
const Feed: React.FC<FeedProps> = ({ 
    posts, 
    onSelectPost, 
    onReactToPost, 
    onViewProfile, 
    allUsers, 
    currentUser, 
    onCreatePostClick,
    onApplyToTeam,
    onManageTeam,
    onDeletePost,
    onToggleSave,
    savedPostIds,
    onTagClick,
    isLoading = false,
    feedSortType,
    onSortChange,
    suggestedUsers,
    onToggleFollow,
}) => {
  return (
    // Main container for the feed content.
    <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6 space-y-4">
      {/* The trigger component to open the "Create Post" modal. */}
      <div className="animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}>
        <CreatePost onOpenModal={onCreatePostClick} currentUser={currentUser} />
      </div>

      {/* Render the feed sorter only if the props are provided (i.e., on the home feed). */}
      {feedSortType && onSortChange && (
          <div className="animate-fade-in-slide-up" style={{ animationDelay: '350ms' }}>
              <FeedSorter currentSort={feedSortType} onSortChange={onSortChange} />
          </div>
      )}
      
      {/* Conditional rendering for loading state. */}
      {isLoading ? (
        // Show skeleton loaders while content is loading.
        <>
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </>
      ) : (
        // Render the list of posts when not loading.
        posts.map((post, index) => (
         <React.Fragment key={post.id}>
            {/* Inject the WhoToFollowCarousel after the 3rd post on the home feed */}
            {index === 3 && suggestedUsers && onToggleFollow && (
              <div className="md:hidden animate-fade-in-slide-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
                  <WhoToFollowCarousel users={suggestedUsers} onViewProfile={onViewProfile} onToggleFollow={onToggleFollow} />
              </div>
            )}
            <div className="animate-fade-in-slide-up" style={{ animationDelay: `${400 + index * 100}ms` }}>
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
          </React.Fragment>
        ))
      )}
       {/* Message to display if there are no posts and it's not loading. */}
       {!isLoading && posts.length === 0 && (
         <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-8 text-center text-neutral-500 dark:text-neutral-400 animate-fade-in-slide-up" style={{ animationDelay: '500ms' }}>
           <i className="fa-solid fa-stream text-4xl mb-4"></i>
           <h3 className="font-semibold text-lg">Your feed is empty</h3>
           <p>Posts from people you follow will appear here.</p>
         </div>
       )}
    </div>
  );
};

// Export the Feed component.
export default Feed;