// Import React hooks and type definitions.
import React, { useState, useRef } from 'react';
import { PostData, Comment as CommentType, User, ReactionType } from '../types';
// Import child components.
import Post from './Post';
import Comment from './Comment';
import { useI18n } from '../App';

// Define the props interface for the PostDetailPage component.
interface PostDetailPageProps {
  post: PostData; // The post data to display in detail.
  onAddComment: (postId: number, content: string) => void;
  onAddReply: (postId: number, parentId: number, content: string) => void;
  onLikeComment: (postId: number, commentId: number) => void;
  onReactToPost: (postId: number, reaction: ReactionType | null) => void; // Function to handle reactions.
  onViewProfile: (user: User) => void; // Function to navigate to a user's profile.
  allUsers: { [key: string]: User }; // A map of all users to look up author details.
  currentUser: User; // The currently logged-in user.
  onApplyToTeam: (postId: number) => void; // Function to handle applying to the team.
  onManageTeam: (postId: number) => void; // Function to handle managing the team.
  onDeletePost: (postId: number) => void;
  onToggleSave: (postId: number) => void;
  isSaved: boolean;
  onTagClick: (tag: string) => void;
  onBack: () => void;
}

// The PostDetailPage functional component.
const PostDetailPage: React.FC<PostDetailPageProps> = ({ 
    post, 
    onAddComment,
    onAddReply,
    onLikeComment,
    onReactToPost, 
    onViewProfile, 
    allUsers, 
    currentUser, 
    onApplyToTeam, 
    onManageTeam,
    onDeletePost,
    onToggleSave,
    isSaved,
    onTagClick,
    onBack
}) => {
  const { t } = useI18n();
  // State to hold the content of the new top-level comment being written.
  const [newComment, setNewComment] = useState('');
  // Ref to the comment input textarea for focusing and resizing.
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  // Get the comments for the post, or an empty array if none exist.
  const comments = post.commentsData || [];

  // Handler for submitting a new top-level comment.
  const handleTopLevelCommentSubmit = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on 'Enter' key press, but not if 'Shift' is also pressed (for new lines).
    if (e.key === 'Enter' && !e.shiftKey && newComment.trim() !== '') {
      e.preventDefault(); // Prevent default 'Enter' behavior (like adding a new line).
      onAddComment(post.id, newComment.trim());
      // Clear the comment input field.
      setNewComment('');
      // Reset the height of the textarea.
      if (commentInputRef.current) {
        commentInputRef.current.style.height = 'auto';
      }
    }
  };

  // The JSX for the post detail page.
  return (
    // Main container for the detail page.
    <div className="flex-grow w-full lg:max-w-2xl mx-auto px-0 md:px-4 py-6">
       <div className="px-4 md:px-0 mb-4 animate-fade-in-slide-up">
            <div className="relative flex items-center justify-center">
                <button onClick={onBack} aria-label="Back" className="absolute left-0 w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] transition-colors">
                    <i className="fa-solid fa-arrow-left text-lg"></i>
                </button>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Post</h1>
            </div>
        </div>
      {/* Render the post itself using the Post component in detail view mode. */}
      <div className="animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
        <Post 
          post={post} 
          isDetailView={true} 
          onReactToPost={onReactToPost} 
          onViewProfile={onViewProfile} 
          allUsers={allUsers} 
          currentUser={currentUser} 
          onApplyToTeam={onApplyToTeam} 
          onManageTeam={onManageTeam}
          onDeletePost={onDeletePost}
          onToggleSave={onToggleSave}
          isSaved={isSaved}
          onTagClick={onTagClick}
        />
      </div>

      {/* Comment section container. */}
      <div className="bg-white dark:bg-[#242526] rounded-none lg:rounded-b-lg shadow-md p-4 animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
        {/* The new comment input area. */}
        <div className="flex items-start space-x-2 mb-4">
            {/* Current user's avatar. */}
            <img src={currentUser.avatarUrl} alt="Your Avatar" className="w-8 h-8 rounded-full" />
            {/* The auto-resizing textarea for writing a new comment. */}
            <textarea
              ref={commentInputRef}
              rows={1}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value);
                // Auto-resize logic: reset height, then set to scrollHeight.
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={handleTopLevelCommentSubmit}
              placeholder="Write a comment..."
              className="flex-grow bg-neutral-100 dark:bg-[#3A3B3C] text-neutral-800 dark:text-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
              aria-label="Write a comment"
            />
        </div>

        <hr className="border-neutral-200 dark:border-neutral-600 my-4" />

        {/* The list of existing comments. */}
        <div className="space-y-4">
          {/* Map over the comments array and render a Comment component for each. */}
          {comments.map((comment) => (
            <Comment 
                key={comment.id} 
                comment={comment} 
                onReplySubmit={(parentId, content) => onAddReply(post.id, parentId, content)}
                onLikeComment={(commentId) => onLikeComment(post.id, commentId)}
                currentUser={currentUser}
                onViewProfile={onViewProfile}
                allUsers={allUsers}
            />
          ))}
          {/* Display a message if there are no comments. */}
          {comments.length === 0 && (
            <p className="text-neutral-500 dark:text-neutral-400 text-center py-4">Be the first to comment.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Export the PostDetailPage component.
export default PostDetailPage;