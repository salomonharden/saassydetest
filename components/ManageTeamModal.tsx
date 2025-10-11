// Import React and the useState hook.
import React, { useState } from 'react';
// Import necessary type definitions.
import { PostData, User, Application } from '../types';

// Define the props interface for the ManageTeamModal component.
interface ManageTeamModalProps {
    post: PostData; // The post data for the team being managed.
    allUsers: { [key:string]: User }; // A map of all users to look up applicant/member details.
    onClose: () => void; // Function to close the modal.
    onAccept: (postId: number, applicantId: string) => void; // Function to accept an applicant.
    onReject: (postId: number, applicantId: string) => void; // Function to reject an applicant.
}

// A reusable component for displaying a user's information in a row.
const UserRow: React.FC<{ user: User; children?: React.ReactNode }> = ({ user, children }) => (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-[#3A3B3C]">
        {/* User's avatar and name/work info. */}
        <div className="flex items-center space-x-3">
            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
            <div>
                <p className="font-semibold text-neutral-800 dark:text-neutral-200">{user.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{user.bio || 'SaaS Enthusiast'}</p>
            </div>
        </div>
        {/* Container for action buttons passed as children. */}
        <div className="flex space-x-2">
            {children}
        </div>
    </div>
);


// The ManageTeamModal functional component.
const ManageTeamModal: React.FC<ManageTeamModalProps> = ({ post, allUsers, onClose, onAccept, onReject }) => {
    // State to track which applicant's details are currently expanded.
    const [expandedApplicantId, setExpandedApplicantId] = useState<string | null>(null);

    // Process the applicants data: map applicant IDs to full user objects and include their answers.
    const applicants = post.teamApplicants
        ?.map(app => ({
            user: allUsers[app.applicantId],
            answers: app.answers,
        }))
        .filter(item => item.user) || []; // Filter out any applicants who couldn't be found.
    
    // Process the team members data: map member IDs to full user objects.
    const teamMembers = post.teamMembers?.map(id => allUsers[id]).filter(Boolean) || [];

    // Return the JSX for the modal.
    return (
        // The modal overlay.
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            {/* The modal content container. */}
            <div
                className="bg-white dark:bg-[#242526] rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header. */}
                <div className="sticky top-0 bg-white dark:bg-[#242526] p-4 border-b border-neutral-200 dark:border-neutral-600 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Manage Team</h2>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{post.idea.title}</p>
                    </div>
                    <button onClick={onClose} className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors" aria-label="Close modal">
                        <i className="fa-solid fa-times text-2xl"></i>
                    </button>
                </div>

                {/* Modal Body. */}
                <div className="p-6 space-y-6">
                    {/* Applicants Section. */}
                    <section>
                        <h3 className="font-bold text-lg mb-2">Applicants ({applicants.length})</h3>
                        <div className="space-y-2">
                            {/* Conditional rendering based on whether there are applicants. */}
                            {applicants.length > 0 ? applicants.map(({ user, answers }) => (
                                <div key={user.id} className="bg-neutral-50 dark:bg-[#3A3B3C] rounded-lg">
                                    {/* Display the applicant's info and action buttons. */}
                                    <UserRow user={user}>
                                        <button onClick={() => setExpandedApplicantId(prevId => prevId === user.id ? null : user.id)} className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-600 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-semibold py-1 px-3 rounded-lg transition-colors text-sm">
                                            <i className="fa-solid fa-eye mr-1"></i> View App
                                        </button>
                                        <button onClick={() => onReject(post.id, user.id)} className="bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60 text-red-700 dark:text-red-400 font-semibold py-1 px-3 rounded-lg transition-colors text-sm">Reject</button>
                                        <button onClick={() => onAccept(post.id, user.id)} className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-1 px-3 rounded-lg transition-colors text-sm">Accept</button>
                                    </UserRow>
                                    {/* The expandable section with the applicant's answers, rendered conditionally. */}
                                    {expandedApplicantId === user.id && (
                                        <div className="p-4 border-t border-neutral-200 dark:border-neutral-600">
                                            <h4 className="font-semibold mb-3">Application</h4>
                                            <div className="space-y-3">
                                                {answers.length > 0 ? answers.map((a, index) => (
                                                    <div key={index}>
                                                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{a.question}</p>
                                                        <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1 p-2 bg-neutral-100 dark:bg-[#242526] rounded-md whitespace-pre-wrap">{a.answer || <i className="opacity-50">No answer provided.</i>}</p>
                                                    </div>
                                                )) : <p className="text-sm text-neutral-500 dark:text-neutral-400 italic">This applicant did not have to answer any questions.</p>}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )) : (
                                // Message to show when there are no applicants.
                                <p className="text-neutral-500 dark:text-neutral-400 italic text-sm">No new applicants.</p>
                            )}
                        </div>
                    </section>

                    {/* Team Members Section. */}
                    <section>
                        <h3 className="font-bold text-lg mb-2">Team Members ({teamMembers.length})</h3>
                        <div className="space-y-2">
                            {/* Conditional rendering based on whether there are team members. */}
                            {teamMembers.length > 0 ? teamMembers.map(user => (
                                <UserRow key={user.id} user={user}>
                                    {/* Placeholder for future actions like 'Remove member'. */}
                                </UserRow>
                            )) : (
                                // Message to show when the team is empty.
                                <p className="text-neutral-500 dark:text-neutral-400 italic text-sm">Your team is empty.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

// Export the ManageTeamModal component.
export default ManageTeamModal;