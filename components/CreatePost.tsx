// Import React hooks for state and side effects.
import React, { useState, useEffect } from 'react';
// Import the Idea type definition.
import { Idea, User } from '../types';

// Define the props interface for the component that triggers the modal.
interface CreatePostTriggerProps {
  onOpenModal: () => void; // A function to be called to open the modal.
  currentUser: User;
}

// The CreatePostModal component.
export const CreatePostModal: React.FC<{ onClose: () => void; onSubmit: (idea: Idea, applicationQuestions: string[], tags: string[], discordLink?: string) => void }> = ({ onClose, onSubmit }) => {
  // State to hold the form data for the new SaaS idea.
  const [idea, setIdea] = useState<Idea>({
    title: '',
    description: '',
    problem: '',
    solution: '',
    targetAudience: '',
    monetization: ''
  });
  const [tagsInput, setTagsInput] = useState('');
  // State to track if the user wants to create a team for this idea.
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  // State to hold the list of application questions for the team.
  const [questions, setQuestions] = useState<string[]>([]);
  // State to hold the value of the new question being typed.
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [discordLink, setDiscordLink] = useState('');
  // State to control the visibility of the detailed idea fields.
  const [showDetails, setShowDetails] = useState(false);
  const [showDiscordHelp, setShowDiscordHelp] = useState(false);

  // Generic handler for changes in input and textarea fields.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    // Update the corresponding field in the idea state object.
    setIdea({ ...idea, [e.target.name]: e.target.value });
  };
  
  // Handler to add a new question to the list.
  const handleAddQuestion = () => {
    if (currentQuestion.trim()) { // Check if the question is not empty.
      setQuestions([...questions, currentQuestion.trim()]); // Add the new question.
      setCurrentQuestion(''); // Clear the input field.
    }
  };

  // Handler to remove a question from the list by its index.
  const handleRemoveQuestion = (indexToRemove: number) => {
    setQuestions(questions.filter((_, index) => index !== indexToRemove));
  };

  // Handler for the form submission.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission behavior.
    if (idea.title.trim()) { // Check if the title is provided.
      const tags = tagsInput.split(',').map(tag => tag.trim()).filter(Boolean);
      // Call the onSubmit prop with the idea and questions (or an empty array if not creating a team).
      onSubmit(idea, isCreatingTeam ? questions : [], tags, isCreatingTeam ? discordLink : undefined);
    } else {
      // Alert the user if the title is missing.
      alert('Please provide a title for your idea.');
    }
  };

  // useEffect hook to add an event listener for the 'Escape' key to close the modal.
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    // Cleanup function to remove the event listener when the component unmounts.
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  // Return the JSX for the modal.
  return (
    // The modal overlay. Clicking it will close the modal.
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* The modal content container. Stop propagation to prevent clicks inside from closing it. */}
      <div 
        className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header. */}
        <div className="sticky top-0 bg-white dark:bg-black p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-xl font-bold">Share Your SaaS Idea</h2>
          <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors">
            <i className="fa-solid fa-times text-2xl"></i>
          </button>
        </div>
        {/* The form for creating a new post. */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Idea Title field. */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Idea Title / Elevator Pitch*</label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Grab attention with a catchy name or a one-sentence summary of your idea.</p>
            <textarea name="title" id="title" value={idea.title} onChange={handleChange} rows={2} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none resize-none" required></textarea>
          </div>

          {/* General Description field. */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Your Idea</label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Feel free to share your thoughts, context, or a general description here.</p>
            <textarea name="description" id="description" value={idea.description} onChange={handleChange} rows={4} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none" placeholder="What's on your mind?"></textarea>
          </div>
          
          {/* Button to show more detailed fields, rendered conditionally. */}
          {!showDetails && (
            <div className="pt-2">
              <button 
                type="button" 
                onClick={() => setShowDetails(true)} 
                className="text-sm font-semibold text-accent hover:underline"
              >
                + Add More Details (Problem, Solution...)
              </button>
            </div>
          )}

          {/* The detailed idea fields, rendered conditionally. */}
          {showDetails && (
            <>
              {/* The Problem field. */}
              <div>
                <label htmlFor="problem" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">The Problem</label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Clearly describe the pain point or challenge your SaaS idea addresses. What issue are you solving for your users?</p>
                <textarea name="problem" id="problem" value={idea.problem} onChange={handleChange} rows={3} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
              </div>
              {/* The Solution field. */}
              <div>
                <label htmlFor="solution" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">The Solution</label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Explain how your product or service solves the problem. What are the key features and benefits?</p>
                <textarea name="solution" id="solution" value={idea.solution} onChange={handleChange} rows={3} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"></textarea>
              </div>
              {/* Target Audience field. */}
              <div>
                <label htmlFor="targetAudience" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Target Audience</label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Who are your ideal customers? Be specific about the industry, role, or user persona you're targeting.</p>
                <textarea name="targetAudience" id="targetAudience" value={idea.targetAudience} onChange={handleChange} rows={2} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none resize-none"></textarea>
              </div>
              {/* Monetization Strategy field. */}
              <div>
                <label htmlFor="monetization" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Monetization Strategy</label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">How will your SaaS make money? (e.g., Subscription tiers, freemium model, one-time purchase, usage-based pricing).</p>
                <textarea name="monetization" id="monetization" value={idea.monetization} onChange={handleChange} rows={2} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none resize-none"></textarea>
              </div>
            </>
          )}

          {/* Tags field */}
           <div>
            <label htmlFor="tags" className="block text-sm font-medium text-neutral-600 dark:text-neutral-300">Tags</label>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Add tags to categorize your idea, separated by commas (e.g., SaaS, AI, Marketing).</p>
            <input name="tags" id="tags" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none" placeholder="SaaS, AI, Marketing"/>
          </div>

          {/* Section for creating a team. */}
          <div className="pt-2 space-y-4 rounded-lg bg-neutral-100 dark:bg-[#3A3B3C] p-4"> 
            <label className="flex items-center space-x-3 cursor-pointer">
              {/* Checkbox to enable team creation. */}
              <input 
                type="checkbox"
                checked={isCreatingTeam}
                onChange={(e) => setIsCreatingTeam(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Create a team for this idea</span>
            </label>
            {/* The application questions UI, rendered conditionally. */}
            {isCreatingTeam && (
                <div className="space-y-4">
                     <div>
                        <label htmlFor="discordLink" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Discord Server Link</label>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 mb-2">Create a permanent invite link to your Discord server for team collaboration.</p>
                        <button type="button" onClick={() => setShowDiscordHelp(!showDiscordHelp)} className="text-xs text-accent hover:underline mb-2">
                            How to create a permanent link? <i className={`fa-solid fa-chevron-${showDiscordHelp ? 'up' : 'down'} ml-1 text-xs`}></i>
                        </button>
                        {showDiscordHelp && (
                            <div className="text-xs text-neutral-600 dark:text-neutral-300 bg-neutral-200 dark:bg-[#3A3B3C] p-3 rounded-md mb-2 space-y-1">
                                <p className="font-semibold">First, create a Discord Server if you don't have one.</p>
                                <ol className="list-decimal list-inside space-y-1 pl-2">
                                    <li>Open your server, click the server name (top-left) &gt; <strong>Invite People</strong>.</li>
                                    <li>At the bottom of the invite window, click <strong>Edit invite link</strong>.</li>
                                    <li>Set 'Expire After' to <strong>Never</strong>.</li>
                                    <li>Set 'Max Uses' to <strong>No limit</strong>.</li>
                                    <li>Click <strong>Generate a New Link</strong> and copy it.</li>
                                </ol>
                            </div>
                        )}
                        <input
                            type="url"
                            id="discordLink"
                            value={discordLink}
                            onChange={(e) => setDiscordLink(e.target.value)}
                            placeholder="https://discord.gg/your-invite-code"
                            className="w-full bg-white dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                            required
                        />
                     </div>
                    <hr className="border-neutral-200 dark:border-neutral-500"/>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Add questions for potential applicants to answer. This will help you build the right team.</p>
                    {/* Input for adding a new question. */}
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={currentQuestion}
                            onChange={(e) => setCurrentQuestion(e.target.value)}
                            placeholder="e.g., What's your experience with React?"
                            className="flex-grow bg-white dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                        />
                        <button type="button" onClick={handleAddQuestion} className="bg-neutral-200 hover:bg-neutral-300 dark:bg-[#242526] dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-200 font-semibold py-2 px-4 rounded-lg transition-colors">Add</button>
                    </div>
                    {/* List of added questions. */}
                    <ul className="space-y-2">
                        {questions.map((q, index) => (
                            <li key={index} className="flex items-center justify-between bg-white dark:bg-[#3A3B3C] p-2 rounded-md">
                                <span className="text-sm">{q}</span>
                                <button type="button" onClick={() => handleRemoveQuestion(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
          {/* Form submission button. */}
          <div className="pt-4 flex justify-end">
            <button type="submit" className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-6 rounded-lg transition-colors">
              Submit Idea
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// The trigger component displayed in the feed.
const CreatePost: React.FC<CreatePostTriggerProps> = ({ onOpenModal, currentUser }) => {
  return (
    // Main container for the trigger component.
    <div className="bg-white dark:bg-black p-4 rounded-lg shadow-md">
      <div className="flex items-center">
        {/* User's avatar. */}
        <img src={currentUser.avatarUrl} alt={`${currentUser.name}'s Avatar`} className="w-10 h-10 rounded-full mr-3" />
        {/* The clickable input-like button that opens the modal. */}
        <button
          onClick={onOpenModal}
          className="flex-grow bg-neutral-100 dark:bg-[#3A3B3C] text-gray-500 dark:text-gray-400 rounded-full py-3 px-4 text-left hover:bg-neutral-200 dark:hover:bg-neutral-600 transition-colors focus:outline-none"
        >
          Share your next big SaaS idea...
        </button>
      </div>
    </div>
  );
};

// Export the trigger component as the default export.
export default CreatePost;