// Import React hooks and type definitions.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { PostData, User, Message } from '../types';
import ChatMessage from './ChatMessage';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// Define the props interface for the TeamChatPage component.
interface TeamChatPageProps {
    post: PostData;
    allUsers: { [key: string]: User };
    currentUser: User;
    onSendMessage: (teamId: number, message: Partial<Message>) => void;
    onViewProfile: (user: User) => void;
    onDeleteMessage: (teamId: number, messageId: number) => void;
    onEditMessage: (teamId: number, messageId: number, newText: string) => void;
    onReactToMessage: (teamId: number, messageId: number, emoji: string) => void;
}

type ChatItem = 
    | { type: 'message'; message: Message; isStartOfGroup: boolean }
    | { type: 'date_separator'; date: string };


// The TeamChatPage functional component.
const TeamChatPage: React.FC<TeamChatPageProps> = ({ 
    post, allUsers, currentUser, onSendMessage, onViewProfile,
    onDeleteMessage, onEditMessage, onReactToMessage 
}) => {
    const [newMessage, setNewMessage] = useState('');
    const [typingUser, setTypingUser] = useState<User | null>(null);
    const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
    const [deletingMessageId, setDeletingMessageId] = useState<number | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const prevChatLengthRef = useRef(post.chat?.length || 0);

    const teamMembers = useMemo(() => [
        allUsers[post.authorId],
        ...(post.teamMembers?.map(id => allUsers[id]) || [])
    ].filter((user, index, self): user is User => !!user && self.findIndex(u => u.id === user.id) === index), [post, allUsers]);

    // Effect to simulate a reply from another user
    useEffect(() => {
        const chat = post.chat || [];
        const currentChatLength = chat.length;

        // Check if a new message was added, and it was from the current user
        if (currentChatLength > prevChatLengthRef.current && chat[chat.length - 1]?.senderId === currentUser.id) {
            const otherMembers = teamMembers.filter(m => m.id !== currentUser.id);
            if (otherMembers.length > 0) {
                const replyingMember = otherMembers[Math.floor(Math.random() * otherMembers.length)];
                
                // Simulate typing
                setTypingUser(replyingMember);
                const typingTimeout = setTimeout(() => {
                    const responses = [
                        "Interesting point!", "I agree.", "Hmm, let me think about that.",
                        "That's a great idea.", "Could you elaborate?", "Got it.", "👍"
                    ];
                    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                    
                    onSendMessage(post.id, { senderId: replyingMember.id, text: randomResponse });
                    setTypingUser(null);
                }, Math.random() * 2000 + 1500); // Reply after 1.5 - 3.5 seconds

                return () => clearTimeout(typingTimeout);
            }
        }
        prevChatLengthRef.current = currentChatLength;
    }, [post.chat, currentUser.id, teamMembers, onSendMessage]);


    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [post.chat, typingUser]);

    const handleSend = () => {
        if (newMessage.trim()) {
            onSendMessage(post.id, { text: newMessage.trim() });
            setNewMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleSaveEdit = (messageId: number, newText: string) => {
        onEditMessage(post.id, messageId, newText);
        setEditingMessageId(null);
    };

    const handleDeleteConfirm = () => {
        if(deletingMessageId) {
            onDeleteMessage(post.id, deletingMessageId);
            setDeletingMessageId(null);
        }
    };

    const chatItems = useMemo((): ChatItem[] => {
        const items: ChatItem[] = [];
        let lastMessage: Message | null = null;
    
        const sortedChat = [...(post.chat || [])].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        sortedChat.forEach(message => {
            const messageDate = new Date(message.timestamp);
            const lastMessageDate = lastMessage ? new Date(lastMessage.timestamp) : null;
    
            // Add date separator if new day
            if (!lastMessageDate || messageDate.toDateString() !== lastMessageDate.toDateString()) {
                const today = new Date();
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                let dateString = messageDate.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                if (messageDate.toDateString() === today.toDateString()) {
                    dateString = 'Today';
                } else if (messageDate.toDateString() === yesterday.toDateString()) {
                    dateString = 'Yesterday';
                }
                items.push({ type: 'date_separator', date: dateString });
            }
    
            // Determine if it's the start of a new message group
            const isStartOfGroup = !lastMessage || 
                                   lastMessage.senderId !== message.senderId || 
                                   (messageDate.getTime() - new Date(lastMessage.timestamp).getTime()) > 5 * 60 * 1000; // 5 minutes threshold
    
            items.push({ type: 'message', message, isStartOfGroup });
            lastMessage = message;
        });
        return items;
    }, [post.chat]);

    return (
        <div className="flex w-full h-[calc(100vh-4rem)] bg-neutral-100 dark:bg-black">
            {/* Main Chat Area */}
            <div className="flex-grow relative bg-neutral-100 dark:bg-black">
                {/* Chat Header */}
                <div className="absolute top-4 left-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg z-10 p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <div className="flex items-center p-2">
                        <div>
                            <h1 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 truncate">{post.idea.title}</h1>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{teamMembers.length} members</p>
                        </div>
                    </div>
                </div>

                {/* Messages container */}
                <div className="h-full overflow-y-auto pt-24 pb-28">
                    <div className="p-4 space-y-1">
                        {chatItems.map((item, index) => {
                           if(item.type === 'date_separator') {
                               return (
                                <div key={`date-${index}`} className="text-center my-4 animate-slide-up-fade-in-chat">
                                    <span className="bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-semibold px-3 py-1 rounded-full">{item.date}</span>
                                </div>
                               )
                           }
                           // item is a message
                           return <ChatMessage 
                                key={item.message.id}
                                message={item.message}
                                sender={allUsers[item.message.senderId]}
                                currentUser={currentUser}
                                isStartOfGroup={item.isStartOfGroup}
                                onViewProfile={onViewProfile}
                                onEdit={setEditingMessageId}
                                onDelete={setDeletingMessageId}
                                onReact={(emoji) => onReactToMessage(post.id, item.message.id, emoji)}
                                isEditing={editingMessageId === item.message.id}
                                onSaveEdit={handleSaveEdit}
                                onCancelEdit={() => setEditingMessageId(null)}
                           />
                        })}
                        {typingUser && (
                             <div className="flex items-end gap-2 justify-start animate-slide-up-fade-in-chat">
                                <img src={typingUser.avatarUrl} alt={typingUser.name} className="w-8 h-8 rounded-full" />
                                <div className="p-3 rounded-xl bg-white dark:bg-[#3A3B3C] rounded-bl-none">
                                    <div className="flex items-center space-x-1">
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Message Input area */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-md shadow-lg z-10 p-2 border border-neutral-200 dark:border-neutral-800 rounded-xl">
                    <div className="p-2 flex items-end space-x-2">
                        <textarea
                            rows={1}
                            value={newMessage}
                            onChange={(e) => {
                                setNewMessage(e.target.value);
                                e.target.style.height = 'auto';
                                e.target.style.height = `${Math.min(e.target.scrollHeight, 128)}px`;
                            }}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="flex-grow bg-neutral-100 dark:bg-[#3A3B3C] text-neutral-800 dark:text-gray-200 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-accent resize-none max-h-32"
                        />
                        <button onClick={handleSend} disabled={!newMessage.trim()} className="bg-accent hover:bg-accent-hover text-accent-text-over rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Send message">
                            <i className="fa-solid fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <DeleteConfirmationModal 
                isOpen={!!deletingMessageId}
                onClose={() => setDeletingMessageId(null)}
                onConfirm={handleDeleteConfirm}
                title="Delete Message"
                message="Are you sure you want to permanently delete this message?"
            />
        </div>
    );
};

export default TeamChatPage;