import React, { useState, useEffect } from 'react';
import { FeedbackType } from '../types';

interface FeedbackModalProps {
  onSendFeedback: (text: string, type: FeedbackType) => void;
  onClose: () => void;
}

const feedbackTypes: { type: FeedbackType, label: string, icon: string }[] = [
    { type: 'general', label: 'General', icon: 'fa-comment-dots' },
    { type: 'feature', label: 'Feature', icon: 'fa-rocket' },
    { type: 'bug', label: 'Bug', icon: 'fa-bug' },
];

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onSendFeedback, onClose }) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('general');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (feedbackText.trim()) {
      onSendFeedback(feedbackText.trim(), feedbackType);
      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 2000); // Close modal after 2 seconds
    }
  };

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#242526] rounded-lg shadow-xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-600 flex justify-between items-center">
          <h2 className="text-xl font-bold">Share Your Feedback</h2>
          <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        
        {isSubmitted ? (
          <div className="text-center p-12 transition-opacity duration-300">
            <i className="fa-solid fa-check-circle text-green-500 text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200">Thank you!</h3>
            <p className="text-neutral-600 dark:text-neutral-300">Your feedback has been submitted.</p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                What kind of feedback do you have?
              </label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {feedbackTypes.map(({ type, label, icon }) => (
                  <button
                    key={type}
                    onClick={() => setFeedbackType(type)}
                    className={`flex-1 flex items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                      feedbackType === type
                        ? 'border-accent bg-violet-50 dark:bg-violet-900/30'
                        : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300 dark:hover:border-neutral-500'
                    }`}
                  >
                    <i className={`fa-solid ${icon} mr-2 w-5 text-center`}></i>
                    <span className="font-semibold">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              placeholder="Tell us what's on your mind. Suggestions, bugs, or general thoughts..."
              className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none text-sm"
              aria-label="Feedback input"
            />

            <div className="flex justify-end space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-[#3A3B3C] dark:hover:bg-neutral-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!feedbackText.trim()}
                className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Feedback
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;