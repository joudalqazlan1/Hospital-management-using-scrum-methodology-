import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Page, Role, CurrentUser, Patient, Staff, Appointment, MedicalRecord, InsuranceInfo, PaymentInfo, LabTest } from '../types';
import api from '../api/client';

interface AppContextType {
    currentPage: Page;
    navigate: (page: Page) => void;
    currentUser: CurrentUser;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loginTargetRole: Role | null;
    setLoginTargetRole: React.Dispatch<React.SetStateAction<Role | null>>;
    patients: Patient[];
    setPatients: React.Dispatch<React.SetStateAction<Patient[]>>;
    staff: Staff[];
    setStaff: React.Dispatch<React.SetStateAction<Staff[]>>;
    appointments: Appointment[];
    setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
    medicalRecords: MedicalRecord[];
    setMedicalRecords: React.Dispatch<React.SetStateAction<MedicalRecord[]>>;
    insuranceRecords: InsuranceInfo[];
    setInsuranceRecords: React.Dispatch<React.SetStateAction<InsuranceInfo[]>>;
    paymentMethods: PaymentInfo[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentInfo[]>>;
    labTests: LabTest[];
    setLabTests: React.Dispatch<React.SetStateAction<LabTest[]>>;
    refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [currentPage, setCurrentPage] = useState<Page>(Page.Home);
    const [currentUser, setCurrentUser] = useState<CurrentUser>(null);
    const [loginTargetRole, setLoginTargetRole] = useState<Role | null>(null);

    // Data states
    const [patients, setPatients] = useState<Patient[]>([]);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [insuranceRecords, setInsuranceRecords] = useState<InsuranceInfo[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentInfo[]>([]);
    const [labTests, setLabTests] = useState<LabTest[]>([]);

    const navigate = (page: Page) => {
        setCurrentPage(page);
    };

    /**
     * Fetch all data from API
     */
    const refreshData = async () => {
        try {
            // Fetch all data in parallel
            const [
                staffResponse,
                patientsResponse,
                appointmentsResponse,
                labTestsResponse,
                medicalRecordsResponse,
                insuranceResponse
            ] = await Promise.all([
                api.staff.getAll().catch(() => ({ staff: [] })),
                api.patients.getAll().catch(() => ({ patients: [] })),
                api.appointments.getAll().catch(() => ({ appointments: [] })),
                api.labTests.getAll().catch(() => ({ labTests: [] })),
                api.medicalRecords.getAll().catch(() => ({ records: [] })),
                api.insurance.getAll().catch(() => ({ insurance: [] }))
            ]);

            setStaff(staffResponse.staff || []);
            setPatients(patientsResponse.patients || []);
            setAppointments(appointmentsResponse.appointments || []);
            setLabTests(labTestsResponse.labTests || []);
            setMedicalRecords(medicalRecordsResponse.records || []);
            setInsuranceRecords(insuranceResponse.insurance || []);
            // Don't load payment transactions into paymentMethods - only use for saved cards
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    /**
     * Login user via API
     */
    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response: any = await api.auth.login(email, password);

            if (response.user) {
                setCurrentUser(response.user);

                // Fetch all data after successful login
                await refreshData();

                // Navigate based on role
                switch(response.user.role) {
                    case Role.Admin:
                        navigate(Page.AdminDashboard);
                        break;
                    case Role.Doctor:
                        navigate(Page.DoctorDashboard);
                        break;
                    case Role.Patient:
                        navigate(Page.PatientDashboard);
                        break;
                    case Role.LabTechnician:
                        navigate(Page.LabTechnicianDashboard);
                        break;
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        setCurrentUser(null);
        setLoginTargetRole(null);
        setPatients([]);
        setStaff([]);
        setAppointments([]);
        setMedicalRecords([]);
        setInsuranceRecords([]);
        setPaymentMethods([]);
        setLabTests([]);
        navigate(Page.Home);
    };

    // Load data on mount (optional - only if needed)
    useEffect(() => {
        if (currentUser) {
            refreshData();
        }
    }, []);

    const value = {
        currentPage,
        navigate,
        currentUser,
        login,
        logout,
        loginTargetRole,
        setLoginTargetRole,
        patients,
        setPatients,
        staff,
        setStaff,
        appointments,
        setAppointments,
        medicalRecords,
        setMedicalRecords,
        insuranceRecords,
        setInsuranceRecords,
        paymentMethods,
        setPaymentMethods,
        labTests,
        setLabTests,
        refreshData,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
