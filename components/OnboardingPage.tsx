import React, { useState, useMemo } from 'react';
import { User } from '../types';

interface OnboardingPageProps {
    currentUser: User;
    onComplete: (finalUserData: User) => void;
    suggestedUsers: User[];
    onToggleFollow: (userId: string) => void;
}

const interestTopics = ['SaaS', 'AI', 'UIUX', 'DeveloperTools', 'Marketing', 'Productivity', 'FinTech', 'HealthTech', 'Web3', 'NoCode', 'CreatorEconomy', 'MobileApp'];

const OnboardingPage: React.FC<OnboardingPageProps> = ({ currentUser, onComplete, suggestedUsers, onToggleFollow }) => {
    const [step, setStep] = useState(1);
    const [userData, setUserData] = useState<User>({ ...currentUser });
    const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());
    const [followedUserIds, setFollowedUserIds] = useState<Set<string>>(new Set());
    
    const totalSteps = 5;

    const handleNext = () => setStep(prev => Math.min(prev + 1, totalSteps));
    const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if(event.target?.result) {
                    setUserData({ ...userData, avatarUrl: event.target.result as string });
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev => {
            const newSet = new Set(prev);
            if (newSet.has(interest)) {
                newSet.delete(interest);
            } else {
                newSet.add(interest);
            }
            return newSet;
        });
    };
    
    const toggleFollow = (userId: string) => {
        onToggleFollow(userId); // This updates the main app state immediately
        setFollowedUserIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(userId)) {
                newSet.delete(userId);
            } else {
                newSet.add(userId);
            }
            return newSet;
        });
    };

    const handleFinish = () => {
        const finalUserData = {
            ...userData,
            interests: Array.from(selectedInterests),
            following: Array.from(new Set([...(userData.following || []), ...followedUserIds])),
        };
        onComplete(finalUserData);
    };

    const filteredSuggestedUsers = useMemo(() => {
        if (selectedInterests.size === 0) {
            return suggestedUsers.slice(0, 5); // Show generic suggestions if no interests picked
        }
        // This is a simplified filtering. A real app would have more complex logic.
        return suggestedUsers
            .sort((a, b) => {
                const aScore = a.skills?.filter(skill => selectedInterests.has(skill)).length || 0;
                const bScore = b.skills?.filter(skill => selectedInterests.has(skill)).length || 0;
                return bScore - aScore;
            })
            .slice(0, 5);
    }, [suggestedUsers, selectedInterests]);


    const renderStep = () => {
        switch (step) {
            case 1: // Welcome
                return (
                    <div className="text-center">
                        <h1 className="text-4xl font-bold mb-2">Welcome to SaasSyde, {userData.name}!</h1>
                        <p className="text-lg text-neutral-500 dark:text-neutral-400">Let's set up your profile to personalize your experience.</p>
                    </div>
                );
            case 2: // Name & Bio
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Profile Essentials</h2>
                        <div className="space-y-4">
                            <input type="text" name="name" value={userData.name} onChange={handleInputChange} placeholder="Your Name" className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-3 focus:ring-2 focus:ring-accent focus:outline-none" />
                            <textarea name="bio" value={userData.bio === 'Just joined SaasSyde!' ? '' : userData.bio} onChange={handleInputChange} placeholder="Tell us about yourself..." rows={4} className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-3 focus:ring-2 focus:ring-accent focus:outline-none" />
                        </div>
                    </div>
                );
            case 3: // Profile Picture
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-4">Add a Profile Picture</h2>
                        <div className="flex flex-col items-center space-y-4">
                            <img src={userData.avatarUrl} alt="Avatar Preview" className="w-40 h-40 rounded-full object-cover ring-4 ring-accent/20" />
                            <label htmlFor="avatarUpload" className="cursor-pointer bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-6 rounded-lg transition-colors">
                                Upload Photo
                            </label>
                            <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            <button onClick={handleNext} className="text-sm text-neutral-500 hover:underline">Skip for now</button>
                        </div>
                    </div>
                );
            case 4: // Interests
                return (
                    <div>
                        <h2 className="text-2xl font-bold mb-2">What are you interested in?</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Select at least 3 topics to personalize your feed.</p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {interestTopics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => toggleInterest(topic)}
                                    className={`px-4 py-2 rounded-full font-semibold transition-colors border-2 ${selectedInterests.has(topic) ? 'bg-accent border-accent text-accent-text-over' : 'bg-neutral-100 dark:bg-[#3A3B3C] border-transparent hover:border-accent'}`}
                                >
                                    #{topic}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5: // Follow Suggestions
                return (
                     <div>
                        <h2 className="text-2xl font-bold mb-2">Connect with others</h2>
                        <p className="text-neutral-500 dark:text-neutral-400 mb-6">Follow some people to get your feed started.</p>
                        <div className="space-y-3">
                           {filteredSuggestedUsers.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-[#3A3B3C] rounded-lg">
                                    <div className="flex items-center space-x-3 min-w-0">
                                        <img src={user.avatarUrl} alt={user.name} className="w-12 h-12 rounded-full flex-shrink-0" />
                                        <div className="text-left min-w-0">
                                            <p className="font-bold truncate">{user.name}</p>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">{user.bio || 'SaaS Enthusiast'}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => toggleFollow(user.id)}
                                        className={`w-28 flex-shrink-0 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${followedUserIds.has(user.id) ? 'bg-violet-100 text-accent dark:bg-neutral-600 dark:text-neutral-200' : 'bg-accent text-accent-text-over hover:bg-accent-hover'}`}
                                    >
                                        {followedUserIds.has(user.id) ? 'Following' : 'Follow'}
                                    </button>
                                </div>
                           ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const isNextDisabled = () => {
        if (step === 2 && (!userData.name.trim() || !userData.bio?.trim())) return true;
        if (step === 4 && selectedInterests.size < 3) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-neutral-100 dark:bg-[#18191A] flex flex-col items-center justify-center p-4 font-sans transition-colors">
             <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="mb-8 px-4">
                    <div className="bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                        <div className="bg-accent h-2 rounded-full transition-all duration-500 ease-out" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
                    </div>
                </div>

                <div className="w-full max-w-2xl bg-white dark:bg-[#242526] rounded-lg shadow-xl p-8 min-h-[450px] flex flex-col justify-between">
                    <div className="flex-grow flex items-center justify-center">
                         {renderStep()}
                    </div>
                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8">
                        {step > 1 ? (
                            <button onClick={handleBack} className="font-bold py-2 px-6 rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-700">Back</button>
                        ) : <div></div>}
                        
                        {step < totalSteps ? (
                            <button onClick={handleNext} disabled={isNextDisabled()} className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                Next
                            </button>
                        ) : (
                            <button onClick={handleFinish} className="bg-accent hover:bg-accent-hover text-accent-text-over font-bold py-2 px-6 rounded-lg transition-colors">
                                Finish
                            </button>
                        )}
                    </div>
                </div>
             </div>
        </div>
    );
};

export default OnboardingPage;