// Import React.
import React from 'react';

// Define the props interface for the FeedHeader component.
interface FeedHeaderProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearSearch: () => void;
  onNavigate: () => void;
}

// The FeedHeader component, using React.forwardRef to accept a ref from its parent.
const FeedHeader = React.forwardRef<HTMLDivElement, FeedHeaderProps>(
  ({ searchQuery, onSearchChange, onClearSearch, onNavigate }, ref) => {
    return (
      // The main container for the feed header, which will be observed for intersection.
      <div ref={ref} className="w-full lg:max-w-2xl mx-auto px-4 pt-6 pb-2 animate-fade-in-slide-up">
        {/* Centered logo container. */}
        <div 
            className="flex justify-center mb-4 cursor-pointer"
            onClick={onNavigate}
        >
          <img
            src="https://i.postimg.cc/c4yPXcZC/logo-1.png"
            alt="App Logo"
            className="h-12"
          />
        </div>
        {/* The search bar, mirroring the style from the main Header component. */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <i className="fa-solid fa-search text-gray-400"></i>
          </div>
          <input
            type="text"
            placeholder="Search SaasSyde"
            value={searchQuery}
            onChange={onSearchChange}
            className="bg-white dark:bg-[#3A3B3C] border border-neutral-300 dark:border-neutral-600 text-neutral-800 dark:text-gray-200 rounded-full py-2 pl-10 pr-10 w-full focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <i className="fa-solid fa-times-circle"></i>
            </button>
          )}
        </div>
      </div>
    );
  }
);

export default FeedHeader;