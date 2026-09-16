import React, { useState, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Appointment, MedicalRecord } from '../../types';
import { HomeIcon, CalendarIcon, LogoutIcon, PlusIcon, CloseIcon } from '../../components/icons';
import { LabTestsView } from './LabTestsView';
import api from '../../api/client';

type DoctorView = 'dashboard' | 'appointments' | 'labTests';

const MedicalRecordModal = ({ appointment, onClose }: { appointment: Appointment, onClose: () => void }) => {
    const { currentUser, refreshData } = useAppContext();
    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        prescription: '',
        notes: '',
    });
    const [message, setMessage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.diagnosis || !formData.treatment || !formData.prescription) {
            setMessage('Diagnosis, Treatment, and Prescription are required.');
            return;
        }
        if (!currentUser) {
            setMessage('Error: Doctor not logged in.');
            return;
        }

        setIsSaving(true);
        setMessage('');

        const recordData = {
            patientId: appointment.patientId,
            doctorId: currentUser.id,
            doctorName: currentUser.fullName,
            appointmentId: appointment.id,
            date: appointment.date,
            ...formData,
        };

        try {
            await api.medicalRecords.create(recordData);
            await refreshData();
            setMessage('✓ Medical record saved successfully! The record is now available in the patient\'s dashboard.');
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (error) {
            setMessage('Unable to save medical record. Please try again.');
            console.error(error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-full overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-xl font-semibold text-gray-800">Add Medical Record</h3>
                    <button onClick={onClose}><CloseIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2">Appointment Details</h4>
                        <p className="text-sm"><strong>Appointment ID:</strong> {appointment.id}</p>
                        <p className="text-sm"><strong>Patient:</strong> {appointment.patientName}</p>
                        <p className="text-sm"><strong>Date:</strong> {appointment.date}</p>
                    </div>
                    {message && <div className={`p-3 text-sm rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Diagnosis</label>
                        <textarea name="diagnosis" value={formData.diagnosis} onChange={e => setFormData({...formData, diagnosis: e.target.value})} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Treatment / Procedure</label>
                        <textarea name="treatment" value={formData.treatment} onChange={e => setFormData({...formData, treatment: e.target.value})} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prescription</label>
                        <textarea name="prescription" value={formData.prescription} onChange={e => setFormData({...formData, prescription: e.target.value})} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                        <textarea name="notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} rows={2} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSaving} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:bg-gray-400">
                            {isSaving ? 'Saving...' : 'Save Record'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SidebarLink = ({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick: () => void, isActive: boolean }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${isActive ? 'bg-primary-dark text-white' : 'text-gray-200 hover:bg-primary-dark/50 hover:text-white'}`}>
        {icon}
        <span className="mx-4 font-medium">{label}</span>
    </button>
);

const AppointmentsView = () => {
    const { currentUser, appointments, refreshData, medicalRecords } = useAppContext();
    const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const filteredAppointments = useMemo(() => {
        if (!currentUser) return [];
        return appointments
            .filter(apt => {
                const matchesDoctor = apt.doctorId === currentUser.id;
                const matchesDate = !filterDate || apt.date === filterDate;
                const matchesSearch = !searchTerm || apt.patientName.toLowerCase().includes(searchTerm.toLowerCase());
                return matchesDoctor && matchesDate && matchesSearch;
            })
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentUser, appointments, filterDate, searchTerm]);

    const handleStatusChange = async (appointmentId: string, status: Appointment['status']) => {
        try {
            await api.appointments.updateStatus(appointmentId, status);
            // Refresh data from database
            await refreshData();
        } catch (error) {
            console.error('Error updating appointment status:', error);
            alert('Failed to update appointment status. Please try again.');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setFilterDate('');
    };
    
    const hasRecord = (appointmentId: string) => medicalRecords.some(rec => rec.appointmentId === appointmentId);

    return (
        <>
            {selectedAppointment && <MedicalRecordModal appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />}
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg overflow-x-auto">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">My Appointments</h2>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search by patient name..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full sm:w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    />
                    <button
                        onClick={clearFilters}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>

                <div className="min-w-full">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Patient</th>
                                <th scope="col" className="px-6 py-3">Date & Time</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAppointments.map((apt, index) => (
                                <tr key={apt.id} className={`border-b ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                    <td className="px-6 py-4 font-medium text-gray-900">{apt.patientName}</td>
                                    <td className="px-6 py-4">{apt.date} at {apt.time}</td>
                                    <td className="px-6 py-4">{apt.status}</td>
                                    <td className="px-6 py-4 space-x-2 flex items-center">
                                        {apt.status === 'Upcoming' && (
                                            <button onClick={() => handleStatusChange(apt.id, 'Completed')} className="text-green-600 hover:text-green-900 font-medium">
                                                Complete
                                            </button>
                                        )}
                                        {apt.status === 'Completed' && (
                                            hasRecord(apt.id) ? (
                                                 <button
                                                    onClick={() => {
                                                        const record = medicalRecords.find(rec => rec.appointmentId === apt.id);
                                                        if (record) {
                                                            alert(`Medical Record for ${apt.patientName}\n\nDiagnosis: ${record.diagnosis}\n\nTreatment: ${record.treatment}\n\nPrescription: ${record.prescription}\n\nNotes: ${record.notes || 'None'}\n\nThis record is visible to the patient in their Medical Records section.`);
                                                        }
                                                    }}
                                                    className="flex items-center text-green-600 hover:text-green-800 font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    View Medical Record
                                                </button>
                                            ) : (
                                                 <button onClick={() => setSelectedAppointment(apt)} className="flex items-center text-primary hover:text-primary-dark font-medium">
                                                    <PlusIcon className="w-4 h-4 mr-1" /> Add Medical Record
                                                </button>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAppointments.length === 0 && (
                        <p className="text-center text-gray-500 py-8">
                            {searchTerm || filterDate ? 'No appointments match your filters.' : 'No appointments scheduled.'}
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}

export const DoctorDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const [activeView, setActiveView] = useState<DoctorView>('dashboard');

    const renderContent = () => {
        switch (activeView) {
            case 'appointments': return <AppointmentsView />;
            case 'labTests': return <LabTestsView />;
            case 'dashboard':
            default:
                return (
                    <div className="p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.fullName}!</h2>
                        <p className="mt-2 text-gray-600">You can manage your appointments and view patient information from the sidebar.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden md:flex flex-col w-64 bg-primary-dark/90 backdrop-blur-sm text-white">
                <div className="flex items-center justify-center h-20 shadow-md bg-primary-dark">
                    <h1 className="text-2xl font-bold">Doctor Portal</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <SidebarLink icon={<HomeIcon />} label="Dashboard" onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'}/>
                    <SidebarLink icon={<CalendarIcon />} label="Appointments" onClick={() => setActiveView('appointments')} isActive={activeView === 'appointments'}/>
                    <SidebarLink icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    } label="Lab Tests" onClick={() => setActiveView('labTests')} isActive={activeView === 'labTests'}/>
                    <SidebarLink icon={<LogoutIcon />} label="Logout" onClick={logout} isActive={false}/>
                </nav>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b">
                    <h1 className="text-2xl font-semibold text-gray-700">Doctor Dashboard</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};