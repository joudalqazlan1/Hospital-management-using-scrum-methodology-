import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Staff, Role } from '../../types';

export const AddAdmin = () => {
    const { staff, setStaff } = useAppContext();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!formData.fullName || !formData.email || !formData.password) {
            setMessage('All fields are required.');
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage('Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.');
            return;
        }

        const newAdmin: Staff = {
            id: `admin_${Date.now()}`,
            fullName: formData.fullName,
            email: formData.email,
            password: formData.password,
            role: Role.Admin,
            department: 'Administration',
            contactNumber: 'N/A',
        };

        setStaff([...staff, newAdmin]);
        setMessage('Admin account created successfully!');
        setFormData({ fullName: '', email: '', password: '' });
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Create New Admin Account</h2>
            {message && <div className={`p-4 mb-4 text-sm rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Set a strong password" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-300">
                    Create Admin
                </button>
            </form>
        </div>
    );
};