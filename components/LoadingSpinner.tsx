import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-neutral-100 dark:bg-[#18191A]">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent"></div>
  </div>
);

export default LoadingSpinner;
