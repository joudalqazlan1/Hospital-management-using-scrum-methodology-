import React from 'react';
import { useAppContext } from './contexts/AppContext';
import { Page, Role } from './types';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { PatientPortal } from './pages/patient/PatientPortal';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { LabTechnicianDashboard } from './pages/labTechnician/LabTechnicianDashboard';
import { MarketingDashboard } from './pages/marketing/MarketingDashboard';
import { AccountantDashboard } from './pages/accountant/AccountantDashboard';
import { CustomerServiceDashboard } from './pages/customerService/CustomerServiceDashboard';
import { InsuranceVerification } from './pages/patient/InsuranceVerification';
import { Payment } from './pages/patient/Payment';

const App = () => {
    const { currentPage, currentUser } = useAppContext();

    const renderPage = () => {
        // Check specific pages first (available to logged-in users)
        switch (currentPage) {
            case Page.InsuranceVerification:
                return <InsuranceVerification />;
            case Page.Payment:
                return <Payment />;
        }

        // Then check user-based pages
        if (currentUser) {
            switch (currentUser.role) {
                case Role.Admin: return <AdminDashboard />;
                case Role.Doctor: return <DoctorDashboard />;
                case Role.Patient: return <PatientPortal />;
                case Role.LabTechnician: return <LabTechnicianDashboard />;
                case Role.Marketing: return <MarketingDashboard />;
                case Role.Accountant: return <AccountantDashboard />;
                case Role.CustomerService: return <CustomerServiceDashboard />;
            }
        }

        // Finally, public pages
        switch (currentPage) {
            case Page.Login: return <LoginPage />;
            case Page.Register: return <RegisterPage />;
            case Page.Home:
            default:
                return <HomePage />;
        }
    };

    const showHeader = !currentUser && (currentPage === Page.Home || currentPage === Page.Login || currentPage === Page.Register);

    return (
        <>
            {showHeader && <Header />}
            {renderPage()}
        </>
    );
};

export default App;