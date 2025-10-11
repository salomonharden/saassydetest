// Import React and the useMemo hook for performance optimization.
import React, { useMemo } from 'react';
// Import shared type definitions for User, Page, and PostData.
import { User, Page, PostData, ReactionType, reactionWeights } from '../types';
// Import child components.
import ProfileIntro from './ProfileIntro';
import WhoToFollow from './WhoToFollow';

// Define the props interface for the SidebarUser component.
interface SidebarUserProps {
  user: User; // The user to display.
  isOnline?: boolean; // Optional flag for online status.
  onClick: (user: User) => void; // Click handler to view the user's profile.
}

// A reusable component to display a user in the sidebar.
const SidebarUser: React.FC<SidebarUserProps> = ({ user, isOnline = false, onClick }) => (
  <button onClick={() => onClick(user)} className="w-full flex items-center p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-[#3A3B3C] transition-colors duration-200 relative text-left">
    {/* User's avatar. */}
    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full mr-3" />
    {/* User's name. */}
    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</span>
    {/* Online status indicator dot. */}
    {isOnline && (
      <div className="absolute left-8 bottom-2 w-3 h-3 bg-green-500 rounded-full border-2 border-neutral-100 dark:border-[#18191A]"></div>
    )}
  </button>
);

// Define the props interface for the SidebarTeam component.
interface SidebarTeamProps {
  post: PostData; // The post that represents the team.
  onClick: (postId: number) => void; // Click handler to view the team's post.
}

// A reusable component to display a team in the sidebar.
const SidebarTeam: React.FC<SidebarTeamProps> = ({ post, onClick }) => (
  <button onClick={() => onClick(post.id)} className="w-full flex items-center p-2 rounded-lg hover:bg-neutral-200 dark:hover:bg-[#3A3B3C] transition-colors duration-200 text-left">
    {/* Team icon. */}
    <div className="w-8 h-8 rounded-md mr-3 bg-violet-200 dark:bg-violet-900/50 flex items-center justify-center flex-shrink-0">
        <i className="fa-solid fa-briefcase text-accent"></i>
    </div>
    {/* Team details. */}
    <div className="min-w-0">
        {/* Team/Post title. */}
        <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">{post.idea.title}</p>
        {/* Member count. */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{(post.teamMembers?.length || 0) + 1} members</p>
    </div>
  </button>
);

// A new component to display the team members list specifically for the chat page.
const TeamMembersSidebar: React.FC<{ post: PostData; allUsers: { [key: string]: User }; onViewProfile: (user: User) => void; }> = ({ post, allUsers, onViewProfile }) => {
    const teamMembers = useMemo(() => {
        const author = allUsers[post.authorId];
        const members = post.teamMembers?.map(id => allUsers[id]).filter((u): u is User => !!u) || [];
        const all = author ? [author, ...members.filter(m => m.id !== author.id)] : members;
        // Deduplicate
        return all.filter((user, index, self) => self.findIndex(u => u.id === user.id) === index);
    }, [post, allUsers]);
    
    // Simulating online status for some members
    const onlineUserIds = useMemo(() => {
        const onlineIds = new Set<string>();
        teamMembers.forEach(member => {
            if (Math.random() > 0.4) onlineIds.add(member.id);
        });
        return onlineIds;
    }, [teamMembers]);

    return (
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-4">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Team Members ({teamMembers.length})</h2>
            <nav className="flex flex-col space-y-1">
                {teamMembers.map(member => (
                    <SidebarUser
                        key={member.id}
                        user={member}
                        isOnline={onlineUserIds.has(member.id)}
                        onClick={onViewProfile}
                    />
                ))}
            </nav>
        </div>
    );
};


// Define the props interface for the RightSidebar component.
interface RightSidebarProps {
  onViewProfile: (user: User) => void; // Function to navigate to a user's profile.
  currentPage: Page; // The current page of the app.
  profileUser: User | null; // The user whose profile is being viewed, if any.
  following: User[]; // A list of users the current user is following.
  posts: PostData[]; // All visible posts, used for recommendations.
  onSelectPost: (postId: number) => void; // Function to navigate to a post's detail view.
  currentUser: User; // The currently logged-in user.
  users: { [key: string]: User };
  onToggleFollow: (userId: string) => void;
  suggestedUsers: User[];
  selectedPost: PostData | null;
  onUpdateUser: (updatedUser: User) => void;
}

// The RightSidebar component.
const RightSidebar: React.FC<RightSidebarProps> = ({ 
    onViewProfile, 
    currentPage, 
    profileUser, 
    following, 
    posts, 
    onSelectPost, 
    currentUser,
    users,
    onToggleFollow,
    suggestedUsers,
    selectedPost,
    onUpdateUser,
}) => {
  
  // useMemo hook to calculate recommended teams. This calculation only re-runs if `posts` or `currentUser` changes.
  const recommendedTeams = useMemo(() => {
    // A set of common "stop words" to ignore when extracting keywords.
    const stopWords = new Set(['a', 'an', 'the', 'is', 'are', 'in', 'on', 'for', 'to', 'of', 'it', 'and', 'or', 'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those']);

    // Helper function to extract meaningful keywords from a text string.
    const getKeywords = (text: string | undefined): Set<string> => {
        if (!text) return new Set(); // Return empty set if no text.
        return new Set(
            text
                .toLowerCase() // Convert to lowercase.
                .split(/[\s,.;:!?()]+/) // Split by spaces and punctuation.
                .map(word => word.replace(/[^a-z0-9]/g, '')) // Remove non-alphanumeric characters.
                .filter(word => word.length > 2 && !stopWords.has(word)) // Filter out short words and stop words.
        );
    };

    // A set to store all keywords related to the current user's interests.
    const userInterestKeywords = new Set<string>();

    // Helper function to process a post and add its keywords to the user's interests.
    const processPostForKeywords = (post: PostData) => {
        const postText = [ // Combine all relevant text fields from the post.
            post.idea.title, 
            post.idea.description, 
            post.idea.problem, 
            post.idea.solution,
            post.idea.targetAudience,
            post.idea.monetization
        ].filter(Boolean).join(' ');
        // Add the extracted keywords to the main interest set.
        getKeywords(postText).forEach(kw => userInterestKeywords.add(kw));
    };

    // Iterate over all posts to build the user's interest profile.
    posts.forEach(p => {
        const isCreated = p.authorId === currentUser.id; // Did the user create this post?
        const isLiked = !!p.currentUserReaction; // Did the user react to this post?
        const isMember = p.teamMembers?.includes(currentUser.id); // Is the user a member of this team?
        // If any of these are true, the post is relevant to the user's interests.
        if (isCreated || isLiked || isMember) {
            processPostForKeywords(p);
        }
    });

    // Find candidate teams for recommendation.
    const candidateTeams = posts
        // Filter for posts that are teams, not authored by the user, and not already joined.
        .filter(p => 
            p.showJoinTeamButton && 
            p.authorId !== currentUser.id && 
            !p.teamMembers?.includes(currentUser.id)
        )
        // Map each candidate post to an object with a relevance score.
        .map(p => {
            // Get all text from the candidate team post.
            const teamText = [p.idea.title, p.idea.description, p.idea.problem, p.idea.solution, p.idea.targetAudience, p.idea.monetization].filter(Boolean).join(' ');
            const teamKeywords = getKeywords(teamText); // Extract keywords.
            
            let score = 0; // Initialize relevance score.
            // Increase score for each keyword that matches the user's interests.
            teamKeywords.forEach(kw => {
                if (userInterestKeywords.has(kw)) {
                    score++;
                }
            });

            // Calculate a popularity score based on reactions and team size.
            // Corrected: Add generic type argument to reduce for correct type inference of the accumulator.
            const totalReactionsScore = (Object.entries(p.reactions || {}) as [ReactionType, number][])
                .reduce<number>((sum, [reaction, count]) => sum + (count * (reactionWeights[reaction] || 0)), 0);
            const popularity = totalReactionsScore + (p.teamMembers?.length || 0) * 5;

            return { post: p, score, popularity }; // Return the post with its calculated scores.
        });

    // Sort the candidate teams first by relevance score, then by popularity.
    candidateTeams.sort((a, b) => {
        if (b.score !== a.score) {
            return b.score - a.score; // Higher score first.
        }
        return b.popularity - a.popularity; // Higher popularity first.
    });

    // Return just the sorted post objects.
    return candidateTeams.map(item => item.post);

  }, [posts, currentUser]);

  // Function to render the default content of the sidebar (teams and following list).
  const renderHomeContent = () => (
    <>
      <WhoToFollow 
        users={suggestedUsers} 
        onViewProfile={onViewProfile} 
        onToggleFollow={onToggleFollow} 
      />
      {/* Recommended Teams section. */}
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Discover Teams</h2>
        <nav className="flex flex-col space-y-1">
          {recommendedTeams.length > 0 ? (
            // Display the top 5 recommended teams.
            recommendedTeams.slice(0, 5).map(post => (
              <SidebarTeam key={post.id} post={post} onClick={onSelectPost} />
            ))
          ) : (
            // Show a message if there are no recommendations.
            <p className="p-2 text-sm text-neutral-500 dark:text-neutral-400">No new teams to recommend right now.</p>
          )}
        </nav>
      </div>
      
      <hr className="my-4 border-transparent" />

      {/* Following section. */}
      <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-4">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Following</h2>
          <nav className="flex flex-col space-y-1">
            {following.length > 0 ? (
                // Display the list of users the current user is following.
                following.map(item => (
                    <SidebarUser key={item.id} user={item} onClick={onViewProfile} />
                ))
            ) : (
                // Show a message if the user isn't following anyone.
                <p className="p-2 text-sm text-neutral-500 dark:text-neutral-400">You are not following anyone yet.</p>
            )}
          </nav>
      </div>
    </>
  );

  const renderContent = () => {
    if (currentPage === 'teamChat' && selectedPost) {
        return <TeamMembersSidebar post={selectedPost} allUsers={users} onViewProfile={onViewProfile} />;
    }
    if (currentPage === 'profile' && profileUser) {
        return <ProfileIntro user={profileUser} currentUser={currentUser} onUpdateUser={onUpdateUser} />;
    }
    return renderHomeContent();
  }

  // Return the main aside element for the sidebar.
  return (
    // The sidebar is hidden on smaller screens and becomes a sticky column on extra-large screens.
    <aside 
        className="hidden lg:block w-80 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto animate-slide-in-right"
        style={{ animationDelay: '200ms' }}
    >
      {renderContent()}
    </aside>
  );
};

// Export the RightSidebar component.
export default RightSidebar;