// Import React hooks and type definitions.
import React, { useState } from 'react';
import { User, PortfolioItem } from '../types';
import DeleteConfirmationModal from './DeleteConfirmationModal';
// Import the i18n hook for translations.
import { useI18n } from '../App';

// Define the props interface for the SettingsPage component.
interface SettingsPageProps {
    currentUser: User;
    onUpdateUser: (user: User) => void;
    isDarkMode: boolean;
    onToggleTheme: () => void;
    themeColor: string;
    onThemeColorChange: (color: string) => void;
}

// Reusable component for a settings section card.
const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white dark:bg-black rounded-lg shadow-md">
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-800">
            <h2 className="text-lg font-bold">{title}</h2>
        </div>
        <div className="p-4 space-y-4">
            {children}
        </div>
    </div>
);

// Reusable component for an input field with a label.
const FormField: React.FC<{
    id: string;
    label: string;
    value: string | undefined;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    type?: 'text' | 'textarea' | 'password';
}> = ({ id, label, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            {label}
        </label>
        {type === 'textarea' ? (
            <textarea
                id={id}
                name={id}
                rows={3}
                value={value || ''}
                onChange={onChange}
                className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
            />
        ) : (
            <input
                type={type}
                id={id}
                name={id}
                value={value || ''}
                onChange={onChange}
                className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
            />
        )}
    </div>
);


const themeColors = [
    { name: 'violet', color: '#a452fd' },
    { name: 'blue', color: '#3b82f6' },
    { name: 'green', color: '#22c55e' },
    { name: 'orange', color: '#f97316' },
];

// The SettingsPage functional component.
// FIX: Changed to a named export to resolve circular dependency issues.
export const SettingsPage: React.FC<SettingsPageProps> = ({ currentUser, onUpdateUser, isDarkMode, onToggleTheme, themeColor, onThemeColorChange }) => {
    // Use the i18n hook to get the translation function.
    const { t } = useI18n();
    
    const [formData, setFormData] = useState<User>({
        ...currentUser,
        skills: currentUser.skills || [], // Ensure skills is an array
        portfolio: currentUser.portfolio || [], // Ensure portfolio is an array
    });
    const [newPortfolioItem, setNewPortfolioItem] = useState<PortfolioItem>({ title: '', url: '' });
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setFormData({ ...formData, avatarUrl: event.target.result });
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const skillsArray = e.target.value.split(',').map(skill => skill.trim()).filter(Boolean);
        setFormData({ ...formData, skills: skillsArray });
    };

    const handlePortfolioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPortfolioItem({ ...newPortfolioItem, [e.target.name]: e.target.value });
    };
    
    const handleAddPortfolioItem = () => {
        if (newPortfolioItem.title.trim() && newPortfolioItem.url.trim()) {
            setFormData(prev => ({
                ...prev,
                portfolio: [...(prev.portfolio || []), newPortfolioItem]
            }));
            setNewPortfolioItem({ title: '', url: '' }); // Reset form
        }
    };
    
    const handleRemovePortfolioItem = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            portfolio: prev.portfolio?.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateUser(formData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
    };

    return (
        <div className="flex-grow w-full lg:max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="pt-4 lg:pt-0 animate-fade-in-slide-up">
                <div className="relative flex items-center justify-center">
                    <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
                </div>
            </div>

            {/* Appearance Settings */}
            <div className="animate-fade-in-slide-up" style={{ animationDelay: '100ms' }}>
                <SettingsCard title="Appearance">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Theme</span>
                        <button onClick={onToggleTheme} className="w-32 text-left flex items-center justify-center px-4 py-2 text-sm rounded-lg font-semibold bg-neutral-200 dark:bg-[#3A3B3C] hover:bg-neutral-300 dark:hover:bg-neutral-600 transition-colors">
                            {isDarkMode ? (
                                <><i className="fa-solid fa-sun w-6 mr-2"></i> Light</>
                            ) : (
                                <><i className="fa-solid fa-moon w-6 mr-2"></i> Dark</>
                            )}
                        </button>
                    </div>
                     <div className="flex items-center justify-between">
                        <span className="font-medium">Accent Color</span>
                         <div className="flex space-x-2">
                            {themeColors.map(theme => (
                                <button
                                    key={theme.name}
                                    onClick={() => onThemeColorChange(theme.name)}
                                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${themeColor === theme.name ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-black ring-current' : ''}`}
                                    style={{ backgroundColor: theme.color, color: theme.color }}
                                    aria-label={`Select ${theme.name} theme`}
                                />
                            ))}
                        </div>
                    </div>
                </SettingsCard>
            </div>
            
            {/* Profile Settings */}
            <div className="animate-fade-in-slide-up" style={{ animationDelay: '200ms' }}>
                <SettingsCard title="Profile">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex justify-center">
                            <div className="relative group">
                                <img src={formData.avatarUrl} alt="Current Avatar" className="w-24 h-24 rounded-full object-cover" />
                                <label htmlFor="avatarUpload" className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center rounded-full cursor-pointer transition-all">
                                    <i className="fa-solid fa-camera text-white text-2xl opacity-0 group-hover:opacity-100 transition-opacity"></i>
                                </label>
                                <input type="file" id="avatarUpload" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                            </div>
                        </div>
                        <FormField id="name" label="Name" value={formData.name} onChange={handleChange} />
                        <FormField id="bio" label="Bio" value={formData.bio} onChange={handleChange} type="textarea" />
                        <FormField id="location" label="Location" value={formData.location} onChange={handleChange} />
                        
                        <hr className="border-neutral-200 dark:border-neutral-800"/>

                        {/* Skills Editing */}
                        <div>
                            <label htmlFor="skills" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Skills
                            </label>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">Enter your skills separated by commas.</p>
                            <input
                                type="text"
                                id="skills"
                                name="skills"
                                value={(formData.skills || []).join(', ')}
                                onChange={handleSkillsChange}
                                className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                placeholder="e.g., React, UI/UX Design, Marketing"
                            />
                        </div>
                        
                        <hr className="border-neutral-200 dark:border-neutral-800"/>

                        {/* Portfolio Editing */}
                        <div>
                            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Portfolio</h3>
                            {/* List of existing portfolio items */}
                            <div className="space-y-2 mb-4">
                                {(formData.portfolio || []).map((item, index) => (
                                    <div key={index} className="flex items-center justify-between bg-neutral-100 dark:bg-[#3A3B3C] p-2 rounded-md">
                                        <div className="min-w-0">
                                            <p className="font-semibold truncate">{item.title}</p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">{item.url}</p>
                                        </div>
                                        <button type="button" onClick={() => handleRemovePortfolioItem(index)} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 ml-2 flex-shrink-0">
                                            <i className="fa-solid fa-trash"></i>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Form to add a new portfolio item */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <input
                                    type="text"
                                    name="title"
                                    value={newPortfolioItem.title}
                                    onChange={handlePortfolioChange}
                                    placeholder="Link Title (e.g., GitHub)"
                                    className="w-full bg-neutral-100 dark:bg-[#3A3B3C] rounded-md p-2 focus:ring-2 focus:ring-accent focus:outline-none"
                                />
                                 <input
                                    type="url"
                                    name="url"
                                    value