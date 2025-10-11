// Import React hooks and type definitions.
import React, { useState } from 'react';
import { Comment as CommentType, User } from '../types';

// Define the props interface for the Comment component.
interface CommentProps {
  comment: CommentType; // The comment data to display.
  onReplySubmit: (parentId: number, content: string) => void; // Function to submit a reply to this comment.
  onLikeComment: (commentId: number) => void; // Function to like/unlike this comment.
  currentUser: User; // The currently logged-in user.
  onViewProfile: (user: User) => void; // Function to navigate to a user's profile.
  allUsers: { [key: string]: User }; // A map of all users to look up author details.
}

// The Comment functional component, which can be rendered recursively for replies.
const Comment: React.FC<CommentProps> = ({ comment, onReplySubmit, onLikeComment, currentUser, onViewProfile, allUsers }) => {
  // State to track if the user is currently replying to this comment.
  const [isReplying, setIsReplying] = useState(false);
  // State to hold the content of the new reply being written.
  const [replyContent, setReplyContent] = useState('');
  
  // Check if the comment has replies.
  const hasReplies = comment.replies && comment.replies.length > 0;
  // State to track if the replies section is collapsed or expanded. Initially collapsed if there are replies.
  const [isCollapsed, setIsCollapsed] = useState(hasReplies);
  
  // Look up the author of the comment.
  const author = allUsers[comment.authorId];

  // If the author is not found, do not render the comment to avoid errors.
  if (!author) return null;

  // Handler for submitting a new reply.
  const handleReply = () => {
    if (replyContent.trim()) { // Check if the reply content is not empty.
      onReplySubmit(comment.id, replyContent.trim()); // Call the parent handler.
      setReplyContent(''); // Clear the input field.
      setIsReplying(false); // Hide the reply input field.
    }
  };
  
  // Handler for key presses in the reply textarea.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit the reply on 'Enter' key press, but not if 'Shift' is also pressed.
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent default behavior.
        handleReply(); // Call the reply handler.
    }
  };

  // The JSX for a single comment.
  return (
    <div>
      {/* The main comment content. */}
      <div className="flex space-x-2">
        {/* The author's avatar, clickable to view their profile. */}
        <button onClick={() => onViewProfile(author)} className="flex-shrink-0 group block" aria-label={`View profile of ${author.name}`}>
          <img src={author.avatarUrl} alt={author.name} className="w-8 h-8 rounded-full group-hover:ring-2 group-hover:ring-offset-2 group-hover:ring-accent dark:group-hover:ring-offset-[#242526] transition-all" />
        </button>
        {/* Container for the comment text and actions. */}
        <div className="flex-grow">
          {/* The styled "bubble" for the comment. */}
          <div className="bg-neutral-100 dark:bg-[#3A3B3C] rounded-xl px-3 py-2 inline-block relative">
            {/* The author's name, clickable to view their profile. */}
            <button onClick={() => onViewProfile(author)} className="hover:underline" aria-label={`View profile of ${author.name}`}>
              <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100">{author.name}</p>
            </button>
            {/* The comment's text content. */}
            <p className="text-neutral-800 dark:text-neutral-200 text-sm whitespace-pre-wrap">{comment.content}</p>
            {/* Like count indicator, rendered conditionally. */}
            {comment.likes > 0 && (
              <div className="absolute -bottom-3 -right-3 bg-white dark:bg-neutral-600 rounded-full px-2 py-0.5 flex items-center space-x-1 text-xs shadow-md">
                <i className="fa-solid fa-thumbs-up text-accent"></i>
                <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{comment.likes}</span>
              </div>
            )}
          </div>
          {/* Action links below the comment bubble (Like, Reply). */}
          <div className="flex space-x-4 text-xs text-neutral-500 dark:text-neutral-400 mt-1 pl-3 items-center">
            <button 
                className={`hover:underline font-semibold ${comment.liked ? 'text-accent' : ''}`}
                onClick={() => onLikeComment(comment.id)}
            >
                Like
            </button>
            <button className="hover:underline" onClick={() => setIsReplying(!isReplying)}>Reply</button>
          </div>
        </div>
      </div>

      {/* The expand/collapse button for replies, rendered conditionally. */}
      {hasReplies && (
        <div className="pl-10 mt-2">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)} 
                className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300 font-semibold text-xs hover:underline"
                aria-expanded={!isCollapsed}
                aria-controls={`replies-for-${comment.id}`}
              >
                {/* Chevron icon indicating expanded/collapsed state. */}
                <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-600 group-hover:bg-neutral-300 dark:group-hover:bg-neutral-500 flex items-center justify-center transition-colors">
                  <i className={`fa-solid ${isCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'} text-xs`}></i>
                </div>
                {/* The text for the button. */}
                <span>
                  {isCollapsed 
                    ? `${comment.replies.length} ${comment.replies.length > 1 ? 'replies' : 'reply'}`
                    : 'Hide replies'
                  }
                </span>
            </button>
        </div>
      )}


      {/* The input field for replying, rendered conditionally. */}
      {isReplying && (
        <div className="flex items-start space-x-2 mt-2 pl-10">
          {/* The current user's avatar next to the input field. */}
          <img src={currentUser.avatarUrl} alt="Your Avatar" className="w-8 h-8 rounded-full" />
          {/* The auto-resizing textarea for the reply. */}
          <textarea
            rows={1}
            value={replyContent}
            onChange={(e) => {
              setReplyContent(e.target.value);
              // Auto-resize logic.
              e.target.style.height = 'auto';
              e.target.style.height = `${e.target.scrollHeight}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={`Reply to ${author.name}...`}
            className="flex-grow bg-neutral-100 dark:bg-[#3A3B3C] text-neutral-800 dark:text-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
            autoFocus // Automatically focus the input when it appears.
          />
        </div>
      )}

      {/* The container for replies, rendered conditionally if they exist and are not collapsed. */}
      {hasReplies && !isCollapsed && (
        <div id={`replies-for-${comment.id}`} className="pt-4 pl-5 ml-5 border-l-2 border-neutral-300 dark:border-neutral-600 space-y-4">
          {/* Map over the replies array and recursively render the Comment component for each reply. */}
          {comment.replies.map(reply => (
            <Comment key={reply.id} comment={reply} onReplySubmit={onReplySubmit} onLikeComment={onLikeComment} currentUser={currentUser} onViewProfile={onViewProfile} allUsers={allUsers} />
          ))}
        </div>
      )}
    </div>
  );
};

// Export the Comment component.
export default Comment;