import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../types';

interface ChatMessageProps {
    message: Message;
    sender?: User;
    currentUser: User;
    isStartOfGroup: boolean;
    onViewProfile: (user: User) => void;
    onEdit: (messageId: number) => void;
    onDelete: (messageId: number) => void;
    onReact: (emoji: string) => void;
    isEditing: boolean;
    onSaveEdit: (messageId: number, newText: string) => void;
    onCancelEdit: () => void;
}

const ReactionPalette: React.FC<{ onSelect: (emoji: string) => void }> = ({ onSelect }) => {
    const emojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];
    return (
        <div className="absolute bottom-full mb-1 bg-white dark:bg-[#3A3B3C] rounded-full shadow-lg flex p-1 space-x-1 z-20">
            {emojis.map(emoji => (
                <button
                    key={emoji}
                    onClick={() => onSelect(emoji)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xl transition-transform hover:scale-125"
                    aria-label={`React with ${emoji}`}
                >
                    {emoji}
                </button>
            ))}
        </div>
    );
};

const ChatMessage: React.FC<ChatMessageProps> = ({
    message, sender, currentUser, isStartOfGroup, onViewProfile, 
    onEdit, onDelete, onReact, isEditing, onSaveEdit, onCancelEdit
}) => {
    const isCurrentUser = message.senderId === currentUser.id;
    const [isHovered, setIsHovered] = useState(false);
    const [showPalette, setShowPalette] = useState(false);
    const [editText, setEditText] = useState(message.text || '');
    const editInputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.style.height = 'auto';
            editInputRef.current.style.height = `${editInputRef.current.scrollHeight}px`;
        }
    }, [isEditing]);
    
    const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSaveEdit(message.id, editText);
        } else if (e.key === 'Escape') {
            onCancelEdit();
        }
    };

    const renderMessageContent = () => {
        if (isEditing) {
            return (
                <div className="w-full">
                    <textarea
                        ref={editInputRef}
                        value={editText}
                        onChange={(e) => {
                            setEditText(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                        }}
                        onKeyDown={handleEditKeyDown}
                        className="w-full bg-neutral-200 dark:bg-[#3A3B3C] rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none text-sm"
                    />
                    <div className="text-xs mt-1">
                        escape to <button onClick={onCancelEdit} className="text-accent hover:underline">cancel</button> • enter to <button onClick={() => onSaveEdit(message.id, editText)} className="text-accent hover:underline">save</button>
                    </div>
                </div>
            );
        }

        return <p className="text-sm whitespace-pre-wrap">{message.text}</p>;
    };
    
    // FIX: Explicitly typed the `filter` callback parameter to resolve errors where properties were accessed on an 'unknown' type.
    const sortedReactions = Object.entries(message.reactions || {}).filter(([, userIds]: [string, string[]]) => userIds.length > 0);

    return (
        <div className="animate-slide-up-fade-in-chat">
            <div 
                className={`flex items-start gap-2 group ${isStartOfGroup ? 'mt-3' : ''} ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {!isCurrentUser && sender && (
                    <div className="w-8 flex-shrink-0">
                        {isStartOfGroup && (
                            <button onClick={() => onViewProfile(sender)}>
                                <img src={sender.avatarUrl} alt={sender.name} className="w-8 h-8 rounded-full" />
                            </button>
                        )}
                    </div>
                )}
                
                <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                    {isStartOfGroup && !isCurrentUser && sender && (
                        <div className="flex items-baseline space-x-2 px-3">
                            <button onClick={() => onViewProfile(sender)} className="font-bold text-sm hover:underline">{sender.name}</button>
                             <span className="text-xs text-neutral-500 dark:text-neutral-400">
                               {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    )}
                    <div className="relative flex items-center">
                         {/* Action menu for current user */}
                        {isCurrentUser && (
                            <div className={`absolute left-0 -translate-x-full flex items-center transition-opacity duration-200 ${isHovered || showPalette ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="relative">
                                    <button onClick={() => setShowPalette(!showPalette)} className="p-1 rounded-full w-7 h-7 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                        <i className="fa-regular fa-face-smile"></i>
                                    </button>
                                    {showPalette && <ReactionPalette onSelect={(emoji) => { onReact(emoji); setShowPalette(false); }} />}
                                </div>
                                 {!isEditing && message.text && (
                                    <button onClick={() => onEdit(message.id)} className="p-1 rounded-full w-7 h-7 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                        <i className="fa-solid fa-pencil"></i>
                                    </button>
                                )}
                                <button onClick={() => onDelete(message.id)} className="p-1 rounded-full w-7 h-7 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                    <i className="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        )}

                        <div className={`relative max-w-xs md:max-w-md p-2 rounded-xl ${isCurrentUser ? 'bg-accent text-accent-text-over rounded-br-none' : 'bg-white dark:bg-[#3A3B3C] text-neutral-800 dark:text-neutral-100 rounded-bl-none'}`}>
                            {renderMessageContent()}
                            {message.isEdited && !isEditing && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                            {sortedReactions.length > 0 && (
                                <div className="absolute -bottom-3 right-2 flex space-x-1">
                                    {sortedReactions.map(([emoji, userIds]) => (
                                        <button 
                                            key={emoji} 
                                            onClick={() => onReact(emoji)}
                                            className={`bg-white dark:bg-neutral-600 rounded-full px-2 py-0.5 flex items-center space-x-1 text-xs shadow-md transition-transform hover:scale-110 ${userIds.includes(currentUser.id) ? 'ring-2 ring-accent' : ''}`}
                                            >
                                            <span>{emoji}</span>
                                            <span className="text-neutral-800 dark:text-neutral-200 font-semibold">{userIds.length}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                         {/* Action menu for other users */}
                        {!isCurrentUser && (
                             <div className={`absolute right-0 translate-x-full flex items-center transition-opacity duration-200 ${isHovered || showPalette ? 'opacity-100' : 'opacity-0'}`}>
                                <div className="relative">
                                    <button onClick={() => setShowPalette(!showPalette)} className="p-1 rounded-full w-7 h-7 flex items-center justify-center hover:bg-neutral-200 dark:hover:bg-neutral-600">
                                        <i className="fa-regular fa-face-smile"></i>
                                    </button>
                                    {showPalette && <ReactionPalette onSelect={(emoji) => { onReact(emoji); setShowPalette(false); }} />}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatMessage;