import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Page, InsuranceInfo } from '../../types';
import api from '../../api/client';

export const InsuranceVerification = () => {
    const { navigate, currentUser, insuranceRecords, setInsuranceRecords } = useAppContext();
    const [formData, setFormData] = useState({
        insuranceId: '',
        companyName: ''
    });
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'verifying' | 'accepted' | 'rejected'>('idle');
    const [message, setMessage] = useState('');
    const [discountPercentage, setDiscountPercentage] = useState(0);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setMessage('');
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.insuranceId.trim()) {
            setMessage('Please enter your Insurance ID Number');
            return;
        }

        if (!formData.companyName.trim()) {
            setMessage('Please enter your Insurance Company Name');
            return;
        }

        setVerificationStatus('verifying');
        setMessage('');

        try {
            // Check if insurance company is supported
            const response = await api.insurance.checkSupported(formData.companyName);

            if (response.isSupported) {
                // Insurance is accepted
                setVerificationStatus('accepted');
                setDiscountPercentage(response.discountPercentage || 20); // Default 20% discount

                // Save insurance info to database
                if (currentUser) {
                    const insuranceData = {
                        patientId: currentUser.id,
                        provider: formData.companyName,
                        policyNumber: formData.insuranceId,
                        expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 year from now
                        isActive: true
                    };

                    await api.insurance.create(insuranceData);

                    // Update local context
                    const newInsurance: InsuranceInfo = {
                        id: `ins_${Date.now()}`,
                        patientId: currentUser.id,
                        provider: formData.companyName,
                        policyNumber: formData.insuranceId,
                        expirationDate: insuranceData.expirationDate,
                        isActive: true,
                        createdAt: new Date().toISOString()
                    };

                    const updatedRecords = insuranceRecords.filter(ins => ins.patientId !== currentUser.id);
                    setInsuranceRecords([...updatedRecords, newInsurance]);
                }
            } else {
                // Insurance is rejected
                setVerificationStatus('rejected');
            }
        } catch (error) {
            console.error('Error verifying insurance:', error);
            setMessage('Error connecting to insurance verification system. Please try again.');
            setVerificationStatus('idle');
        }
    };

    const handleReset = () => {
        setFormData({
            insuranceId: '',
            companyName: ''
        });
        setVerificationStatus('idle');
        setMessage('');
        setDiscountPercentage(0);
    };

    // Get existing insurance for current user
    const existingInsurance = currentUser
        ? insuranceRecords.find(ins => ins.patientId === currentUser.id && ins.isActive)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="mb-6 text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Insurance Verification</h1>
                    <p className="text-gray-600">Verify your insurance coverage and get instant approval</p>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <button
                        onClick={() => navigate(Page.PatientDashboard)}
                        className="text-primary hover:text-primary-dark font-medium mb-6 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>

                    {/* Show existing insurance if available */}
                    {existingInsurance && verificationStatus === 'idle' && (
                        <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-xl p-5">
                            <div className="flex items-start">
                                <svg className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="flex-1">
                                    <h3 className="font-bold text-green-800 text-lg mb-2">Active Insurance Found</h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-green-700 font-medium">Company:</p>
                                            <p className="text-green-900 font-semibold">{existingInsurance.provider}</p>
                                        </div>
                                        <div>
                                            <p className="text-green-700 font-medium">ID Number:</p>
                                            <p className="text-green-900 font-semibold">{existingInsurance.policyNumber}</p>
                                        </div>
                                    </div>
                                    <p className="text-green-600 text-sm mt-2">Your insurance will automatically apply discounts to your bills.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verification Form */}
                    {verificationStatus === 'idle' && (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <label htmlFor="insuranceId" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Insurance ID Number
                                </label>
                                <input
                                    id="insuranceId"
                                    type="text"
                                    value={formData.insuranceId}
                                    onChange={(e) => handleInputChange('insuranceId', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                                    placeholder="Enter your insurance ID"
                                />
                            </div>

                            <div>
                                <label htmlFor="companyName" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Insurance Company Name
                                </label>
                                <input
                                    id="companyName"
                                    type="text"
                                    value={formData.companyName}
                                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                                    placeholder="e.g., Bupa, Tawuniya, Medgulf"
                                />
                            </div>

                            {message && (
                                <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
                                    <p className="text-sm font-medium">{message}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 text-lg"
                            >
                                Verify Insurance
                            </button>
                        </form>
                    )}

                    {/* Verifying State */}
                    {verificationStatus === 'verifying' && (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-primary mb-4"></div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Verifying Insurance...</h3>
                            <p className="text-gray-600 mb-2">Checking if <strong className="text-primary">{formData.companyName}</strong> is supported by the hospital</p>
                            <p className="text-sm text-gray-500">Please wait while we verify your insurance details</p>
                        </div>
                    )}

                    {/* Accepted Response */}
                    {verificationStatus === 'accepted' && (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold text-green-600 mb-3">Insurance Accepted!</h2>
                            <p className="text-gray-700 text-lg mb-6">
                                Your insurance with <strong>{formData.companyName}</strong> has been verified and accepted.
                            </p>

                            <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-left mb-4">
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">Insurance Company</p>
                                        <p className="text-lg font-bold text-green-900">{formData.companyName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-700 font-medium">ID Number</p>
                                        <p className="text-lg font-bold text-green-900">{formData.insuranceId}</p>
                                    </div>
                                </div>

                                <div className="bg-white rounded-lg p-4 border-2 border-green-400">
                                    <p className="text-sm text-gray-600 mb-1">Your Discount</p>
                                    <p className="text-4xl font-bold text-green-600">{discountPercentage}%</p>
                                    <p className="text-sm text-gray-600 mt-1">Off your total bill amount</p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Note:</strong> This discount will be automatically applied when you book appointments and make payments.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate(Page.PatientDashboard)}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                                >
                                    Continue to Dashboard
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300"
                                >
                                    Verify Another Insurance
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rejected Response */}
                    {verificationStatus === 'rejected' && (
                        <div className="text-center py-8">
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>

                            <h2 className="text-3xl font-bold text-red-600 mb-3">Insurance Not Accepted</h2>
                            <p className="text-gray-700 text-lg mb-6">
                                Unfortunately, <strong>{formData.companyName}</strong> is not currently accepted at our hospital.
                            </p>

                            <div className="bg-red-50 border-2 border-red-300 rounded-xl p-6 mb-6 text-left">
                                <h3 className="font-bold text-red-800 mb-3">What you can do:</h3>
                                <ul className="space-y-2 text-gray-700">
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>Contact our billing department for alternative payment options</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>Try a different insurance company if you have multiple policies</span>
                                    </li>
                                    <li className="flex items-start">
                                        <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                        <span>Proceed with self-payment (no discount)</span>
                                    </li>
                                </ul>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={handleReset}
                                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition duration-300"
                                >
                                    Try Different Insurance
                                </button>
                                <button
                                    onClick={() => navigate(Page.PatientDashboard)}
                                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-lg transition duration-300"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
