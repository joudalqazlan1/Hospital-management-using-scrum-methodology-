import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Page, Patient, Role } from '../../types';
import api from '../../api/client';

export const RegisterPage = () => {
    const { navigate, setPatients, patients } = useAppContext();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        contactNumber: '',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (Object.values(formData).some(val => val === '')) {
            setError('All fields are required.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!validatePassword(formData.password)) {
            setError('Password must be at least 8 characters and include an uppercase letter, a number, and a special character.');
            return;
        }

        if (patients.some(p => p.email === formData.email)) {
            setError('An account with this email already exists.');
            return;
        }

        const newPatient: Patient = {
            id: `patient_${Date.now()}`,
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: Role.Patient,
            dateOfBirth: formData.dateOfBirth,
            contactNumber: formData.contactNumber,
        };

        try {
            // Save to database via API
            await api.auth.register({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                dateOfBirth: formData.dateOfBirth,
                contactNumber: formData.contactNumber,
                role: Role.Patient
            });

            // Also save to local state for immediate UI update
            setPatients(prev => [...prev, newPatient]);
            setSuccessMessage('Your account has been created successfully!');

            setTimeout(() => {
                navigate(Page.Login);
            }, 2000);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Failed to create account. Please try again.');
        }
    };
    
    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-primary-light flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-white rounded-xl shadow-2xl p-8 space-y-6">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800">Create Patient Account</h2>
                    <p className="text-gray-500 mt-2">Sign up to manage your appointments.</p>
                </div>
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
                {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">{successMessage}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700">Full Name <span className="text-red-500">*</span></label>
                        <input name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Email <span className="text-red-500">*</span></label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="text-sm font-medium text-gray-700">Password <span className="text-red-500">*</span></label>
                        <input name="password" type="password" value={formData.password} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700">Confirm Password <span className="text-red-500">*</span></label>
                        <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Date of Birth <span className="text-red-500">*</span></label>
                            <input name="dateOfBirth" type="date" max={today} value={formData.dateOfBirth} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Contact Number <span className="text-red-500">*</span></label>
                            <input name="contactNumber" type="tel" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                    </div>
                    <div>
                        <button type="submit" disabled={!!successMessage} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition duration-300 disabled:bg-gray-400">
                            Register
                        </button>
                    </div>
                </form>
                <div className="text-center">
                    <button
                        onClick={() => navigate(Page.Login)}
                        className="font-medium text-sm text-primary hover:text-primary-dark"
                    >
                        Already have an account? Login
                    </button>
                </div>
            </div>
        </div>
    );
};
