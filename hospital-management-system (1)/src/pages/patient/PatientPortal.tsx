import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Page } from '../../types';
import { BookAppointment } from './BookAppointment';
import { MyAppointments } from './MyAppointments';
import { MedicalRecord } from './MedicalRecord';
import { LabResults } from './LabResults';
import { CustomerServiceChat } from './CustomerServiceChat';
import { LogoutIcon, CalendarIcon, PlusIcon, UsersIcon } from '../../components/icons';

type PatientView = 'myAppointments' | 'bookAppointment' | 'medicalRecord' | 'labResults' | 'customerServiceChat';

const TabButton = ({ icon, label, onClick, isActive }: { icon: React.ReactNode, label: string, onClick: () => void, isActive: boolean }) => (
    <button
        onClick={onClick}
        className={`flex items-center px-4 py-3 text-sm sm:text-base font-medium leading-5 rounded-md focus:outline-none transition-colors duration-150
            ${isActive
                ? 'text-white bg-primary'
                : 'text-gray-600 hover:bg-primary-light hover:text-primary-dark'
            }`}
    >
        {icon}
        <span className="ml-2 hidden sm:block">{label}</span>
    </button>
);


export const PatientPortal = () => {
    const { currentUser, logout, navigate } = useAppContext();
    const [activeView, setActiveView] = useState<PatientView>('myAppointments');

    const renderContent = () => {
        switch (activeView) {
            case 'bookAppointment':
                return <BookAppointment />;
            case 'medicalRecord':
                return <MedicalRecord />;
            case 'labResults':
                return <LabResults />;
            case 'customerServiceChat':
                return <CustomerServiceChat />;
            case 'myAppointments':
            default:
                return <MyAppointments />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-dark">
                           Patient Portal
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
                 <div className="bg-white rounded-lg shadow-lg">
                    <div className="p-4 border-b">
                         <nav className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4 flex-wrap gap-2">
                            <TabButton
                                icon={<CalendarIcon className="w-5 h-5"/>}
                                label="My Appointments"
                                isActive={activeView === 'myAppointments'}
                                onClick={() => setActiveView('myAppointments')}
                            />
                             <TabButton
                                icon={<PlusIcon className="w-5 h-5"/>}
                                label="Book Appointment"
                                isActive={activeView === 'bookAppointment'}
                                onClick={() => setActiveView('bookAppointment')}
                            />
                             <TabButton
                                icon={<UsersIcon className="w-5 h-5"/>}
                                label="Medical Record"
                                isActive={activeView === 'medicalRecord'}
                                onClick={() => setActiveView('medicalRecord')}
                            />
                             <TabButton
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                }
                                label="Lab Results"
                                isActive={activeView === 'labResults'}
                                onClick={() => setActiveView('labResults')}
                            />
                             <TabButton
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                }
                                label="Customer Service"
                                isActive={activeView === 'customerServiceChat'}
                                onClick={() => setActiveView('customerServiceChat')}
                            />
                        </nav>
                    </div>
                    <div className="p-4 sm:p-6 lg:p-8">
                        {renderContent()}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate(Page.InsuranceVerification)}
                        className="bg-white hover:bg-primary-light border-2 border-primary rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Insurance Verification</h3>
                                <p className="text-sm text-gray-600">Verify your insurance coverage</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate(Page.Payment)}
                        className="bg-white hover:bg-primary-light border-2 border-primary rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300 text-left"
                    >
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Payment</h3>
                                <p className="text-sm text-gray-600">Make a payment</p>
                            </div>
                        </div>
                    </button>
                </div>
            </main>
        </div>
    );
};
