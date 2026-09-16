import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Staff, Role } from '../../types';
import api from '../../api/client';

export const AddStaff = () => {
    const { refreshData } = useAppContext();
    const [formData, setFormData] = useState({
        fullName: '',
        role: Role.Doctor,
        department: 'Cardiology',
        contactNumber: '',
        email: '',
        password: '',
    });
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validatePassword = (password: string) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!formData.fullName || !formData.department || !formData.contactNumber || !formData.email || !formData.password) {
            setMessage('All fields are required.');
            return;
        }

        if (!validatePassword(formData.password)) {
            setMessage('Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.');
            return;
        }

        try {
            await api.staff.add({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department,
                contactNumber: formData.contactNumber,
            });

            // Refresh data from database
            await refreshData();

            setMessage(`${formData.role} added successfully!`);
            setFormData({ fullName: '', role: Role.Doctor, department: 'Cardiology', contactNumber: '', email: '', password: '' });
        } catch (error) {
            console.error('Error adding staff:', error);
            setMessage('Failed to add staff member. Please try again.');
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Staff Member</h2>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        <option value={Role.Doctor}>Doctor</option>
                        <option value={Role.LabTechnician}>Lab Technician</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <select name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary">
                        <option>Cardiology</option>
                        <option>Pediatrics</option>
                        <option>Neurology</option>
                        <option>Radiology</option>
                        <option>Orthopedics</option>
                        <option>General Medicine</option>
                        <option>Laboratory</option>
                        <option>Emergency</option>
                        <option>Surgery</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Contact Number</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"/>
                </div>
                <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-300">
                    Add Staff Member
                </button>
            </form>
        </div>
    );
};