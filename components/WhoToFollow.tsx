import React from 'react';
import { User } from '../types';

interface WhoToFollowProps {
  users: User[];
  onViewProfile: (user: User) => void;
  onToggleFollow: (userId: string) => void;
}

const WhoToFollow: React.FC<WhoToFollowProps> = ({ users, onViewProfile, onToggleFollow }) => {
  if (users.length === 0) {
    return null; // Don't render anything if there are no suggestions
  }

  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-4 mb-4">
      <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Who to Follow</h2>
      <div className="space-y-3">
        {users.map(user => (
          <div key={user.id} className="flex items-center justify-between">
            <button onClick={() => onViewProfile(user)} className="flex items-center space-x-3 group min-w-0">
              <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="text-left min-w-0">
                <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate group-hover:underline">{user.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.bio || 'SaaS Enthusiast'}</p>
              </div>
            </button>
            <button
              onClick={() => onToggleFollow(user.id)}
              className="flex-shrink-0 flex items-center justify-center bg-violet-100 text-[#a452fd] dark:bg-[#3A3B3C] dark:text-neutral-200 border border-transparent hover:border-[#a452fd] px-3 py-1.5 rounded-lg font-semibold transition-colors text-sm"
            >
              <i className="fa-solid fa-user-plus mr-2"></i>
              <span>Follow</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhoToFollow;