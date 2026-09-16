import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ViewStaff } from './ViewStaff';
import { InsuranceManagement } from './InsuranceManagement';
import { HomeIcon, UsersIcon, LogoutIcon } from '../../components/icons';

type AdminView = 'dashboard' | 'viewStaff' | 'insuranceManagement';

const SidebarLink = ({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick: () => void, isActive: boolean }) => (
    <button onClick={onClick} className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${isActive ? 'bg-primary-dark text-white' : 'text-gray-200 hover:bg-primary-dark/50 hover:text-white'}`}>
        {icon}
        <span className="mx-4 font-medium">{label}</span>
    </button>
);

export const AdminDashboard = () => {
    const { currentUser, logout } = useAppContext();
    const [activeView, setActiveView] = useState<AdminView>('dashboard');

    const renderContent = () => {
        switch (activeView) {
            case 'viewStaff': return <ViewStaff />;
            case 'insuranceManagement': return <InsuranceManagement />;
            case 'dashboard':
            default:
                return (
                    <div className="p-8 bg-white rounded-lg shadow-md">
                        <h2 className="text-3xl font-bold text-gray-800">Welcome, Manager!</h2>
                        <p className="mt-2 text-gray-600">Select an option from the sidebar to view hospital information.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <div className="hidden md:flex flex-col w-64 bg-primary-dark/90 backdrop-blur-sm text-white">
                <div className="flex items-center justify-center h-20 shadow-md bg-primary-dark">
                    <h1 className="text-2xl font-bold">Hospital Manager Panel</h1>
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <SidebarLink icon={<HomeIcon />} label="Dashboard" onClick={() => setActiveView('dashboard')} isActive={activeView === 'dashboard'}/>
                    <SidebarLink icon={<UsersIcon />} label="View Staff" onClick={() => setActiveView('viewStaff')} isActive={activeView === 'viewStaff'}/>
                    <SidebarLink
                        icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                        label="View Insurance Providers"
                        onClick={() => setActiveView('insuranceManagement')}
                        isActive={activeView === 'insuranceManagement'}
                    />
                    <SidebarLink icon={<LogoutIcon />} label="Logout" onClick={logout} isActive={false}/>
                </nav>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white border-b">
                    <h1 className="text-2xl font-semibold text-gray-700">Hospital Manager Dashboard</h1>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};