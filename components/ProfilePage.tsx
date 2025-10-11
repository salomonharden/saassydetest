// Import React hooks and type definitions.
import React, { useState } from 'react';
import { PostData, User, ReactionType, Page } from '../types';

// Import child components.
import ProfileHeader from './ProfileHeader';
import ProfileIntro from './ProfileIntro';
import Post from './Post';
import CreatePost from './CreatePost';

// Define the props interface for the ProfilePage component.
interface ProfilePageProps {
  user: User;
  currentUser: User;
  posts: PostData[];
  onSelectPost: (postId: number) => void;
  onReactToPost: (postId: number, reaction: ReactionType | null) => void;
  onViewProfile: (user: User) => void;
  allUsers: { [key: string]: User };
  onApplyToTeam: (postId: number) => void;
  onManageTeam: (postId: number) => void;
  isFollowing: boolean;
  onToggleFollow: (userId: string) => void;
  onCreatePostClick: () => void;
  onDeletePost: (postId: number) => void;
  onToggleSave: (postId: number) => void;
  savedPostIds: Set<number>;
  onTagClick: (tag: string) => void;
  onNavigate: (page: Page) => void;
  onUpdateUser: (updatedUser: User) => void;
  onBack: () => void;
}

// The ProfilePage functional component.
const ProfilePage: React.FC<ProfilePageProps> = ({ 
    user, 
    currentUser, 
    posts, 
    onSelectPost, 
    onReactToPost, 
    onViewProfile, 
    allUsers, 
    onApplyToTeam,
    onManageTeam,
    isFollowing,
    onToggleFollow,
    onCreatePostClick,
    onDeletePost,
    onToggleSave,
    savedPostIds,
    onTagClick,
    onNavigate,
    onUpdateUser,
    onBack
}) => {
  // State to manage the active tab ('posts' or 'about') on smaller screens.
  const [activeTab, setActiveTab] = useState<'posts' | 'about'>('posts');
  const isOwnProfile = user.id === currentUser.id;

  // This user object is passed to the header to ensure counts are always accurate.
  const userForHeader: User = {
    ...user,
    // The followersCount is managed in App state, which is correct.
    // The followingCount should be derived from the length of the 'following' array.
    followingCount: user.following?.length || 0,
  };


  // Function to render the main content of the profile page (posts or about section).
  const renderContent = () => {
    // On large screens, the "About" info is in the right sidebar, so we always show posts here.
    // On smaller screens, we switch based on the active tab.
    if (activeTab === 'about') {
      return (
        <div className="p-4 lg:hidden animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
          <ProfileIntro user={user} currentUser={currentUser} onUpdateUser={onUpdateUser} />
        </div>
      );
    }
    
    // Render the user's posts.
    return (
      <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6 space-y-4">
        {isOwnProfile && (
          <div className="animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
            <CreatePost onOpenModal={onCreatePostClick} currentUser={currentUser} />
          </div>
        )}
        {posts.length > 0 ? posts.map((post, index) => (
          <div key={post.id} className="animate-fade-in-slide-up" style={{ animationDelay: `${300 + index * 100}ms` }}>
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
        )) : (
            <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-8 text-center text-neutral-500 dark:text-neutral-400 animate-fade-in-slide-up" style={{ animationDelay: '300ms' }}>
              <i className="fa-solid fa-pen-ruler text-4xl mb-4"></i>
              <h3 className="font-semibold text-lg">No Posts Yet</h3>
              <p>{user.name} hasn't shared any ideas yet.</p>
            </div>
        )}
      </div>
    );
  };

  return (
    // Main container for the profile page.
    <div className="flex-grow w-full">
      <ProfileHeader 
        user={userForHeader}
        currentUser={currentUser}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isFollowing={isFollowing}
        onToggleFollow={onToggleFollow}
        postsCount={posts.length}
        onNavigate={onNavigate}
        onBack={onBack}
      />
      {/* Render the content based on the active tab. */}
      {renderContent()}
    </div>
  );
};

export default ProfilePage;