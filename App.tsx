// Import React hooks and types.
import React, { useState, useEffect, useMemo, useRef, createContext, useContext } from 'react';
import { PostData, User, Page, Comment as CommentType, Idea, ReactionType, Application, Notification, SearchResults, Message, FeedSortType, AnalyticsData, Cohort, Feedback, FeedbackStatus, FeedbackType, reactionWeights } from './types';
import { GoogleGenAI, Type } from "@google/genai";
// FIX: Changed to a type-only import for Session to resolve potential module resolution errors with older Supabase versions.
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';

// Import mock data.
import { allPosts as initialPosts, users as initialUsers, allNotifications as initialNotifications, allFeedback as initialFeedback } from './data';

// Import all components.
import Header from './components/Header';
import LeftSidebar from './components/LeftSidebar';
import RightSidebar from './components/RightSidebar';
import Feed from './components/Feed';
import FeedHeader from './components/FeedHeader';
import ProfilePage from './components/ProfilePage';
import PostDetailPage from './components/PostDetailPage';
import FollowingPage from './components/FollowingPage';
import TeamsPage from './components/TeamsPage';
import NotificationsPage from './components/NotificationsPage';
import PopularPage from './components/PopularPage';
import TeamChatPage from './components/TeamChatPage';
import SavedPostsPage from './components/SavedPostsPage';
import SearchResultsPage from './components/SearchResultsPage';
import SettingsPage from './components/SettingsPage';
import AdminPage from './components/AdminPage';
import { CreatePostModal } from './components/CreatePost';
import FeedbackModal from './components/FeedbackCard';
import ApplyToTeamModal from './components/ApplyToTeamModal';
import ManageTeamModal from './components/ManageTeamModal';
import DeleteConfirmationModal from './components/DeleteConfirmationModal';
import BottomNav from './components/BottomNav';
import AuthPage from './components/AuthPage';
import LoadingSpinner from './components/LoadingSpinner';
import OnboardingPage from './components/OnboardingPage';


// --- I18N (INTERNATIONALIZATION) SETUP ---

// 1. Translation Data
const translationsData = {
  en: {
    header: {
      searchPlaceholder: "Search SaasSyde",
      createPost: "Create post",
      notifications: "Notifications",
      noNotifications: "No new notifications.",
      profile: "Profile",
      settings: "Settings",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      logout: "Log Out",
    },
    sidebar: {
      feeds: "Feeds",
      home: "Home",
      popular: "Popular",
      saved: "Saved",
      notifications: "Notifications",
      following: "Following",
      teams: "Teams",
      admin: "Admin",
      dashboard: "Dashboard",
      account: "Account",
      settings: "Settings",
    },
    post: {
      like: "Like",
      comment: "Comment",
      apply: "Apply to Join",
      manageTeam: "Manage Team",
      teamMember: "Team Member",
      applicationSent: "Application Sent",
      save: "Save Post",
      unsave: "Unsave Post",
      delete: "Delete Post",
    },
    feedSorter: {
      hot: "Hot",
      new: "New",
      top: "Top",
      following: "Following"
    },
    bottomNav: {
      home: "Home",
      popular: "Popular",
      notifications: "Notifications",
      profile: "Profile",
    },
    followingPage: {
      title: "Following",
      unfollow: "Unfollow",
      following: "Following",
      noFollowing: "You aren't following anyone yet."
    },
  },
  es: {
    header: {
      searchPlaceholder: "Buscar en SaasSyde",
      createPost: "Crear publicación",
      notifications: "Notificaciones",
      noNotifications: "No hay notificaciones nuevas.",
      profile: "Perfil",
      settings: "Ajustes",
      lightMode: "Modo Claro",
      darkMode: "Modo Oscuro",
      logout: "Cerrar Sesión",
    },
    sidebar: {
      feeds: "Fuentes",
      home: "Inicio",
      popular: "Popular",
      saved: "Guardados",
      notifications: "Notificaciones",
      following: "Siguiendo",
      teams: "Equipos",
      admin: "Admin",
      dashboard: "Panel",
      account: "Cuenta",
      settings: "Ajustes",
    },
    post: {
      like: "Me gusta",
      comment: "Comentar",
      apply: "Aplicar para Unirse",
      manageTeam: "Gestionar Equipo",
      // FIX: Renamed keys to match the 'en' translation object shape to resolve TypeScript error.
      teamMember: "Miembro del Equipo",
      applicationSent: "Solicitud Enviada",
      save: "Guardar Post",
      unsave: "No Guardar",
      delete: "Eliminar Post",
    },
    feedSorter: {
      hot: "Popular",
      new: "Nuevo",
      top: "Top",
      following: "Siguiendo"
    },
    bottomNav: {
      home: "Inicio",
      popular: "Popular",
      notifications: "Notificaciones",
      profile: "Perfil",
    },
    followingPage: {
      title: "Siguiendo",
      unfollow: "Dejar de seguir",
      following: "Siguiendo",
      noFollowing: "Aún no sigues a nadie."
    },
  }
};

type Language = keyof typeof translationsData;
type Translations = typeof translationsData.en;

// 2. Language Detection
const getInitialLanguage = (): Language => {
    const lang = navigator.language.split('-')[0];
    return lang in translationsData ? (lang as Language) : 'en';
};

// 3. React Context
interface I18nContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// 4. Provider Component
export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
    const [language] = useState<Language>(getInitialLanguage());
    const [translations, setTranslations] = useState<Translations>(translationsData[language]);
    
    // In a real app, you might add a way to change the language with setLanguage
    // and a useEffect to update translations. For now, it's auto-detected.

    const t = (key: string): string => {
        const keys = key.split('.');
        let result: any = translations;
        for (const k of keys) {
            result = result?.[k];
            if (result === undefined) {
                // Fallback to English if translation is missing
                let fallbackResult: any = translationsData.en;
                for (const fk of keys) {
                    fallbackResult = fallbackResult?.[fk];
                    if (fallbackResult === undefined) return key; // return key if not found anywhere
                }
                return fallbackResult as string;
            }
        }
        return result as string;
    };

    const value = { language, setLanguage: () => {}, t };

    return (
        <I18nContext.Provider value={value}>
            {children}
        </I18nContext.Provider>
    );
};

// 5. Custom Hook
export const useI18n = () => {
    const context = useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within an I18nProvider');
    }
    return context;
};

// --- END I18N SETUP ---


// Define the available theme colors.
const themes: { [key: string]: { accent: string; hover: string; text: string } } = {
    violet: { accent: '#a452fd', hover: '#8e3ad6', text: '#ffffff' },
    blue: { accent: '#3b82f6', hover: '#2563eb', text: '#ffffff' },
    green: { accent: '#22c55e', hover: '#16a34a', text: '#ffffff' },
    orange: { accent: '#f97316', hover: '#ea580c', text: '#ffffff' },
};

// Define the structure for our parsed route.
interface Route {
    page: Page;
    params: { [key: string]: string | undefined };
}

// The main App component.
const App: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [posts, setPosts] = useState<PostData[]>(initialPosts);
  const [users, setUsers] = useState<{ [key: string]: User }>(initialUsers);
  const [allNotifications, setAllNotifications] = useState<Notification[]>(initialNotifications);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData[]>([]);
  const [retentionData, setRetentionData] = useState<Cohort[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>(initialFeedback);
  
  // The current user is now derived from the active Supabase session.
  const currentUser = session ? users[session.user.id] : null;
  const currentUserId = session?.user.id || '';
  const [isOnboarding, setIsOnboarding] = useState(false);


  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (localStorage.theme) return localStorage.theme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [themeColor, setThemeColor] = useState<string>(() => localStorage.getItem('themeColor') || 'violet');

  const [route, setRoute] = useState<Route>({ page: 'home', params: {} });
  const [searchQuery, setSearchQuery] = useState('');
  const [savedPostIds, setSavedPostIds] = useState<Set<number>>(new Set([2, 5]));
  const [feedSortType, setFeedSortType] = useState<FeedSortType>('hot');
  const [isFeedHeaderVisible, setIsFeedHeaderVisible] = useState(true);
  const feedHeaderRef = useRef<HTMLDivElement>(null);
  const [generatingPostPersonaId, setGeneratingPostPersonaId] = useState<string | null>(null);

  // State for managing modals.
  const [modalState, setModalState] = useState<{
    createPost?: boolean;
    applyToTeam?: number | null;
    manageTeam?: number | null;
    deletePost?: number | null;
    feedback?: boolean;
  }>({});

  // --- DERIVED STATE FROM ROUTE ---
  const { page: currentPage, params } = route;
  const selectedPostId = params.postId ? parseInt(params.postId, 10) : null;
  const selectedUserId = params.userId || null;


  // --- DERIVED STATE ---
  const selectedPost = useMemo(() => posts.find(p => p.id === selectedPostId) || null, [posts, selectedPostId]);
  const profileUser = useMemo(() => (selectedUserId ? users[selectedUserId] : null), [users, selectedUserId]);
  const followingUsers = useMemo(() => currentUser?.following?.map(id => users[id]).filter(Boolean) || [], [currentUser?.following, users]);
  const currentUserNotifications = useMemo(() => {
    return allNotifications
      .filter(n => n.recipientId === currentUserId)
      .sort((a, b) => b.id - a.id);
  }, [allNotifications, currentUserId]);

  const currentUserTeams = useMemo(() => {
    if (!currentUser) return [];
    return posts.filter(p => p.authorId === currentUser.id || p.teamMembers?.includes(currentUser.id));
  }, [posts, currentUser]);

  // --- EFFECTS ---
  // Effect for Supabase Authentication
    useEffect(() => {
        setAuthLoading(true);

        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setAuthLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Effect to create a user profile if one doesn't exist upon login/signup
    useEffect(() => {
        if (session && !users[session.user.id]) {
            const newUserProfile: User = {
                id: session.user.id,
                name: session.user.email?.split('@')[0] || `user-${session.user.id.substring(0, 5)}`,
                avatarUrl: `https://i.pravatar.cc/150?u=${session.user.id}`,
                bio: 'Just joined SaasSyde!', // This default bio signals a new user
                followersCount: 0,
                followingCount: 0,
                following: [],
                postsCount: 0,
                onboardingCompleted: false, // New flag for onboarding
            };
            setUsers(prevUsers => ({
                ...prevUsers,
                [session.user.id]: newUserProfile,
            }));
            // Trigger the onboarding flow for the new user
            setIsOnboarding(true);
        } else if (session && users[session.user.id] && !users[session.user.id].onboardingCompleted) {
            // Also trigger for existing users who haven't completed it
            setIsOnboarding(true);
        } else {
            setIsOnboarding(false);
        }
    }, [session, users]);

  // Effect for URL routing.
  useEffect(() => {
    const parseHash = (): Route => {
        const hash = window.location.hash.replace(/^#\/?/, '');
        if (!hash) return { page: 'home', params: {} };
        
        const segments = hash.split('/');
        const page = segments[0];

        switch(page) {
            case 'home':
                return { page: 'home', params: {} };
            case 'profile':
                return { page: 'profile', params: { userId: segments[1] } };
            case 'post':
                return { page: 'postDetail', params: { postId: segments[1] } };
            case 'team':
                if (segments[1] && segments[2] === 'chat') {
                    return { page: 'teamChat', params: { postId: segments[1] } };
                }
                break;
            case 'following':
            case 'teams':
            case 'notifications':
            case 'popular':
            case 'saved':
            case 'settings':
            case 'admin':
                return { page: page as Page, params: {} };
        }
        return { page: 'home', params: {} }; // Default/fallback
    };

    const handleHashChange = () => {
      if (window.location.hash === '' || window.location.hash === '#') {
          window.location.hash = '/home';
          return; // The event will fire again with the new hash.
      }
      const newRoute = parseHash();
      setRoute(newRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial load

    return () => {
        window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Effect to apply the dark mode class to the html element.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  
  // Effect to apply the selected theme color.
  useEffect(() => {
    const root = document.documentElement;
    const theme = themes[themeColor];
    if (theme) {
        root.style.setProperty('--color-accent', theme.accent);
        root.style.setProperty('--color-accent-hover', theme.hover);
        root.style.setProperty('--color-accent-text-over', theme.text);
        localStorage.setItem('themeColor', themeColor);
    }
  }, [themeColor]);
  
  // Effect to observe the feed header for the dynamic main header.
  useEffect(() => {
    const observer = new IntersectionObserver(
        ([entry]) => {
            setIsFeedHeaderVisible(entry.isIntersecting);
        },
        { rootMargin: '-64px 0px 0px 0px', threshold: 0.1 } // Use rootMargin to account for fixed header height
    );

    const currentRef = feedHeaderRef.current;
    if (currentRef) {
        observer.observe(currentRef);
    }

    return () => {
        if (currentRef) {
            observer.unobserve(currentRef);
        }
    };
  }, [currentPage]); // Re-evaluate when page changes
  
  // Effect to generate mock analytics data on initial app load.
  useEffect(() => {
      const data: AnalyticsData[] = [];
      const today = new Date();
      let mau = 3000;
      let wau = 800;
      for (let i = (365 * 3) - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const dauFluctuation = (Math.random() - 0.5) * 100;
          const dau = Math.max(200 + dauFluctuation + (Math.sin(i / 10) * 50), 100);
          wau += (dau - wau / 7) / 7 + (Math.random() - 0.5) * 10;
          mau += (dau - mau / 30) / 30 + (Math.random() - 0.5) * 5;
          const signups = Math.floor(Math.random() * 20 + 5 + (dau / 50));
          
          const screenViews = {
              home: Math.floor(dau * (Math.random() * 2 + 4)),
              profile: Math.floor(dau * (Math.random() * 1 + 1)),
              postDetail: Math.floor(dau * (Math.random() * 1.5 + 2)),
              teams: Math.floor(dau * (Math.random() * 0.5 + 0.5)),
              notifications: Math.floor(dau * (Math.random() * 0.5 + 0.5)),
          };
          const totalScreenViews = Object.values(screenViews).reduce((a, b) => a + b, 0);

          const buttonClicks = {
              react: Math.floor(totalScreenViews * (Math.random() * 0.5 + 1)),
              comment: Math.floor(totalScreenViews * (Math.random() * 0.2 + 0.3)),
              applyToTeam: Math.floor(totalScreenViews * (Math.random() * 0.1 + 0.05)),
              follow: Math.floor(totalScreenViews * (Math.random() * 0.3 + 0.2)),
              savePost: Math.floor(totalScreenViews * (Math.random() * 0.2 + 0.1)),
          };

          data.push({
              isoDate: date.toISOString().split('T')[0],
              displayDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              dau: Math.round(dau),
              wau: Math.round(wau),
              mau: Math.round(mau),
              signups,
              screenViews,
              buttonClicks,
          });
      }
      setAnalyticsData(data);

       const generateRetentionData = (): Cohort[] => {
            const cohorts: Cohort[] = [];
            for (let i = 7; i >= 0; i--) {
                const weekStartDate = new Date(today);
                weekStartDate.setDate(today.getDate() - (i * 7) - today.getDay()); // Start on Sunday
                const weekEndDate = new Date(weekStartDate);
                weekEndDate.setDate(weekStartDate.getDate() + 6);
                
                const formatDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

                const newUsers = Math.floor(Math.random() * 200 + 400 - i * 15);
                const retention: (number | null)[] = [100];
                let lastRetention = 100;

                for (let j = 1; j < 8; j++) {
                    if (j > i) {
                        retention.push(null);
                    } else {
                        const dropOff = Math.random() * (20 - j*1.5) + (10 - j);
                        lastRetention = Math.max(0, lastRetention - dropOff);
                        retention.push(parseFloat(lastRetention.toFixed(1)));
                    }
                }

                cohorts.push({
                    week: `${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`,
                    newUsers,
                    retention
                });
            }
            return cohorts;
      };
      setRetentionData(generateRetentionData());

  }, []);


  // Utility function to parse timestamps into hours ago for "hot" sorting.
  const getHoursAgo = (timestamp: string): number => {
    const lowerCaseTimestamp = timestamp.toLowerCase();

    if (lowerCaseTimestamp.includes('just now') || lowerCaseTimestamp.includes('m ago')) {
      return 0.5; // Treat as very recent
    }
    const hoursMatch = lowerCaseTimestamp.match(/(\d+)\s*h ago/);
    if (hoursMatch) {
      return parseInt(hoursMatch[1], 10);
    }
    if (lowerCaseTimestamp.includes('yesterday')) {
      return 24;
    }
    const daysMatch = lowerCaseTimestamp.match(/(\d+)\s*days ago/);
    if (daysMatch) {
      return parseInt(daysMatch[1], 10) * 24;
    }
    const weekMatch = lowerCaseTimestamp.match(/(\d+)\s*weeks? ago/);
    if (weekMatch) {
      return parseInt(weekMatch[1], 10) * 24 * 7;
    }
    if (lowerCaseTimestamp.includes('1 month ago')) {
      return 30 * 24;
    }
    return 30 * 24 * 2; // Default for older posts
  };
  
  const homePosts = useMemo(() => {
    if (!currentUser) return [];
    const getScore = (post: PostData) => {
        const totalReactions = (Object.entries(post.reactions || {}) as [ReactionType, number][])
            .reduce<number>((sum, [reaction, count]) => sum + (count * (reactionWeights[reaction] || 0)), 0);

        const totalComments = post.commentsData?.length || 0;
        return totalReactions + totalComments * 2;
    };
    
    const hotSortedPosts = [...posts].map(post => {
        const score = getScore(post);
        const hoursAgo = getHoursAgo(post.timestamp);
        const hotScore = score / Math.pow(hoursAgo + 2, 1.5);
        return { ...post, hotScore };
    }).sort((a, b) => b.hotScore - a.hotScore);

    switch (feedSortType) {
        case 'hot':
            return hotSortedPosts;
        case 'new':
            return [...posts].sort((a, b) => b.id - a.id);
        case 'top':
            return [...posts].map(post => ({
                ...post,
                score: getScore(post)
            })).sort((a, b) => b.score - a.score);
        case 'following':
              const followingPosts = posts
                .filter(p => currentUser.following?.includes(p.authorId) || p.authorId === currentUser.id)
                .sort((a, b) => b.id - a.id);
              // Fallback to 'hot' if the user isn't following anyone, to avoid an empty feed.
              return followingPosts.length > 0 ? followingPosts : hotSortedPosts;
        default:
            return posts;
    }
  }, [posts, currentUser, feedSortType]);

  const allSuggestedUsers = useMemo(() => {
    if (!currentUser) return [];
    const currentUserFollowingIds = new Set(currentUser.following || []);
    const scores: { [userId: string]: number } = {};
  
    // Helper to add score safely
    const addScore = (userId: string, points: number) => {
      if (userId !== currentUser.id && !currentUserFollowingIds.has(userId)) {
        scores[userId] = (scores[userId] || 0) + points;
      }
    };
  
    // --- Signal 1: Tag Affinity ---
    const currentUserTagWeights = new Map<string, number>();
    const userInterests = new Set(currentUser.interests || []);
  
    // Boost from onboarding interests
    userInterests.forEach(interest => {
      currentUserTagWeights.set(interest, (currentUserTagWeights.get(interest) || 0) + 5);
    });
  
    for (const post of posts) {
      if (!post.tags || post.tags.length === 0) continue;
  
      let weight = 0;
      if (post.authorId === currentUser.id) weight = 3; // Created
      else if (savedPostIds.has(post.id)) weight = 2; // Saved
      else if (post.currentUserReaction) weight = 1; // Reacted
  
      if (weight > 0) {
        for (const tag of post.tags) {
          currentUserTagWeights.set(tag, (currentUserTagWeights.get(tag) || 0) + weight);
        }
      }
    }
  
    const potentialUsers = Object.values(users).filter(u => u.id !== currentUser.id && !currentUserFollowingIds.has(u.id));
  
    for (const user of potentialUsers) {
      let tagAffinityScore = 0;
      const userPosts = posts.filter(p => p.authorId === user.id);
      for (const post of userPosts) {
        if (post.tags) {
          for (const tag of post.tags) {
            if (currentUserTagWeights.has(tag)) {
              tagAffinityScore += currentUserTagWeights.get(tag)!;
            }
          }
        }
      }
      if (tagAffinityScore > 0) {
        addScore(user.id, tagAffinityScore * 1.5);
      }
    }
  
    // --- Signal 2: Social Proximity & Co-Interactions ---
    const interactionsByPost = new Map<number, Set<string>>();
    for (const post of posts) {
      if (post.currentUserReaction) {
        if (!interactionsByPost.has(post.id)) interactionsByPost.set(post.id, new Set());
        interactionsByPost.get(post.id)!.add(currentUser.id);
        addScore(post.authorId, 2);
      }
      Object.values(users).forEach((user: User) => {
        const tempPost = { ...post, currentUserReaction: null };
        const otherUserReacted = Object.values(post.reactions || {}).reduce<number>((a, b) => a + (b || 0), 0) > (post.currentUserReaction ? 1 : 0);
        if (otherUserReacted && Math.random() > 0.5) {
          if (!interactionsByPost.has(post.id)) interactionsByPost.set(post.id, new Set());
          interactionsByPost.get(post.id)!.add(user.id);
        }
      });
    }
  
    interactionsByPost.forEach(interactors => {
      if (interactors.has(currentUser.id)) {
        interactors.forEach(userId => addScore(userId, 1));
      }
    });
  
    for (const followedUserId of currentUserFollowingIds) {
      const followedUser = users[followedUserId];
      if (followedUser?.following) {
        for (const secondDegreeId of followedUser.following) {
          addScore(secondDegreeId, 1.2);
        }
      }
    }
  
    // --- Signal 3: Team Collaboration ---
    for (const post of posts) {
      const isMember = post.teamMembers?.includes(currentUser.id) || post.authorId === currentUser.id;
      if (isMember) {
        const allTeamMembers = [post.authorId, ...(post.teamMembers || [])];
        for (const memberId of allTeamMembers) {
          addScore(memberId, 5);
        }
      }
    }
  
    // --- Signal 4: Popularity & Activity Boost (Tie-breaker) ---
    Object.keys(scores).forEach(userId => {
      const user = users[userId];
      if (user) {
        const popularityBoost = Math.log10(user.followersCount || 1) * 0.2;
        addScore(userId, popularityBoost);
      }
    });
  
    const sortedUserIds = Object.keys(scores).sort((a, b) => scores[b] - scores[a]);
  
    return sortedUserIds
      .map(id => users[id])
      .filter((u): u is User => !!u);
  }, [posts, users, currentUser, savedPostIds]);

  const suggestedUsersForFeed = useMemo(() => allSuggestedUsers.slice(0, 5), [allSuggestedUsers]);

  // --- NAVIGATION HANDLERS ---
  const handleNavigate = (page: Page, contextId?: string | number) => {
    let path = `/${page}`;
    
    if (page === 'profile' && typeof contextId === 'string') {
        path = `/profile/${contextId}`;
    } else if (page === 'postDetail' && typeof contextId === 'number') {
        path = `/post/${contextId}`;
    } else if (page === 'teamChat' && typeof contextId === 'number') {
        path = `/team/${contextId}/chat`;
    }
    
    if (window.location.hash.substring(1) !== path) {
        window.location.hash = path;
    }
    setSearchQuery('');
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleSelectPost = (postId: number) => handleNavigate('postDetail', postId);
  const handleViewProfile = (user: User) => handleNavigate('profile', user.id);
  
  const handleTagClick = (tag: string) => {
    setSearchQuery(`#${tag}`);
    window.scrollTo(0, 0);
  };

  // --- NOTIFICATION HANDLER ---
  const createAndAddNotification = (recipientId: string, type: Notification['type'], postId?: number) => {
    if (!currentUser || recipientId === currentUser.id) return; // Don't notify self

    const newNotification: Notification = {
        id: Date.now(),
        recipientId,
        type,
        actorId: currentUser.id,
        postId,
        timestamp: 'Just now',
        read: false
    };
    setAllNotifications(prev => [newNotification, ...prev]);
  };


  // --- DATA MUTATION HANDLERS ---
  const handleUpdateUserProfile = (updatedUser: User) => {
    setUsers(prevUsers => ({
      ...prevUsers,
      [updatedUser.id]: updatedUser,
    }));
  };
  
  const handleCompleteOnboarding = (finalUserData: User) => {
      handleUpdateUserProfile({ ...finalUserData, onboardingCompleted: true });
      setIsOnboarding(false);
  };

  const handleReactToPost = (postId: number, reaction: ReactionType | null) => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Only notify on a new, positive reaction.
    if (reaction && post.currentUserReaction !== reaction) {
        createAndAddNotification(post.authorId, 'like', postId);
    }

    setPosts(posts.map(p => {
      if (p.id === postId) {
        const newPost = { ...p, reactions: { ...(p.reactions || {}) } };
        const oldReaction = p.currentUserReaction;

        if (oldReaction && newPost.reactions[oldReaction]) {
          newPost.reactions[oldReaction] = Math.max(0, (newPost.reactions[oldReaction] || 0) - 1);
        }

        newPost.currentUserReaction = reaction;

        if (reaction) {
          newPost.reactions[reaction] = (newPost.reactions[reaction] || 0) + 1;
        }

        return newPost;
      }
      return p;
    }));
  };
  
  const handleCreatePost = (idea: Idea, applicationQuestions: string[], tags: string[], discordLink?: string) => {
    if (!currentUser) return;
    const newPost: PostData = {
        id: Date.now(),
        authorId: currentUser.id,
        timestamp: 'Just now',
        idea: idea,
        tags: tags,
        reactions: {},
        currentUserReaction: null,
        commentsData: [],
        showJoinTeamButton: applicationQuestions.length > 0 || !!discordLink,
        applicationQuestions: applicationQuestions.length > 0 ? applicationQuestions : undefined,
        discordLink: discordLink,
        teamApplicants: [],
        teamMembers: [],
    };
    setPosts([newPost, ...posts]);
    setModalState({});
    handleNavigate('home');
  };

  const handleDeletePost = (postId: number) => {
    setPosts(posts.filter(p => p.id !== postId));
    setModalState({});
    handleNavigate('home');
  };

  const handleToggleFollow = (userId: string) => {
    if (!currentUser) return;
    const isCurrentlyFollowing = currentUser.following?.includes(userId);
    if (!isCurrentlyFollowing) {
        createAndAddNotification(userId, 'follow');
    }
    setUsers(prevUsers => {
      const newUsers = { ...prevUsers };
      const newCurrentUser = { ...newUsers[currentUserId] };
      const targetUser = { ...newUsers[userId] };
  
      if (isCurrentlyFollowing) {
        // Corrected: Explicitly typed the 'id' parameter in the filter callback to avoid 'unknown' type error.
        newCurrentUser.following = newCurrentUser.following?.filter((id: string) => id !== userId);
        targetUser.followersCount = (targetUser.followersCount || 1) - 1;
      } else {
        newCurrentUser.following = [...(newCurrentUser.following || []), userId];
        targetUser.followersCount = (targetUser.followersCount || 0) + 1;
      }
  
      newUsers[currentUserId] = newCurrentUser;
      newUsers[userId] = targetUser;
      return newUsers;
    });
  };

  const handleApplyToTeam = (postId: number, answers: { question: string; answer: string }[]) => {
    if (!currentUser) return;
    const newApplication: Application = { applicantId: currentUser.id, answers };
    const postToUpdate = posts.find(p => p.id === postId);
    if (postToUpdate) {
        const updatedPost = {
            ...postToUpdate,
            teamApplicants: [...(postToUpdate.teamApplicants || []), newApplication]
        };
        setPosts(posts.map(p => p.id === postId ? updatedPost : p));
        createAndAddNotification(updatedPost.authorId, 'team_apply', postId);
    }
    setModalState({});
  };

  const handleManageTeam = (action: 'accept' | 'reject', postId: number, applicantId: string) => {
    const postToUpdate = posts.find(p => p.id === postId);
    if (!postToUpdate) return;

    // FIX: Explicitly typed the 'app' parameter in the filter callback to avoid 'unknown' type error.
    const updatedApplicants = postToUpdate.teamApplicants?.filter((app: Application) => app.applicantId !== applicantId) || [];
    let updatedMembers = postToUpdate.teamMembers || [];

    if (action === 'accept') {
        updatedMembers = [...updatedMembers, applicantId];
        createAndAddNotification(applicantId, 'team_accept', postId);
    }
    
    setPosts(posts.map(p => p.id === postId ? { ...postToUpdate, teamApplicants: updatedApplicants, teamMembers: updatedMembers } : p));
  };
  
  // --- COMMENT & REPLY HANDLERS ---
  const handleAddComment = (postId: number, content: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const newComment: CommentType = {
        id: Date.now(),
        authorId: currentUser.id,
        content: content,
        replies: [],
        likes: 0,
        liked: false,
    };
    const updatedPost = { ...post, commentsData: [...(post.commentsData || []), newComment] };
    setPosts(posts.map(p => (p.id === postId ? updatedPost : p)));
    createAndAddNotification(post.authorId, 'comment', postId);
  };

  const handleAddReply = (postId: number, parentId: number, content: string) => {
    if (!currentUser) return;
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    let parentCommentAuthorId: string | null = null;
    const newReply: CommentType = {
        id: Date.now(),
        authorId: currentUser.id,
        content,
        replies: [],
        likes: 0,
        liked: false,
    };

    const addReplyRecursively = (commentsList: CommentType[]): CommentType[] => {
        return commentsList.map(comment => {
            if (comment.id === parentId) {
                parentCommentAuthorId = comment.authorId;
                return { ...comment, replies: [...(comment.replies || []), newReply] };
            }
            if (comment.replies) {
                return { ...comment, replies: addReplyRecursively(comment.replies) };
            }
            return comment;
        });
    };

    const updatedComments = addReplyRecursively(post.commentsData || []);
    const updatedPost = { ...post, commentsData: updatedComments };
    setPosts(posts.map(p => (p.id === postId ? updatedPost : p)));

    if (parentCommentAuthorId) {
        createAndAddNotification(parentCommentAuthorId, 'comment', postId);
    }
    createAndAddNotification(post.authorId, 'comment', postId);
  };
  
  const handleLikeComment = (postId: number, commentId: number) => {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      const toggleLikeRecursively = (commentsList: CommentType[]): CommentType[] => {
          return commentsList.map(comment => {
              if (comment.id === commentId) {
                  const newLikedStatus = !comment.liked;
                  const newLikesCount = newLikedStatus ? comment.likes + 1 : comment.likes - 1;
                  return { ...comment, liked: newLikedStatus, likes: newLikesCount };
              }
              if (comment.replies) {
                  return { ...comment, replies: toggleLikeRecursively(comment.replies) };
              }
              return comment;
          });
      };
      
      const updatedComments = toggleLikeRecursively(post.commentsData || []);
      setPosts(posts.map(p => p.id === postId ? { ...post, commentsData: updatedComments } : p));
  };


  // --- CHAT HANDLERS ---
  const handleSendMessage = (teamId: number, message: Partial<Message>) => {
      if (!currentUser) return;
      setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === teamId) {
              const newMessage: Message = {
                  id: Date.now(),
                  senderId: currentUser.id,
                  timestamp: new Date().toISOString(),
                  ...message,
              };
              const updatedChat = [...(p.chat || []), newMessage];
              return { ...p, chat: updatedChat };
          }
          return p;
      }));
  };

  const handleDeleteMessage = (teamId: number, messageId: number) => {
      setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === teamId) {
              const updatedChat = p.chat?.filter(m => m.id !== messageId);
              return { ...p, chat: updatedChat };
          }
          return p;
      }));
  };

  const handleEditMessage = (teamId: number, messageId: number, newText: string) => {
      setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === teamId) {
              const updatedChat = p.chat?.map(m => {
                  if (m.id === messageId) {
                      return { ...m, text: newText, isEdited: true };
                  }
                  return m;
              });
              return { ...p, chat: updatedChat };
          }
          return p;
      }));
  };
  
  const handleReactToMessage = (teamId: number, messageId: number, emoji: string) => {
      if (!currentUser) return;
      setPosts(prevPosts => prevPosts.map(p => {
          if (p.id === teamId) {
              const updatedChat = p.chat?.map(m => {
                  if (m.id === messageId) {
                      const newReactions = { ...(m.reactions || {}) };
                      const reactors = newReactions[emoji] || [];
                      if (reactors.includes(currentUser.id)) {
                          newReactions[emoji] = reactors.filter(id => id !== currentUser.id);
                          if (newReactions[emoji].length === 0) {
                              delete newReactions[emoji];
                          }
                      } else {
                          newReactions[emoji] = [...reactors, currentUser.id];
                      }
                      return { ...m, reactions: newReactions };
                  }
                  return m;
              });
              return { ...p, chat: updatedChat };
          }
          return p;
      }));
  };

  // --- FEEDBACK HANDLERS ---
  const handleAddFeedback = (text: string, type: FeedbackType) => {
    if (!currentUser) return;
    const newFeedbackItem: Feedback = {
        id: Date.now(),
        userId: currentUser.id,
        text,
        type: type,
        status: 'new',
        timestamp: new Date().toISOString(),
    };
    setFeedback(prevFeedback => [newFeedbackItem, ...prevFeedback]);
  };

  const handleUpdateFeedbackStatus = (feedbackId: number, newStatus: FeedbackStatus) => {
      setFeedback(prevFeedback => 
          prevFeedback.map(item => 
              item.id === feedbackId ? { ...item, status: newStatus } : item
          )
      );
  };
  
  // --- AI PERSONA HANDLERS ---
  const handleCreatePersona = (personaData: Pick<User, 'name' | 'avatarUrl' | 'bio'>) => {
      const newId = `persona-${Date.now()}`;
      const newPersona: User = {
          ...personaData,
          id: newId,
          isPersona: true,
          followersCount: Math.floor(Math.random() * 20000) + 5000,
          followingCount: Math.floor(Math.random() * 500) + 50,
      };
      setUsers(prev => ({...prev, [newId]: newPersona}));
  };

  const handleGenerateAIPost = async (personaId: string) => {
      const persona = users[personaId];
      if (!persona || !persona.isPersona) return;
      
      setGeneratingPostPersonaId(personaId);

      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        const schema = {
            type: Type.OBJECT,
            properties: {
                idea: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A catchy, descriptive title for the SaaS idea." },
                        description: { type: Type.STRING, description: "A one or two paragraph, engaging description of the SaaS idea." },
                        problem: { type: Type.STRING, description: "The specific problem this SaaS solves." },
                        solution: { type: Type.STRING, description: "How this SaaS solves the problem." },
                        targetAudience: { type: Type.STRING, description: "The ideal customer for this SaaS." },
                        monetization: { type: Type.STRING, description: "The business model (e.g., subscription, freemium)." },
                    },
                },
                tags: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "An array of 4-5 relevant, single-word tags in camelCase."
                },
            },
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Generate a new, creative, and plausible SaaS idea post. The idea should be detailed and well-thought-out.",
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: persona.bio || "You are a tech enthusiast who posts about new SaaS ideas.",
            },
        });
        
        const jsonString = response.text.trim();
        const aiResponse = JSON.parse(jsonString) as { idea: Idea, tags: string[] };

        const newPost: PostData = {
            id: Date.now(),
            authorId: personaId,
            timestamp: 'Just now',
            idea: aiResponse.idea,
            tags: aiResponse.tags,
            reactions: {},
            currentUserReaction: null,
            commentsData: [],
            showJoinTeamButton: Math.random() > 0.4, // Randomly decide if it's a team project
        };

        setPosts(prev => [newPost, ...prev]);

      } catch(error) {
          console.error("Error generating AI post:", error);
          alert("Failed to generate AI post. Please check the console for details.");
      } finally {
          setGeneratingPostPersonaId(null);
      }
  };

  const handleNotificationClick = (notification: Notification) => {
    setAllNotifications(allNotifications.map(n => n.id === notification.id ? { ...n, read: true } : n));
    if (notification.postId) {
        handleSelectPost(notification.postId);
    } else if (notification.type === 'follow') {
        const userToView = users[notification.actorId];
        if (userToView) {
            handleViewProfile(userToView);
        }
    }
  };
  
  const handleToggleSavePost = (postId: number) => {
    setSavedPostIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // --- SEARCH LOGIC ---
  const searchResults: SearchResults | null = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const lowercasedQuery = searchQuery.toLowerCase();
    
    const matchedUsers = Object.values(users).filter(u => u.name.toLowerCase().includes(lowercasedQuery));
    
    let matchedPosts: PostData[];

    if (lowercasedQuery.startsWith('#')) {
        const tagToSearch = lowercasedQuery.substring(1);
        matchedPosts = posts.filter(p => 
            p.tags?.some(tag => tag.toLowerCase() === tagToSearch)
        );
    } else {
        matchedPosts = posts.filter(p => 
            p.idea.title.toLowerCase().includes(lowercasedQuery) ||
            p.idea.description?.toLowerCase().includes(lowercasedQuery) ||
            p.idea.problem.toLowerCase().includes(lowercasedQuery) ||
            p.idea.solution.toLowerCase().includes(lowercasedQuery) ||
            p.tags?.some(tag => tag.toLowerCase().includes(lowercasedQuery))
        );
    }
    
    return { users: matchedUsers, posts: matchedPosts };
  }, [searchQuery, users, posts]);

  // --- RENDER LOGIC ---
  const renderPage = () => {
    if (!currentUser) return null; // Should not happen due to guard clause
    if (searchResults) {
      return <SearchResultsPage 
        results={searchResults}
        onViewProfile={handleViewProfile}
        onSelectPost={handleSelectPost}
        onReactToPost={handleReactToPost}
        onApplyToTeam={(postId) => setModalState({ applyToTeam: postId })}
        onManageTeam={(postId) => setModalState({ manageTeam: postId })}
        onDeletePost={(postId) => setModalState({ deletePost: postId })}
        allUsers={users}
        currentUser={currentUser}
        onToggleSave={handleToggleSavePost}
        savedPostIds={savedPostIds}
        onTagClick={handleTagClick}
      />;
    }

    switch (currentPage) {
      case 'profile':
        return profileUser ? <ProfilePage 
          user={profileUser}
          currentUser={currentUser}
          posts={posts.filter(p => p.authorId === profileUser.id)} 
          onSelectPost={handleSelectPost}
          onReactToPost={handleReactToPost}
          onViewProfile={handleViewProfile}
          allUsers={users}
          onApplyToTeam={(postId) => setModalState({ applyToTeam: postId })}
          onManageTeam={(postId) => setModalState({ manageTeam: postId })}
          isFollowing={currentUser.following?.includes(profileUser.id) || false}
          onToggleFollow={handleToggleFollow}
          onCreatePostClick={() => setModalState({ createPost: true })}
          onDeletePost={(postId) => setModalState({ deletePost: postId })}
          onToggleSave={handleToggleSavePost}
          savedPostIds={savedPostIds}
          onTagClick={handleTagClick}
          onNavigate={handleNavigate}
          onUpdateUser={handleUpdateUserProfile}
          onBack={handleBack}
        /> : <Feed posts={[]} onSelectPost={handleSelectPost} onReactToPost={handleReactToPost} onViewProfile={handleViewProfile} allUsers={users} currentUser={currentUser} onCreatePostClick={() => setModalState({ createPost: true })} onApplyToTeam={() => {}} onManageTeam={() => {}} onDeletePost={() => {}} onToggleSave={handleToggleSavePost} savedPostIds={savedPostIds} onTagClick={handleTagClick}/>;
      case 'postDetail':
        return selectedPost ? <PostDetailPage post={selectedPost} onAddComment={handleAddComment} onAddReply={handleAddReply} onLikeComment={handleLikeComment} onReactToPost={handleReactToPost} onViewProfile={handleViewProfile} allUsers={users} currentUser={currentUser} onApplyToTeam={() => setModalState({ applyToTeam: selectedPost.id })} onManageTeam={() => setModalState({ manageTeam: selectedPost.id })} onDeletePost={(postId) => setModalState({ deletePost: postId })} onToggleSave={handleToggleSavePost} isSaved={savedPostIds.has(selectedPost.id)} onTagClick={handleTagClick} onBack={handleBack} /> : <div>Post not found.</div>;
      case 'following':
        return <FollowingPage users={followingUsers} onToggleFollow={handleToggleFollow} onViewProfile={handleViewProfile} />;
      case 'teams':
        return <TeamsPage teams={currentUserTeams} allUsers={users} />;
      case 'teamChat':
        return selectedPost ? <TeamChatPage 
          post={selectedPost} 
          allUsers={users} 
          currentUser={currentUser} 
          onSendMessage={handleSendMessage} 
          onViewProfile={handleViewProfile}
          onDeleteMessage={handleDeleteMessage}
          onEditMessage={handleEditMessage}
          onReactToMessage={handleReactToMessage}
        /> : <div>Team not found.</div>;
      case 'notifications':
        return <NotificationsPage notifications={currentUserNotifications} allUsers={users} onNotificationClick={handleNotificationClick} />;
      case 'popular':
        return <PopularPage allPosts={posts} currentUser={currentUser} allUsers={users} onSelectPost={handleSelectPost} onReactToPost={handleReactToPost} onViewProfile={handleViewProfile} onApplyToTeam={(postId) => setModalState({ applyToTeam: postId })} onManageTeam={(postId) => setModalState({ manageTeam: postId })} onDeletePost={(postId) => setModalState({ deletePost: postId })} onToggleSave={handleToggleSavePost} savedPostIds={savedPostIds} onTagClick={handleTagClick} />;
      case 'saved':
        return <SavedPostsPage savedPosts={posts.filter(p => savedPostIds.has(p.id))} currentUser={currentUser} allUsers={users} onSelectPost={handleSelectPost} onReactToPost={handleReactToPost} onViewProfile={handleViewProfile} onApplyToTeam={(postId) => setModalState({ applyToTeam: postId })} onManageTeam={(postId) => setModalState({ manageTeam: postId })} onDeletePost={(postId) => setModalState({ deletePost: postId })} onToggleSave={handleToggleSavePost} savedPostIds={savedPostIds} onTagClick={handleTagClick} />;
      case 'settings':
        return <SettingsPage
            currentUser={currentUser}
            onUpdateUser={handleUpdateUserProfile}
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            themeColor={themeColor}
            onThemeColorChange={setThemeColor}
        />;
      case 'admin':
        return <AdminPage 
            analyticsData={analyticsData} 
            retentionData={retentionData}
            feedback={feedback}
            allUsers={users}
            onUpdateFeedbackStatus={handleUpdateFeedbackStatus}
            onAddPersona={handleCreatePersona}
            onGenerateAIPost={handleGenerateAIPost}
            generatingPostPersonaId={generatingPostPersonaId}
         />;
      case 'home':
      default:
        return (
            <div className="w-full">
                 <FeedHeader 
                    ref={feedHeaderRef}
                    searchQuery={searchQuery}
                    onSearchChange={(e) => setSearchQuery(e.target.value)}
                    onClearSearch={() => setSearchQuery('')}
                    onNavigate={() => handleNavigate('home')}
                />
                <Feed
                    posts={homePosts}
                    onSelectPost={handleSelectPost}
                    onReactToPost={handleReactToPost}
                    onViewProfile={handleViewProfile}
                    allUsers={users}
                    currentUser={currentUser}
                    onCreatePostClick={() => setModalState({ createPost: true })}
                    onApplyToTeam={(postId) => setModalState({ applyToTeam: postId })}
                    onManageTeam={(postId) => setModalState({ manageTeam: postId })}
                    onDeletePost={(postId) => setModalState({ deletePost: postId })}
                    onToggleSave={handleToggleSavePost}
                    savedPostIds={savedPostIds}
                    onTagClick={handleTagClick}
                    feedSortType={feedSortType}
                    onSortChange={setFeedSortType}
                    suggestedUsers={suggestedUsersForFeed}
                    onToggleFollow={handleToggleFollow}
                />
            </div>
        );
    }
  };

  const manageTeamPost = posts.find(p => p.id === modalState.manageTeam);
  const applyToTeamPost = posts.find(p => p.id === modalState.applyToTeam);
  
  if (authLoading) {
    return <LoadingSpinner />;
  }

  if (!session || !currentUser) {
    return <AuthPage />;
  }

  if (isOnboarding) {
    return <OnboardingPage
      currentUser={currentUser}
      onComplete={handleCompleteOnboarding}
      suggestedUsers={allSuggestedUsers}
      onToggleFollow={handleToggleFollow}
    />;
  }
  
  return (
    <div className={`min-h-screen bg-neutral-100 dark:bg-[#18191A] text-neutral-900 dark:text-neutral-100 font-sans`}>
      <Header 
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        currentUser={currentUser}
        onCreatePostClick={() => setModalState({ createPost: true })}
        notifications={currentUserNotifications}
        allUsers={users}
        onNotificationClick={handleNotificationClick}
        searchQuery={searchQuery}
        onSearchChange={(e) => setSearchQuery(e.target.value)}
        onClearSearch={() => setSearchQuery('')}
        showLogoAndSearch={currentPage !== 'home' || !isFeedHeaderVisible}
        onLogout={handleLogout}
      />
      <main className="pt-16 flex pb-20 md:pb-0">
        <LeftSidebar 
          onNavigate={handleNavigate}
          currentPage={currentPage}
          notifications={currentUserNotifications}
          onOpenFeedbackModal={() => setModalState({ feedback: true })}
        />
        <div className="flex-grow flex justify-center min-w-0">
            {renderPage()}
        </div>
        {currentPage !== 'admin' && (
            <RightSidebar 
              onViewProfile={handleViewProfile}
              currentPage={currentPage}
              profileUser={profileUser}
              following={followingUsers}
              posts={posts}
              onSelectPost={handleSelectPost}
              currentUser={currentUser}
              users={users}
              onToggleFollow={handleToggleFollow}
              suggestedUsers={suggestedUsersForFeed.slice(0, 3)} // Right sidebar gets a smaller list
              selectedPost={selectedPost}
              onUpdateUser={handleUpdateUserProfile}
            />
        )}
      </main>

      {/* --- MOBILE-ONLY COMPONENTS --- */}
      <button 
        onClick={() => setModalState({ createPost: true })}
        className="md:hidden fixed bottom-20 right-4 bg-accent hover:bg-accent-hover text-accent-text-over w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-40 transition-transform hover:scale-110"
        aria-label="Create Post"
      >
        <i className="fa-solid fa-plus text-2xl"></i>
      </button>

      <BottomNav 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        notifications={currentUserNotifications}
        currentUserId={currentUser.id}
      />

      {/* --- MODALS --- */}
      {modalState.createPost && (
        <CreatePostModal onClose={() => setModalState({})} onSubmit={handleCreatePost} />
      )}
       {modalState.feedback && (
        <FeedbackModal 
            onClose={() => setModalState({})}
            onSendFeedback={handleAddFeedback}
        />
      )}
      {applyToTeamPost && (
        <ApplyToTeamModal post={applyToTeamPost} onClose={() => setModalState({})} onSubmit={handleApplyToTeam} />
      )}
      {manageTeamPost && (
        <ManageTeamModal post={manageTeamPost} allUsers={users} onClose={() => setModalState({})} onAccept={(postId, applicantId) => handleManageTeam('accept', postId, applicantId)} onReject={(postId, applicantId) => handleManageTeam('reject', postId, applicantId)} />
      )}
      {modalState.deletePost && (
        <DeleteConfirmationModal
          isOpen={!!modalState.deletePost}
          onClose={() => setModalState({})}
          onConfirm={() => handleDeletePost(modalState.deletePost!)}
          title="Delete Post"
          message="Are you sure you want to permanently delete this post? This action cannot be undone."
        />
      )}
    </div>
  );
};

export default App;
