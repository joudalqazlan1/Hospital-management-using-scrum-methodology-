import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LogoutIcon } from '../../components/icons';

export const MarketingDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        message: '',
        targetAudience: 'all'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setShowSuccess(true);

        setFormData({
            subject: '',
            message: '',
            targetAudience: 'all'
        });

        setTimeout(() => {
            setShowSuccess(false);
        }, 5000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-dark">
                            Marketing Dashboard
                        </h1>
                        <div className="flex items-center">
                            <span className="hidden sm:inline text-gray-700 mr-4">Welcome, <strong>{currentUser?.fullName}</strong>!</span>
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
                {showSuccess && (
                    <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-green-700 font-medium">
                                Success! Your promotional email campaign has been sent to all selected patients.
                            </p>
                        </div>
                    </div>
                )}

                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Promotional Email Campaign</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="targetAudience" className="block text-sm font-medium text-gray-700 mb-2">
                                Target Audience
                            </label>
                            <select
                                id="targetAudience"
                                name="targetAudience"
                                value={formData.targetAudience}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            >
                                <option value="all">All Patients</option>
                                <option value="active">Active Patients Only</option>
                                <option value="new">New Patients (Last 3 Months)</option>
                                <option value="inactive">Inactive Patients</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                placeholder="e.g., Special Offer: 20% Off Annual Checkup"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                placeholder="Enter your promotional message here..."
                                rows={8}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                required
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                Write a compelling message to engage patients with your promotional offer.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors duration-300 shadow-md hover:shadow-lg"
                            >
                                Send Email Campaign
                            </button>
                        </div>
                    </form>
                </div>

                <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h3 className="text-blue-800 font-semibold mb-1">Campaign Guidelines</h3>
                            <ul className="text-blue-700 text-sm space-y-1">
                                <li>• Keep subject lines concise and engaging (under 50 characters)</li>
                                <li>• Personalize your message to increase patient engagement</li>
                                <li>• Include a clear call-to-action</li>
                                <li>• Ensure compliance with healthcare marketing regulations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
