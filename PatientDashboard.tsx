
import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { BookAppointment } from './BookAppointment';
import { MyAppointments } from './MyAppointments';
import { MedicalRecord } from './MedicalRecord';
import { HomeIcon, CalendarIcon, PlusIcon, LogoutIcon, UsersIcon } from '../../components/icons';

type PatientView = 'dashboard' | 'bookAppointment' | 'myAppointments' | 'medicalRecord';

const SidebarLink = ({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick: () => void, isActive: boolean }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${isActive ? 'bg-primary-dark text-white' : 'text-gray-200 hover:bg-primary-dark/50 hover:text-white'}`}>
        {icon}
        <span className="mx-4 font-medium">{label}</span>
    </button>
);

export const PatientDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const [activeView, setActiveView] = useState<PatientView>('dashboard');

    const renderContent = () => {
        switch (activeView) {
            case 'bookAppointment': return <BookAppointment />;
            case 'myAppointments': return <MyAppointments />;
            case 'medicalRecord': return <MedicalRecord />;
            case 'dashboard':
            default:
                return (
                    <div className="p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome, {currentUser?.fullName}!</h2>
                        <p className="mt-2 text-gray-600">You can book new appointments, view your upcoming appointments, and check your medical records from the sidebar.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden md:flex flex-col w-64 bg-primary-dark/90 backdrop-blur-sm text-white">
                <div className="flex items-center justify-center h-20 shadow-md bg-primary-dark">
                    <h1 className="text-2xl font-bold">Patient Portal</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <SidebarLink icon={<HomeIcon />} label="Dashboard" onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'}/>
                    <SidebarLink icon={<PlusIcon />} label="Book Appointment" onClick={() => setActiveView('bookAppointment')} isActive={activeView === 'bookAppointment'}/>
                    <SidebarLink icon={<CalendarIcon />} label="My Appointments" onClick={() => setActiveView('myAppointments')} isActive={activeView === 'myAppointments'}/>
                    <SidebarLink icon={<UsersIcon />} label="Medical Record" onClick={() => setActiveView('medicalRecord')} isActive={activeView === 'medicalRecord'}/>
                    <SidebarLink icon={<LogoutIcon />} label="Logout" onClick={logout} isActive={false}/>
                </nav>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b">
                    <h1 className="text-2xl font-semibold text-gray-700">Patient Dashboard</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};
