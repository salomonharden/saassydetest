// Import React.
import React from 'react';

// Define the props interface for the DeleteConfirmationModal.
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

// The DeleteConfirmationModal functional component.
const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  // If the modal is not open, render nothing.
  if (!isOpen) return null;

  return (
    // The modal overlay that covers the entire screen.
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      {/* The modal content container. Clicks inside are stopped from propagating to the overlay. */}
      <div
        className="bg-white dark:bg-[#242526] rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-600">
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        
        {/* Modal Body with the confirmation message */}
        <div className="p-6">
          <p className="text-neutral-700 dark:text-neutral-300">{message}</p>
        </div>
        
        {/* Modal Footer with action buttons */}
        <div className="flex justify-end p-4 bg-neutral-50 dark:bg-[#3A3B3C] rounded-b-lg space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg font-semibold text-neutral-700 dark:text-neutral-200 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;