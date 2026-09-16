import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';

interface Message {
    id: string;
    sender: 'patient' | 'service';
    text: string;
    timestamp: string;
    patientId?: string;
}

export const CustomerServiceChat = () => {
    const { currentUser } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    // Load messages from localStorage on mount
    useEffect(() => {
        if (currentUser) {
            const chatKey = `chat_${currentUser.id}`;
            const savedMessages = localStorage.getItem(chatKey);
            if (savedMessages) {
                setMessages(JSON.parse(savedMessages));
            } else {
                // Initial welcome message
                const welcomeMsg: Message = {
                    id: '1',
                    sender: 'service',
                    text: 'Hello! How can I assist you today?',
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    patientId: currentUser.id
                };
                setMessages([welcomeMsg]);
                localStorage.setItem(chatKey, JSON.stringify([welcomeMsg]));
            }
        }
    }, [currentUser]);

    // Poll for new messages from customer service every 2 seconds
    useEffect(() => {
        if (!currentUser) return;

        const interval = setInterval(() => {
            const chatKey = `chat_${currentUser.id}`;
            const savedMessages = localStorage.getItem(chatKey);
            if (savedMessages) {
                const parsedMessages = JSON.parse(savedMessages);
                setMessages(parsedMessages);
            }
        }, 2000);

        return () => clearInterval(interval);
    }, [currentUser]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && currentUser) {
            // Add patient message
            const patientMsg: Message = {
                id: `msg_${Date.now()}`,
                sender: 'patient',
                text: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                patientId: currentUser.id
            };

            const updatedMessages = [...messages, patientMsg];
            setMessages(updatedMessages);

            // Save to localStorage
            const chatKey = `chat_${currentUser.id}`;
            localStorage.setItem(chatKey, JSON.stringify(updatedMessages));

            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-[600px]">
            <div className="bg-primary-dark text-white p-4 rounded-t-lg">
                <h2 className="text-xl font-semibold">Customer Service Chat</h2>
                <p className="text-sm text-gray-200">We're here to help!</p>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                                message.sender === 'patient'
                                    ? 'bg-primary text-white'
                                    : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                        >
                            <p className="text-sm">{message.text}</p>
                            <p
                                className={`text-xs mt-1 ${
                                    message.sender === 'patient' ? 'text-gray-200' : 'text-gray-500'
                                }`}
                            >
                                {message.timestamp}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Message Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t rounded-b-lg">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
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
        </div>
    );
};
