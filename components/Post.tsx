// Import React hooks and type definitions.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PostData, User, ReactionType, reactionIcons, reactionLabels, reactionColors } from '../types';
import { useI18n } from '../App';

// Define the props interface for the Post component.
interface PostProps {
  post: PostData;
  isDetailView?: boolean;
  onSelectPost?: (postId: number) => void;
  onReactToPost: (postId: number, reaction: ReactionType | null) => void;
  onViewProfile: (user: User) => void;
  allUsers: { [key: string]: User };
  currentUser: User;
  onApplyToTeam: (postId: number) => void;
  onManageTeam: (postId: number) => void;
  onDeletePost: (postId: number) => void;
  onToggleSave: (postId: number) => void;
  isSaved: boolean;
  onTagClick: (tag: string) => void;
}

// A reusable component for action buttons in the post footer.
const PostActionButton: React.FC<{
  icon: string;
  label: string;
  onClick: () => void;
  isActive?: boolean;
  activeColor?: string;
  className?: string;
}> = ({ icon, label, onClick, isActive, activeColor, className }) => (
  <button 
    onClick={onClick}
    className={`flex-1 flex items-center justify-center p-2 rounded-lg transition-colors duration-200 text-sm font-semibold ${isActive ? `${activeColor || 'text-accent'}` : 'text-neutral-600 dark:text-neutral-300'} hover:bg-neutral-100 dark:hover:bg-[#3A3B3C] ${className}`}
  >
    <i className={`fa-solid ${icon} mr-2`}></i>
    <span>{label}</span>
  </button>
);

// The main Post component.
const Post: React.FC<PostProps> = ({ 
    post, 
    isDetailView = false, 
    onSelectPost, 
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
}) => {
  const { t } = useI18n();
  const author = allUsers[post.authorId];
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const [isPaletteVisible, setIsPaletteVisible] = useState(false);
  const paletteTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (paletteTimerRef.current) {
        clearTimeout(paletteTimerRef.current);
    }
    setIsPaletteVisible(true);
  };

  const handleMouseLeave = () => {
    paletteTimerRef.current = setTimeout(() => {
        setIsPaletteVisible(false);
    }, 300); // 300ms delay to allow moving to palette
  };

  const handleReactionClick = (reaction: ReactionType) => {
    const newReaction = post.currentUserReaction === reaction ? null : reaction;
    onReactToPost(post.id, newReaction);
    setIsPaletteVisible(false); // Hide palette immediately after selection
    if (paletteTimerRef.current) {
        clearTimeout(paletteTimerRef.current);
    }
  };


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!author) return null; // Don't render if author is not found.

  // FIX: Added generic type argument to reduce for correct type inference and handle potentially undefined counts.
  const totalReactions = Object.values(post.reactions || {}).reduce<number>((sum, count) => sum + (count || 0), 0);
  const totalComments = post.commentsData?.length || 0;
  const isAuthor = post.authorId === currentUser.id;
  const isTeamMember = post.teamMembers?.includes(currentUser.id) || isAuthor;
  const hasApplied = post.teamApplicants?.some(app => app.applicantId === currentUser.id);

  const sortedReactions = useMemo(() => {
    return (Object.entries(post.reactions || {}) as [ReactionType, number][])
        .filter(([, count]) => count > 0)
        .sort(([, countA], [, countB]) => countB - countA);
  }, [post.reactions]);

  const handlePostClick = () => {
    if (!isDetailView && onSelectPost) {
      onSelectPost(post.id);
    }
  };

  const renderTeamButton = () => {
    if (!post.showJoinTeamButton) return null;

    if (isAuthor) {
      return <PostActionButton icon="fa-users-gear" label={t('post.manageTeam')} onClick={() => onManageTeam(post.id)} />;
    }
    if (isTeamMember) {
      return <PostActionButton icon="fa-users" label={t('post.teamMember')} onClick={() => {}} className="cursor-default !text-green-500" />;
    }
    if (hasApplied) {
      return <PostActionButton icon="fa-hourglass-half" label={t('post.applicationSent')} onClick={() => {}} className="cursor-default !text-yellow-500" />;
    }
    return <PostActionButton icon="fa-user-plus" label={t('post.apply')} onClick={() => onApplyToTeam(post.id)} />;
  };

  return (
    <div className="bg-white dark:bg-black rounded-none lg:rounded-lg shadow-md w-full">
      <div className="p-4">
        {/* Post Header */}
        <div className="flex items-start justify-between">
            <div className="flex items-center mb-2">
                <button onClick={() => onViewProfile(author)} className="flex-shrink-0">
                    <img src={author.avatarUrl} alt={author.name} className="w-10 h-10 rounded-full mr-3" />
                </button>
                <div className="flex-grow">
                    <button onClick={() => onViewProfile(author)} className="font-bold hover:underline">{author.name}</button>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{post.timestamp}</p>
                </div>
            </div>
            <div className="relative" ref={menuRef}>
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                    <i className="fa-solid fa-ellipsis-h text-neutral-500 dark:text-neutral-400"></i>
                </button>
                {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-md shadow-lg z-10">
                        <button onClick={() => { onToggleSave(post.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                            <i className={`fa-solid ${isSaved ? 'fa-bookmark-slash' : 'fa-bookmark'} w-6 mr-2`}></i> {isSaved ? t('post.unsave') : t('post.save')}
                        </button>
                        {post.authorId === currentUser.id && (
                            <button onClick={() => { onDeletePost(post.id); setIsMenuOpen(false); }} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
                                <i className="fa-solid fa-trash-can w-6 mr-2"></i> {t('post.delete')}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>

        {/* Post Body */}
        <div className={`cursor-pointer ${isDetailView ? '' : 'max-h-96 overflow-hidden'}`} onClick={handlePostClick}>
            <h2 className="text-xl font-bold mb-2">{post.idea.title}</h2>
            {post.idea.description && <p className="mb-4 whitespace-pre-wrap">{post.idea.description}</p>}
            
            {(isDetailView || (!post.idea.description)) && (
                <div className="space-y-4 text-sm border-l-4 border-violet-200 dark:border-violet-900 pl-4 py-2">
                    <div>
                        <h4 className="font-semibold text-neutral-500 dark:text-neutral-400">The Problem</h4>
                        <p>{post.idea.problem}</p>
                    </div>
                    <div>
                        <h4 className="font-semibold text-neutral-500 dark:text-neutral-400">The Solution</h4>
                        <p>{post.idea.solution}</p>
                    </div>
                    {isDetailView && (
                        <>
                            <div>
                                <h4 className="font-semibold text-neutral-500 dark:text-neutral-400">Target Audience</h4>
                                <p>{post.idea.targetAudience}</p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-neutral-500 dark:text-neutral-400">Monetization</h4>
                                <p>{post.idea.monetization}</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
        
        {/* Post Tags */}
        {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                {post.tags.map(tag => (
                    <button
                        key={tag}
                        onClick={(e) => {
                            e.stopPropagation();
                            onTagClick(tag);
                        }}
                        className="text-accent font-semibold text-sm hover:underline"
                    >
                        #{tag}
                    </button>
                ))}
            </div>
        )}
      </div>
      
      {/* Post Footer */}
      <div className="px-4 pb-1">
        <div className="flex justify-between items-center text-xs text-neutral-500 dark:text-neutral-400 min-h-[1rem]">
            {totalReactions > 0 && (
                isAuthor ? (
                    <div className="flex items-center space-x-3 flex-wrap gap-y-1">
                        {sortedReactions.map(([reaction, count]) => (
                            <div key={reaction} className="flex items-center space-x-1" title={reactionLabels[reaction]}>
                                <i className={`fa-solid ${reactionIcons[reaction]} ${reactionColors[reaction].text}`}></i>
                                <span className="font-medium">{count}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <div className="flex -space-x-1.5">
                            {sortedReactions.slice(0, 3).map(([reaction]) => (
                                <div key={reaction} title={reactionLabels[reaction]} className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[9px] ${reactionColors[reaction].bg} ring-1 ring-white dark:ring-black`}>
                                   <i className={`fa-solid ${reactionIcons[reaction]}`}></i>
                                </div>
                            ))}
                        </div>
                        <span>{totalReactions.toLocaleString()} reactions</span>
                    </div>
                )
            )}
            <div className="flex space-x-4 ml-auto pl-2">
                {totalComments > 0 && <span>{totalComments.toLocaleString()} comments</span>}
            </div>
        </div>
        
        <hr className="border-neutral-200 dark:border-neutral-800 my-2" />

        <div className="flex justify-around">
            <div
                className="relative flex-1"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <PostActionButton 
                    icon={post.currentUserReaction ? reactionIcons[post.currentUserReaction] : 'fa-thumbs-up'} 
                    label={post.currentUserReaction ? reactionLabels[post.currentUserReaction] : t('post.like')} 
                    onClick={() => onReactToPost(post.id, post.currentUserReaction ? null : 'like')}
                    isActive={!!post.currentUserReaction}
                    activeColor={post.currentUserReaction ? reactionColors[post.currentUserReaction].text : undefined}
                />
                <div className={`absolute bottom-full mb-2 w-full flex justify-center transition-opacity duration-200 ${isPaletteVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                    <div className="bg-white dark:bg-[#3A3B3C] rounded-full shadow-lg flex p-1 space-x-1">
                        {Object.keys(reactionIcons).map(key => (
                            <button
                                key={key}
                                onClick={() => handleReactionClick(key as ReactionType)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl transition-transform hover:scale-125 ${reactionColors[key as ReactionType].text}`}
                                aria-label={`React with ${reactionLabels[key as ReactionType]}`}
                            >
                                <i className={`fa-solid ${reactionIcons[key as ReactionType]}`}></i>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
            <PostActionButton icon="fa-comment" label={t('post.comment')} onClick={handlePostClick} />
            {renderTeamButton()}
        </div>
      </div>
    </div>
  );
};

export default Post;