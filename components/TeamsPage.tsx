// Import React library.
import React from 'react';
import { PostData, User } from '../types';

interface TeamCardProps {
    team: PostData;
    allUsers: { [key: string]: User };
}

// A reusable component for displaying a single team card.
const TeamCard: React.FC<TeamCardProps> = ({ team, allUsers }) => {
    const author = allUsers[team.authorId];
    const members = (team.teamMembers || [])
        .map(id => allUsers[id])
        .filter((u): u is User => !!u); // Filter out any unfound users
    
    // Combine author and members, ensuring no duplicates
    const allTeamMembers = author ? [author, ...members.filter(m => m.id !== author.id)] : members;

    return (
        <div className="bg-white dark:bg-[#242526] rounded-lg shadow-md p-4 space-y-4">
            <div>
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{team.idea.title}</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Created by {author?.name || 'Unknown'}</p>
            </div>

            <div>
                <h3 className="font-semibold text-neutral-800 dark:text-neutral-200 mb-2">Team Members ({allTeamMembers.length})</h3>
                <div className="flex items-center space-x-2">
                    <div className="flex -space-x-3">
                        {allTeamMembers.slice(0, 7).map(member => (
                            <img 
                                key={member.id}
                                src={member.avatarUrl}
                                alt={member.name}
                                title={member.name}
                                className="w-9 h-9 rounded-full border-2 border-white dark:border-[#242526] object-cover"
                            />
                        ))}
                    </div>
                    {allTeamMembers.length > 7 && (
                        <span className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
                            + {allTeamMembers.length - 7} more
                        </span>
                    )}
                </div>
            </div>
            
            {team.discordLink ? (
                <a 
                    href={team.discordLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    <i className="fa-brands fa-discord mr-2"></i> Join Discord
                </a>
            ) : (
                <div className="w-full text-center text-sm text-neutral-400 dark:text-neutral-500 p-2 bg-neutral-100 dark:bg-[#3A3B3C] rounded-md">
                    No Discord link provided.
                </div>
            )}
        </div>
    );
};

interface TeamsPageProps {
    teams: PostData[];
    allUsers: { [key: string]: User };
}

// The TeamsPage functional component, now a dashboard for the user's teams.
const TeamsPage: React.FC<TeamsPageProps> = ({ teams, allUsers }) => {
    return (
        // Main container for the Teams page content.
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-4 py-6 animate-fade-in-slide-up">
            <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">My Teams</h1>
            
            <div className="space-y-4">
                {teams.length > 0 ? (
                    teams.map(team => (
                        <TeamCard key={team.id} team={team} allUsers={allUsers} />
                    ))
                ) : (
                    <div className="text-center py-10 bg-white dark:bg-[#242526] rounded-lg shadow-md">
                        <i className="fa-solid fa-users-slash text-4xl text-neutral-400 dark:text-neutral-500 mb-4"></i>
                        <h3 className="font-semibold text-lg text-neutral-800 dark:text-neutral-200">You're not on any teams yet</h3>
                        <p className="text-neutral-500 dark:text-neutral-400">Create a post or apply to join an existing idea!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Export the TeamsPage component.
export default TeamsPage;