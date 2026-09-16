import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LogoutIcon } from '../../components/icons';

interface ChatSession {
    id: string;
    patientName: string;
    patientId: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    status: 'active' | 'resolved';
}

interface Message {
    id: string;
    sender: 'patient' | 'service';
    text: string;
    timestamp: string;
}

const sampleMessages = [
    'I need help with my appointment',
    'Can you help me with my medical records?',
    'I have a question about my insurance',
    'When are my lab results ready?',
    'I need to reschedule my appointment',
    'How can I access my prescriptions?'
];

export const CustomerServiceDashboard = () => {
    const { currentUser, logout, patients } = useAppContext();
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [replyMessage, setReplyMessage] = useState('');
    const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);

    // Generate chat sessions from real patient data
    useEffect(() => {
        if (patients.length > 0) {
            const sessions: ChatSession[] = patients.slice(0, 10).map((patient, index) => {
                const randomMessage = sampleMessages[index % sampleMessages.length];
                const randomHour = 9 + Math.floor(Math.random() * 4);
                const randomMinute = Math.floor(Math.random() * 60);
                const timestamp = `${randomHour}:${randomMinute.toString().padStart(2, '0')} AM`;
                const isActive = index % 3 !== 2; // Most chats active, some resolved

                return {
                    id: `chat_${patient.id}`,
                    patientName: patient.fullName,
                    patientId: patient.id,
                    lastMessage: randomMessage,
                    timestamp,
                    unreadCount: isActive ? Math.floor(Math.random() * 3) : 0,
                    status: isActive ? 'active' : 'resolved'
                };
            });
            setChatSessions(sessions);
        }
    }, [patients]);

    // Load messages from localStorage for each patient
    const [messages, setMessages] = useState<Record<string, Message[]>>({});

    useEffect(() => {
        if (chatSessions.length > 0) {
            const loadedMessages: Record<string, Message[]> = {};

            chatSessions.forEach((session) => {
                const chatKey = `chat_${session.patientId}`;
                const savedMessages = localStorage.getItem(chatKey);

                if (savedMessages) {
                    // Load existing messages from localStorage
                    loadedMessages[session.id] = JSON.parse(savedMessages);
                } else {
                    // Generate initial messages if none exist
                    const chatMessages: Message[] = [
                        {
                            id: `msg_${session.id}_1`,
                            sender: 'patient',
                            text: session.lastMessage,
                            timestamp: session.timestamp
                        }
                    ];

                    // Add follow-up messages for some chats
                    if (session.status === 'resolved') {
                        chatMessages.push({
                            id: `msg_${session.id}_2`,
                            sender: 'service',
                            text: 'I can help you with that. Let me check your account.',
                            timestamp: session.timestamp
                        });
                        chatMessages.push({
                            id: `msg_${session.id}_3`,
                            sender: 'patient',
                            text: 'Thank you for your help!',
                            timestamp: session.timestamp
                        });
                    } else if (session.unreadCount > 1) {
                        chatMessages.push({
                            id: `msg_${session.id}_2`,
                            sender: 'patient',
                            text: 'Can someone please assist me?',
                            timestamp: session.timestamp
                        });
                    }

                    loadedMessages[session.id] = chatMessages;
                    // Save initial messages to localStorage
                    localStorage.setItem(chatKey, JSON.stringify(chatMessages));
                }
            });

            setMessages(loadedMessages);
        }
    }, [chatSessions]);

    // Poll localStorage for updates every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (chatSessions.length > 0) {
                const refreshedMessages: Record<string, Message[]> = {};
                chatSessions.forEach((session) => {
                    const chatKey = `chat_${session.patientId}`;
                    const savedMessages = localStorage.getItem(chatKey);
                    if (savedMessages) {
                        refreshedMessages[session.id] = JSON.parse(savedMessages);
                    }
                });
                setMessages(refreshedMessages);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [chatSessions]);

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (replyMessage.trim() && activeChatId) {
            const activeSession = chatSessions.find(s => s.id === activeChatId);
            if (!activeSession) return;

            // Add message to the chat
            const newMessage: Message = {
                id: `msg_${Date.now()}`,
                sender: 'service',
                text: replyMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };

            const updatedMessages = [...(messages[activeChatId] || []), newMessage];

            setMessages(prev => ({
                ...prev,
                [activeChatId]: updatedMessages
            }));

            // Save to localStorage so patient can see it
            const chatKey = `chat_${activeSession.patientId}`;
            localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

            // Clear unread count for this chat
            setChatSessions(chatSessions.map(chat =>
                chat.id === activeChatId ? { ...chat, unreadCount: 0 } : chat
            ));

            setReplyMessage('');
        }
    };

    const handleResolveChat = (chatId: string) => {
        setChatSessions(chatSessions.map(chat =>
            chat.id === chatId ? { ...chat, status: 'resolved' as const, unreadCount: 0 } : chat
        ));
    };

    const activeChat = chatSessions.find(chat => chat.id === activeChatId);
    const currentMessages = activeChatId ? messages[activeChatId] || [] : [];

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-dark">
                            Customer Service Dashboard
                        </h1>
                        <div className="flex items-center">
                            <span className="hidden sm:inline text-gray-700 mr-4">
                                Welcome, <strong>{currentUser?.fullName}</strong>!
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center text-gray-600 hover:text-primary-dark transition-colors duration-300"
                                aria-label="Logout"
                            >
                                <LogoutIcon className="w-6 h-6" />
                                <span className="ml-2 hidden md:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-3 h-[700px]">
                        {/* Chat Sessions List */}
                        <div className="md:col-span-1 border-r border-gray-200 overflow-y-auto">
                            <div className="p-4 bg-primary-dark text-white">
                                <h2 className="text-lg font-semibold">Patient Chats</h2>
                                <p className="text-sm text-gray-200">
                                    {chatSessions.filter(c => c.status === 'active').length} active conversations
                                </p>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {chatSessions.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        <p>No patient chats available</p>
                                        <p className="text-xs mt-1">Patients will appear here once they register</p>
                                    </div>
                                ) : (
                                    chatSessions.map((chat) => (
                                        <div
                                            key={chat.id}
                                            onClick={() => setActiveChatId(chat.id)}
                                            className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                                                activeChatId === chat.id ? 'bg-primary-light' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-gray-800">{chat.patientName}</h3>
                                                {chat.unreadCount > 0 && (
                                                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                                                        {chat.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-xs text-gray-500">{chat.timestamp}</span>
                                                <span
                                                    className={`text-xs px-2 py-1 rounded ${
                                                        chat.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {chat.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Chat Messages Area */}
                        <div className="md:col-span-2 flex flex-col">
                            {activeChatId && activeChat ? (
                                <>
                                    {/* Chat Header */}
                                    <div className="p-4 border-b border-gray-200 bg-white">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-semibold text-gray-800">{activeChat.patientName}</h3>
                                                <p className="text-sm text-gray-500">Patient ID: {activeChat.patientId}</p>
                                            </div>
                                            {activeChat.status === 'active' && (
                                                <button
                                                    onClick={() => handleResolveChat(activeChatId)}
                                                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors text-sm"
                                                >
                                                    Mark as Resolved
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                                        {currentMessages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${
                                                    message.sender === 'service' ? 'justify-end' : 'justify-start'
                                                }`}
                                            >
                                                <div
                                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                                                        message.sender === 'service'
                                                            ? 'bg-primary text-white'
                                                            : 'bg-white text-gray-800 border border-gray-200'
                                                    }`}
                                                >
                                                    <p className="text-sm">{message.text}</p>
                                                    <p
                                                        className={`text-xs mt-1 ${
                                                            message.sender === 'service'
                                                                ? 'text-gray-200'
                                                                : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {message.timestamp}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Reply Input */}
                                    <form onSubmit={handleSendReply} className="p-4 border-t border-gray-200 bg-white">
                                        <div className="flex space-x-2">
                                            <input
                                                type="text"
                                                value={replyMessage}
                                                onChange={(e) => setReplyMessage(e.target.value)}
                                                placeholder="Type your reply..."
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                            />
                                            <button
                                                type="submit"
                                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="flex-1 flex items-center justify-center bg-gray-50">
                                    <div className="text-center text-gray-500">
                                        <svg
                                            className="w-16 h-16 mx-auto mb-4 text-gray-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                                            />
                                        </svg>
                                        <p className="text-lg">Select a chat to start messaging</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
