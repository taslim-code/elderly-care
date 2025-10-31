
import React, { useState, useRef, useEffect } from 'react';
import type { ChatConversation, ChatMessage } from '../types';
import { LockClosedIcon, PhoneIcon, VideoCameraIcon, TrashIcon } from '../components/icons/Icons';

interface ChatsPageProps {
    conversations: ChatConversation[];
    setConversations: React.Dispatch<React.SetStateAction<ChatConversation[]>>;
    currentUserId: string;
}

const ChatsPage: React.FC<ChatsPageProps> = ({ conversations, setConversations, currentUserId }) => {
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(conversations[0] || null);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?.messages]);

    useEffect(() => {
        // If the selected conversation is updated externally (e.g., doctor sends a message),
        // update the view.
        if (selectedConversation) {
            const updatedConvo = conversations.find(c => c.id === selectedConversation.id);
            if (updatedConvo) {
                setSelectedConversation(updatedConvo);
            }
        }
    }, [conversations, selectedConversation]);


    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedConversation) return;

        const message: ChatMessage = {
            id: `msg-${Date.now()}`,
            text: newMessage,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true,
        };
        
        const updatedConversation = {
            ...selectedConversation,
            messages: [...selectedConversation.messages, message],
            lastMessage: `You: ${newMessage}`,
            lastMessageTimestamp: 'Just now',
        };

        const updatedConversations = conversations.map(c => 
            c.id === selectedConversation.id ? updatedConversation : c
        );

        setConversations(updatedConversations);
        setSelectedConversation(updatedConversation);
        setNewMessage('');
    };

    const handleDeleteConversation = (convoId: string) => {
        if (selectedConversation?.id === convoId) {
            setSelectedConversation(null);
        }
        setConversations(currentConversations =>
            currentConversations.filter(c => c.id !== convoId)
        );
    };

    const handleCall = (phone?: string) => {
        if (phone) {
            window.location.href = `tel:${phone}`;
        }
    };

    return (
        <div className="flex h-full max-h-[calc(100vh-80px)]">
            {/* Sidebar with conversations */}
            <div className="w-1/3 min-w-[300px] bg-white rounded-l-2xl shadow-lg flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-3xl font-bold text-gray-800">Chats</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.map(convo => (
                         <div key={convo.id} className="relative group border-b">
                            <button 
                                onClick={() => setSelectedConversation(convo)}
                                className={`w-full text-left p-4 flex items-center space-x-4 hover:bg-gray-50 ${selectedConversation?.id === convo.id ? 'bg-teal-50' : ''}`}
                            >
                                <img src={convo.participantImageUrl} alt={convo.participantName} className="w-14 h-14 rounded-full" />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-bold text-lg text-gray-800 truncate">{convo.participantName}</p>
                                        <p className="text-xs text-gray-500 whitespace-nowrap">{convo.lastMessageTimestamp}</p>
                                    </div>
                                    <p className="text-md text-gray-600 truncate">{convo.lastMessage}</p>
                                </div>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteConversation(convo.id);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 text-gray-600 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all duration-200"
                                aria-label={`Delete conversation with ${convo.participantName}`}
                                title={`Delete conversation with ${convo.participantName}`}
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main chat window */}
            <div className="w-2/3 flex flex-col bg-gray-100 rounded-r-2xl shadow-inner">
                {selectedConversation ? (
                    <>
                        <div className="p-4 bg-white border-b border-gray-200 rounded-tr-2xl flex justify-between items-center shadow-sm">
                            <div className="flex items-center space-x-4">
                                <img src={selectedConversation.participantImageUrl} alt={selectedConversation.participantName} className="w-12 h-12 rounded-full" />
                                <div>
                                    <p className="font-bold text-xl text-gray-800">{selectedConversation.participantName}</p>
                                    <p className="text-sm text-green-600">Online</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => handleCall(selectedConversation.participantPhone)}
                                    disabled={!selectedConversation.participantPhone}
                                    title={selectedConversation.participantPhone ? `Call ${selectedConversation.participantName}` : 'Phone number not available'}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    <PhoneIcon className="h-6 w-6" />
                                </button>
                                <button
                                    onClick={() => handleCall(selectedConversation.participantPhone)}
                                    disabled={!selectedConversation.participantPhone}
                                    title={selectedConversation.participantPhone ? `Video call ${selectedConversation.participantName}` : 'Phone number not available'}
                                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    <VideoCameraIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 p-6 overflow-y-auto">
                            <div className="flex flex-col space-y-4">
                                {selectedConversation.messages.map(msg => (
                                    <div key={msg.id} className={`flex items-end space-x-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-md p-3 rounded-2xl ${msg.isMe ? 'bg-teal-600 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none'}`}>
                                            <p>{msg.text}</p>
                                            <p className={`text-xs mt-1 ${msg.isMe ? 'text-teal-100' : 'text-gray-400'} text-right`}>{msg.timestamp}</p>
                                        </div>
                                    </div>
                                ))}
                                 <div ref={messagesEndRef} />
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-gray-200">
                             <div className="flex items-center justify-center text-xs text-gray-500 mb-2">
                                <LockClosedIcon className="h-3 w-3 mr-1" />
                                <span>End-to-end encrypted</span>
                            </div>
                            <form onSubmit={handleSendMessage} className="flex items-center space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 bg-gray-100 border-2 border-transparent focus:border-teal-500 rounded-full px-5 py-3 text-lg focus:outline-none"
                                />
                                <button type="submit" className="bg-teal-600 text-white rounded-full p-3 hover:bg-teal-700 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                        <h3 className="mt-4 text-2xl font-semibold">Select a conversation</h3>
                        <p className="mt-1 text-lg">Start chatting with your friends and doctors.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatsPage;