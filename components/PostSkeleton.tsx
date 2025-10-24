// Import React library.
import React from 'react';

// The PostSkeleton functional component, used as a placeholder while content is loading.
const PostSkeleton: React.FC = () => {
  // Return the JSX for the skeleton loader.
  return (
    // Main container that mimics the Post component's structure, with an animation class.
    <div className="bg-white dark:bg-black rounded-none lg:rounded-lg shadow-md p-4 animate-pulse w-full">
      {/* Skeleton for the Post Header. */}
      <div className="flex items-center mb-4">
        {/* Placeholder for the avatar. */}
        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-[#3A3B3C] mr-3"></div>
        {/* Placeholder for the author's name and timestamp. */}
        <div className="flex-grow">
          <div className="h-4 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/4"></div>
        </div>
      </div>

      {/* Skeleton for the Post Content/Body. */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-full"></div>
        <div className="h-4 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-5/6"></div>
      </div>

      {/* Skeleton for the Post Footer (reaction/comment counts). */}
      <div className="flex justify-between items-center mb-2 pt-4">
        <div className="h-3 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/4"></div>
        <div className="h-3 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/3"></div>
      </div>
      
      {/* Divider line placeholder. */}
      <hr className="border-neutral-200 dark:border-neutral-700" />

      {/* Skeleton for the Post Actions (Like, Comment, etc.). */}
      <div className="flex justify-around mt-2">
        <div className="h-8 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/5 mx-1"></div>
        <div className="h-8 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/5 mx-1"></div>
        <div className="h-8 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/5 mx-1"></div>
        <div className="h-8 bg-neutral-200 dark:bg-[#3A3B3C] rounded w-1/5 mx-1"></div>
      </div>
    </div>
  );
};

// Export the PostSkeleton component.
export default PostSkeleton;