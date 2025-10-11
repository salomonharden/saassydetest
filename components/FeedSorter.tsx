import React from 'react';
import { FeedSortType } from '../types';
import { useI18n } from '../App';

interface FeedSorterProps {
  currentSort: FeedSortType;
  onSortChange: (sortType: FeedSortType) => void;
}

const SortButton: React.FC<{
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'bg-neutral-200 text-neutral-800 dark:bg-[#3A3B3C] dark:text-neutral-100';
  const inactiveClasses = 'hover:bg-neutral-200 dark:hover:bg-[#3A3B3C] text-neutral-600 dark:text-neutral-300';
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${isActive ? activeClasses : inactiveClasses}`}
      aria-pressed={isActive}
    >
      <i className={`fa-solid ${icon} text-lg w-5 text-center`}></i>
      <span>{label}</span>
    </button>
  );
};

const FeedSorter: React.FC<FeedSorterProps> = ({ currentSort, onSortChange }) => {
  const { t } = useI18n();
  return (
    <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-2 flex items-center space-x-2">
      <SortButton
        label={t('feedSorter.hot')}
        icon="fa-fire"
        isActive={currentSort === 'hot'}
        onClick={() => onSortChange('hot')}
      />
      <SortButton
        label={t('feedSorter.new')}
        icon="fa-certificate"
        isActive={currentSort === 'new'}
        onClick={() => onSortChange('new')}
      />
      <SortButton
        label={t('feedSorter.top')}
        icon="fa-arrow-trend-up"
        isActive={currentSort === 'top'}
        onClick={() => onSortChange('top')}
      />
      <SortButton
        label={t('feedSorter.following')}
        icon="fa-user-group"
        isActive={currentSort === 'following'}
        onClick={() => onSortChange('following')}
      />
    </div>
  );
};

export default FeedSorter;