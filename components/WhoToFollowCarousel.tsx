import React from 'react';
import { User } from '../types';

interface WhoToFollowCarouselProps {
  users: User[];
  onViewProfile: (user: User) => void;
  onToggleFollow: (userId: string) => void;
}

const WhoToFollowCarousel: React.FC<WhoToFollowCarouselProps> = ({ users, onViewProfile, onToggleFollow }) => {
  if (users.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md pt-4 pb-5">
      <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3 px-4">Who to Follow</h2>
      <div className="flex overflow-x-auto space-x-3 pb-2 px-4 scrollbar-hide">
        {users.map(user => (
          <div key={user.id} className="flex-shrink-0 w-32 bg-neutral-50 dark:bg-[#3A3B3C] rounded-lg border border-neutral-200 dark:border-neutral-600 p-3 flex flex-col items-center text-center">
            <button onClick={() => onViewProfile(user)} className="w-full">
              <img src={user.avatarUrl} alt={user.name} className="w-16 h-16 rounded-full mx-auto mb-2" />
              <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 truncate w-full">{user.name}</p>
            </button>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate w-full mb-3">{user.bio || 'SaaS Enthusiast'}</p>
            <button
              onClick={() => onToggleFollow(user.id)}
              className="w-full flex items-center justify-center bg-accent text-accent-text-over px-3 py-1.5 rounded-lg font-semibold hover:bg-accent-hover transition-colors text-sm"
            >
              <i className="fa-solid fa-user-plus mr-1.5"></i>
              <span>Follow</span>
            </button>
          </div>
        ))}
      </div>
       <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default WhoToFollowCarousel;