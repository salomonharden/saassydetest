// This file exports all the shared TypeScript types for the application.

/**
 * Represents a single comment or reply on a post.
 */
export interface Comment {
  id: number; // Unique identifier for the comment.
  authorId: string; // The ID of the user who wrote the comment.
  content: string; // The text content of the comment.
  replies?: Comment[]; // Optional array of nested replies.
  likes: number; // The number of likes the comment has received.
  liked: boolean; // Indicates if the current user has liked this comment.
}

/**
 * Represents the core SaaS idea within a post.
 */
export interface Idea {
  title: string; // The main title or elevator pitch of the idea.
  description?: string; // An optional general description or thought process.
  problem: string; // The problem the SaaS idea aims to solve.
  solution: string; // The proposed solution.
  targetAudience: string; // The ideal customer profile.
  monetization: string; // The strategy for generating revenue.
}

/**
 * Represents an application submitted by a user to join a team.
 */
export interface Application {
  applicantId: string; // The ID of the user who applied.
  answers: { question: string; answer: string }[]; // The applicant's answers to the team's questions.
}

/**
 * Represents a single message within a team chat.
 * The timestamp should be an ISO 8601 string for accurate sorting and grouping.
 */
export interface Message {
    id: number;
    senderId: string;
    timestamp: string; // ISO 8601 date string
    text?: string;
    reactions?: { [emoji: string]: string[] }; // e.g., { '👍': ['userId1', 'userId2'] }
    isEdited?: boolean;
}

/**
 * Defines the possible types of reactions a user can have to a post.
 */
export type ReactionType = 'like' | 'love' | 'insightful' | 'buildit' | 'fire' | 'dislike' | 'dontbuildit' | 'confused';

/**
 * Maps each reaction type to its corresponding Font Awesome icon class.
 */
export const reactionIcons: { [key in ReactionType]: string } = {
    like: 'fa-thumbs-up',
    love: 'fa-heart',
    insightful: 'fa-lightbulb',
    buildit: 'fa-rocket',
    fire: 'fa-fire',
    dislike: 'fa-thumbs-down',
    dontbuildit: 'fa-ban',
    confused: 'fa-question-circle',
};

/**
 * Maps each reaction type to its corresponding Tailwind CSS color classes.
 */
export const reactionColors: { [key in ReactionType]: { text: string, bg?: string } } = {
    like: { text: 'text-blue-500', bg: 'bg-blue-500' },
    love: { text: 'text-red-500', bg: 'bg-red-500' },
    insightful: { text: 'text-yellow-400', bg: 'bg-yellow-400' },
    buildit: { text: 'text-purple-500', bg: 'bg-purple-500' },
    fire: { text: 'text-orange-500', bg: 'bg-orange-500' },
    dislike: { text: 'text-neutral-500', bg: 'bg-neutral-500' },
    dontbuildit: { text: 'text-red-700', bg: 'bg-red-700' },
    confused: { text: 'text-amber-500', bg: 'bg-amber-500' },
};

/**
 * Maps each reaction type to its display-friendly label.
 */
export const reactionLabels: { [key in ReactionType]: string } = {
    like: 'Like',
    love: 'Love',
    insightful: 'Insightful',
    buildit: 'Build It!',
    fire: 'Fire',
    dislike: 'Dislike',
    dontbuildit: "Don't Build It",
    confused: 'Confused',
};

/**
 * Defines the scoring weight for each reaction type.
 */
export const reactionWeights: { [key in ReactionType]: number } = {
    like: 1,
    love: 1.2,
    insightful: 1.5,
    buildit: 2,
    fire: 2,
    dislike: -1,
    dontbuildit: -2,
    confused: 0,
};

/**
 * Represents a single post in the feed.
 */
export interface PostData {
  id: number; // Unique identifier for the post.
  authorId: string; // The ID of the user who created the post.
  timestamp: string; // A display-friendly timestamp (e.g., "8h ago").
  idea: Idea; // The core SaaS idea details.
  tags?: string[]; // Optional array of hashtags for the post.
  reactions: { [key in ReactionType]?: number }; // A map of reaction types to their counts.
  currentUserReaction: ReactionType | null; // The reaction the current user has made, if any.
  commentsData?: Comment[]; // An optional array of top-level comments on the post.
  showJoinTeamButton: boolean; // Flag to determine if the "Join Team" button should be shown.
  applicationQuestions?: string[]; // Optional list of questions for team applicants.
  teamApplicants?: Application[]; // Optional list of users who have applied to the team.
  teamMembers?: string[]; // Optional list of user IDs who are part of the team.
  chat?: Message[]; // Optional array of messages for the team chat.
  discordLink?: string; // Optional link to the team's Discord server.
}

/**
 * Represents a single portfolio item for a user profile.
 */
export interface PortfolioItem {
  title: string; // The display title for the link.
  url: string; // The URL of the portfolio item.
}

/**
 * Represents a user profile.
 */
export interface User {
  id: string; // Unique identifier for the user.
  name: string; // The user's full name.
  avatarUrl: string; // The URL for the user's profile picture.
  bio?: string; // A short user biography.
  location?: string; // The user's location.
  education?: string; // The user's educational background.
  relationshipStatus?: string; // The user's relationship status.
  postsCount?: number; // The total number of posts by the user.
  followersCount?: number; // The number of followers the user has.
  followingCount?: number; // The number of users this user is following.
  skills?: string[]; // An array of the user's skills.
  portfolio?: PortfolioItem[]; // An array of links to the user's work.
  following?: string[]; // An array of user IDs that this user follows.
  isPersona?: boolean; // Flag to identify if the user is an AI-driven persona.
  onboardingCompleted?: boolean; // Flag to check if the user has completed the onboarding flow.
  interests?: string[]; // An array of topics the user is interested in.
}

/**
 * Defines the possible main pages in the application for navigation.
 */
export type Page = 'home' | 'profile' | 'following' | 'teams' | 'notifications' | 'popular' | 'teamChat' | 'saved' | 'postDetail' | 'settings' | 'admin';

/**
 * Defines the possible sorting options for the main feed.
 */
export type FeedSortType = 'hot' | 'new' | 'top' | 'following';

/**
 * Represents a single notification for the user.
 */
export interface Notification {
    id: number; // Unique identifier for the notification.
    recipientId: string; // The ID of the user who should receive the notification.
    type: 'like' | 'comment' | 'follow' | 'team_accept' | 'team_apply'; // The type of event that triggered the notification.
    actorId: string; // The ID of the user who performed the action.
    postId?: number; // The ID of the relevant post, if applicable.
    timestamp: string; // A display-friendly timestamp for the notification.
    read: boolean; // A flag indicating if the notification has been read by the user.
}

/**
 * Represents the structure of search results, containing both users and posts.
 */
export interface SearchResults {
    users: User[]; // An array of user profiles matching the search query.
    posts: PostData[]; // An array of posts matching the search query.
}

/**
 * Represents a single data point for the analytics dashboard.
 */
export interface AnalyticsData {
    isoDate: string; // e.g., "2023-10-27"
    displayDate: string; // e.g., "Oct 27"
    dau: number;
    wau: number;
    mau: number;
    signups: number;
    screenViews: {
        home: number;
        profile: number;
        postDetail: number;
        teams: number;
        notifications: number;
    };
    buttonClicks: {
        react: number;
        comment: number;
        applyToTeam: number;
        follow: number;
        savePost: number;
    };
}

/**
 * Represents a user cohort for retention analysis.
 */
export interface Cohort {
    week: string; // e.g., "Nov 13 - Nov 19"
    newUsers: number;
    retention: (number | null)[]; // Array of weekly retention percentages.
}


/**
 * Defines the type of user feedback.
 */
export type FeedbackType = 'bug' | 'feature' | 'general';

/**
 * Defines the status of a feedback item.
 */
export type FeedbackStatus = 'new' | 'inProgress' | 'resolved';

/**
 * Represents a single user feedback submission.
 */
export interface Feedback {
    id: number;
    userId: string;
    text: string;
    type: FeedbackType;
    status: FeedbackStatus;
    timestamp: string; // ISO 8601 date string
}