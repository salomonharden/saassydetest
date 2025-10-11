// Import React and the useState hook.
import React, { useState } from 'react';
// Import the PostData type definition.
import { PostData } from '../types';

// Define the props interface for the ApplyToTeamModal component.
interface ApplyToTeamModalProps {
    post: PostData; // The post data for the team to which the user is applying.
    onClose: () => void; // Function to close the modal.
    onSubmit: (postId: number, answers: { question: string; answer: string }[]) => void; // Function to submit the application.
}

// The ApplyToTeamModal functional component.
const ApplyToTeamModal: React.FC<ApplyToTeamModalProps> = ({ post, onClose, onSubmit }) => {
    // State to hold the user's answers to the application questions.
    // It's initialized by mapping over the questions from the post data.
    const [answers, setAnswers] = useState<{ question: string; answer: string }[]>(() =>
        post.applicationQuestions?.map(q => ({ question: q, answer: '' })) || []
    );

    // Handler for changes in the answer textareas.
    const handleAnswerChange = (index: number, value: string) => {
        const newAnswers = [...answers]; // Create a copy of the answers array.
        newAnswers[index].answer = value; // Update the answer at the specific index.
        setAnswers(newAnswers); // Set the new state.
    };

    // Handler for the form submission.
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault(); // Prevent the default form submission behavior.
        onSubmit(post.id, answers); // Call the onSubmit prop with the post ID and the answers.
    };

    // Return the JSX for the modal.
    return (
        // The modal overlay. Clicking it closes the modal.
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* The modal content container. Clicks inside are stopped from propagating to the overlay. */}
            <div
                className="bg-white dark:bg-[#242526] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header. */}
                <div className="sticky top-0 bg-white dark:bg-[#242526] p-4 border-b border-neutral-200 dark:border-neutral-600 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Apply to Join Team</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{post.idea.title}</p>
                    </div>
                    {/* Close button. */}
                    <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors" aria-label="Close modal">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* The application form. */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Map over the answers state to create a textarea for each question. */}
                    {answers.map((item, index) => (
                        <div key={index}>
                            {/* The question label. */}
                            <label htmlFor={`question-${index}`} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                {item.question}
                            </label>
                            {/* The textarea for the answer. */}
                            <textarea
                                id={`question-${index}`}
                                rows={3}
                                value={item.answer}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                required // Make answering each question mandatory.
                            />
                        </div>
                    ))}
                    {/* The submit button container. */}
                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-6 rounded-lg transition-colors">
                            Submit Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Export the ApplyToTeamModal component.
export default ApplyToTeamModal;