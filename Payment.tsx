import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Page, PaymentInfo } from '../../types';

export const Payment = () => {
    const { navigate, currentUser, paymentMethods, setPaymentMethods } = useAppContext();
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: '',
        paymentMethod: 'Visa' as 'Visa' | 'Mada' | 'ApplePay'
    });
    const [errors, setErrors] = useState({
        cardNumber: '',
        cardHolderName: '',
        expiryDate: '',
        cvv: ''
    });
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    // Format card number with spaces every 4 digits
    const formatCardNumber = (value: string): string => {
        const cleaned = value.replace(/\s/g, '');
        const groups = cleaned.match(/.{1,4}/g);
        return groups ? groups.join(' ') : cleaned;
    };

    // Format expiry date as MM/YY
    const formatExpiryDate = (value: string): string => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length >= 2) {
            return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
        }
        return cleaned;
    };

    const validateCardNumber = (cardNumber: string): string => {
        const cleaned = cardNumber.replace(/\s/g, '');

        if (!cleaned) {
            return 'Card number is required';
        }

        if (!/^\d+$/.test(cleaned)) {
            return 'Card number must contain only digits';
        }

        if (cleaned.length !== 16) {
            return 'Card number must be 16 digits';
        }

        return '';
    };

    const validateCardHolderName = (name: string): string => {
        if (!name.trim()) {
            return 'Cardholder name is required';
        }

        if (name.trim().length < 3) {
            return 'Name must be at least 3 characters';
        }

        if (!/^[a-zA-Z\s]+$/.test(name)) {
            return 'Name must contain only letters and spaces';
        }

        return '';
    };

    const validateExpiryDate = (expiryDate: string): string => {
        if (!expiryDate) {
            return 'Expiry date is required';
        }

        const [month, year] = expiryDate.split('/');

        if (!month || !year) {
            return 'Invalid format. Use MM/YY';
        }

        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        if (monthNum < 1 || monthNum > 12) {
            return 'Invalid month. Must be 01-12';
        }

        // Check if card is expired
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100; // Get last 2 digits
        const currentMonth = currentDate.getMonth() + 1;

        if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
            return 'Card has expired';
        }

        return '';
    };

    const validateCVV = (cvv: string): string => {
        if (!cvv) {
            return 'CVV is required';
        }

        if (!/^\d{3,4}$/.test(cvv)) {
            return 'CVV must be 3 or 4 digits';
        }

        return '';
    };

    const handleCardNumberChange = (value: string) => {
        const cleaned = value.replace(/\s/g, '');
        if (cleaned.length <= 16 && /^\d*$/.test(cleaned)) {
            const formatted = formatCardNumber(cleaned);
            setFormData(prev => ({ ...prev, cardNumber: formatted }));
            if (errors.cardNumber) {
                setErrors(prev => ({ ...prev, cardNumber: '' }));
            }
        }
    };

    const handleExpiryDateChange = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.length <= 4) {
            const formatted = formatExpiryDate(cleaned);
            setFormData(prev => ({ ...prev, expiryDate: formatted }));
            if (errors.expiryDate) {
                setErrors(prev => ({ ...prev, expiryDate: '' }));
            }
        }
    };

    const handleCVVChange = (value: string) => {
        if (value.length <= 4 && /^\d*$/.test(value)) {
            setFormData(prev => ({ ...prev, cvv: value }));
            if (errors.cvv) {
                setErrors(prev => ({ ...prev, cvv: '' }));
            }
        }
    };

    const handleNameChange = (value: string) => {
        setFormData(prev => ({ ...prev, cardHolderName: value }));
        if (errors.cardHolderName) {
            setErrors(prev => ({ ...prev, cardHolderName: '' }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const cardNumberError = validateCardNumber(formData.cardNumber);
        const nameError = validateCardHolderName(formData.cardHolderName);
        const expiryError = validateExpiryDate(formData.expiryDate);
        const cvvError = validateCVV(formData.cvv);

        setErrors({
            cardNumber: cardNumberError,
            cardHolderName: nameError,
            expiryDate: expiryError,
            cvv: cvvError
        });

        // If any errors exist, set submission status to error
        if (cardNumberError || nameError || expiryError || cvvError) {
            setSubmissionStatus('error');
            return;
        }

        // All validations passed - save payment info
        if (currentUser) {
            const newPayment: PaymentInfo = {
                id: `pay_${Date.now()}`,
                patientId: currentUser.id,
                cardNumber: formData.cardNumber,
                cardHolderName: formData.cardHolderName,
                expiryDate: formData.expiryDate,
                cvv: formData.cvv,
                paymentMethod: formData.paymentMethod,
                amount: 100, // Demo amount
                paymentDate: new Date().toISOString(),
                status: 'Success'
            };

            // Save to local state for UI display - add to existing payment methods
            setPaymentMethods([...paymentMethods, newPayment]);

            setSubmissionStatus('success');
        }
    };

    const handleReset = () => {
        setFormData({
            cardNumber: '',
            cardHolderName: '',
            expiryDate: '',
            cvv: '',
            paymentMethod: 'Visa'
        });
        setErrors({
            cardNumber: '',
            cardHolderName: '',
            expiryDate: '',
            cvv: ''
        });
        setSubmissionStatus('idle');
    };

    if (submissionStatus === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8 text-center">
                    <div className="mb-6">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Payment Method Saved!</h2>
                        <p className="text-gray-600 mb-4">Your payment method has been saved successfully.</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-3">Payment Details:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Payment Method:</span>
                                <span className="font-medium text-gray-800">{formData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Card Number:</span>
                                <span className="font-medium text-gray-800">**** **** **** {formData.cardNumber.slice(-4)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Cardholder:</span>
                                <span className="font-medium text-gray-800">{formData.cardHolderName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Expiry Date:</span>
                                <span className="font-medium text-gray-800">{formData.expiryDate}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold">Next Step:</span> Add your insurance information (optional) before booking appointments.
                        </p>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => navigate(Page.InsuranceVerification)}
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                        >
                            Add Insurance Information
                        </button>
                        <button
                            onClick={() => navigate(Page.PatientDashboard)}
                            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get existing payment method for current user
    const existingPayment = currentUser
        ? paymentMethods.find(pay => pay.patientId === currentUser.id)
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-light to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl flex gap-6">
                {/* Existing Payment Card (shown on the left if exists) */}
                {existingPayment && (
                    <div className="w-72 bg-white rounded-xl shadow-2xl p-6">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">Saved Card</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Card Number</p>
                                <p className="text-sm font-semibold text-gray-800">**** **** **** {existingPayment.cardNumber.replace(/\s/g, '').slice(-4)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Cardholder Name</p>
                                <p className="text-sm font-semibold text-gray-800">{existingPayment.cardHolderName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Expiry Date</p>
                                <p className="text-sm font-semibold text-gray-800">{existingPayment.expiryDate}</p>
                            </div>
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-xs text-gray-500">Added on {new Date(existingPayment.paymentDate).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Form */}
                <div className="flex-1 bg-white rounded-xl shadow-2xl p-8">
                <div className="mb-6">
                    <button
                        onClick={() => navigate(Page.PatientDashboard)}
                        className="text-primary hover:text-primary-dark font-medium mb-4 flex items-center"
                    >
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Dashboard
                    </button>
                    <h2 className="text-3xl font-bold text-gray-800">Payment</h2>
                    <p className="text-gray-500 mt-2">Enter your payment details</p>
                </div>

                {submissionStatus === 'error' && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6" role="alert">
                        <p className="font-medium">Validation Error</p>
                        <p className="text-sm">Please correct the errors below and try again.</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Card Number *
                        </label>
                        <input
                            id="cardNumber"
                            type="text"
                            value={formData.cardNumber}
                            onChange={(e) => handleCardNumberChange(e.target.value)}
                            className={`w-full px-4 py-2 border ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                        />
                        {errors.cardNumber && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardNumber}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">16 digits</p>
                    </div>

                    <div>
                        <label htmlFor="cardHolderName" className="block text-sm font-medium text-gray-700 mb-1">
                            Cardholder Name *
                        </label>
                        <input
                            id="cardHolderName"
                            type="text"
                            value={formData.cardHolderName}
                            onChange={(e) => handleNameChange(e.target.value)}
                            className={`w-full px-4 py-2 border ${errors.cardHolderName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                            placeholder="John Doe"
                        />
                        {errors.cardHolderName && (
                            <p className="text-red-500 text-sm mt-1">{errors.cardHolderName}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">Name as shown on card</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                Expiry Date *
                            </label>
                            <input
                                id="expiryDate"
                                type="text"
                                value={formData.expiryDate}
                                onChange={(e) => handleExpiryDateChange(e.target.value)}
                                className={`w-full px-4 py-2 border ${errors.expiryDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                placeholder="MM/YY"
                                maxLength={5}
                            />
                            {errors.expiryDate && (
                                <p className="text-red-500 text-sm mt-1">{errors.expiryDate}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                                CVV *
                            </label>
                            <input
                                id="cvv"
                                type="text"
                                value={formData.cvv}
                                onChange={(e) => handleCVVChange(e.target.value)}
                                className={`w-full px-4 py-2 border ${errors.cvv ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent`}
                                placeholder="123"
                                maxLength={4}
                            />
                            {errors.cvv && (
                                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
                            )}
                        </div>
                    </div>

                    {/* Payment Method Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                            Payment Method *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Visa' }))}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                    formData.paymentMethod === 'Visa'
                                        ? 'border-primary bg-primary-light shadow-md'
                                        : 'border-gray-300 hover:border-primary'
                                }`}
                            >
                                <div className="text-center">
                                    <svg className="h-10 mx-auto mb-2" viewBox="0 0 48 32" fill="none">
                                        <rect width="48" height="32" rx="4" fill="#1434CB"/>
                                        <text x="24" y="20" fontSize="12" fill="white" textAnchor="middle" fontWeight="bold">VISA</text>
                                    </svg>
                                    <div className="text-sm font-medium">Visa</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'Mada' }))}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                    formData.paymentMethod === 'Mada'
                                        ? 'border-primary bg-primary-light shadow-md'
                                        : 'border-gray-300 hover:border-primary'
                                }`}
                            >
                                <div className="text-center">
                                    <svg className="h-10 mx-auto mb-2" viewBox="0 0 48 32" fill="none">
                                        <rect width="48" height="32" rx="4" fill="#00A651"/>
                                        <text x="24" y="20" fontSize="10" fill="white" textAnchor="middle" fontWeight="bold">mada</text>
                                    </svg>
                                    <div className="text-sm font-medium">Mada</div>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'ApplePay' }))}
                                className={`p-4 border-2 rounded-lg transition-all ${
                                    formData.paymentMethod === 'ApplePay'
                                        ? 'border-primary bg-primary-light shadow-md'
                                        : 'border-gray-300 hover:border-primary'
                                }`}
                            >
                                <div className="text-center">
                                    <svg className="h-10 mx-auto mb-2" viewBox="0 0 48 32" fill="none">
                                        <rect width="48" height="32" rx="4" fill="#000000"/>
                                        <path d="M14 16c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4zm8 0c0-1.1-.4-2.1-1.1-2.8.7-.7 1.8-1.2 2.8-1.2 2.2 0 4 1.8 4 4s-1.8 4-4 4c-1 0-2-.4-2.8-1.1.7-.8 1.1-1.8 1.1-2.9z" fill="white"/>
                                        <text x="34" y="21" fontSize="7" fill="white" textAnchor="middle" fontWeight="500">Pay</text>
                                    </svg>
                                    <div className="text-sm font-medium">Apple Pay</div>
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300"
                        >
                            Save Payment Method
                        </button>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                        <span className="font-semibold">Note:</span> Payment card validation demo. Only last 4 digits are displayed for security.
                    </p>
                </div>
                </div>
            </div>
        </div>
    );
};
