

import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import api from '../../api/client';

export const MyAppointments = () => {
    const { currentUser, appointments, refreshData } = useAppContext();

    const myAppointments = useMemo(() => {
        if (!currentUser) return [];
        return appointments.filter(apt => apt.patientId === currentUser.id)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [currentUser, appointments]);

    const handleCancel = async (appointmentId: string) => {
        try {
            await api.appointments.updateStatus(appointmentId, 'Cancelled');
            // Refresh data from database
            await refreshData();
        } catch (error) {
            console.error('Error cancelling appointment:', error);
            alert('Failed to cancel appointment. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
         <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h2>
            <div className="min-w-full overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3">Doctor</th>
                            <th scope="col" className="px-6 py-3">Department</th>
                            <th scope="col" className="px-6 py-3">Date</th>
                            <th scope="col" className="px-6 py-3">Time</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {myAppointments.map((apt, index) => (
                            <tr key={apt.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                <td className="px-6 py-4 font-medium text-gray-900">{apt.doctorName}</td>
                                <td className="px-6 py-4">{apt.department}</td>
                                <td className="px-6 py-4">{apt.date}</td>
                                <td className="px-6 py-4">{apt.time}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(apt.status)}`}>
                                        {apt.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {apt.status === 'Upcoming' && (
                                        <button onClick={() => handleCancel(apt.id)} className="font-medium text-red-600 hover:underline">
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {myAppointments.length === 0 && <p className="text-center text-gray-500 py-8">You have no appointments.</p>}
            </div>
        </div>
    );
};