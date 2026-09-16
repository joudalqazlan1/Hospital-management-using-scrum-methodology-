export enum Page {
    Home = 'HOME',
    Login = 'LOGIN',
    Register = 'REGISTER',
    AdminDashboard = 'ADMIN_DASHBOARD',
    DoctorDashboard = 'DOCTOR_DASHBOARD',
    PatientDashboard = 'PATIENT_DASHBOARD',
    LabTechnicianDashboard = 'LAB_TECHNICIAN_DASHBOARD',
    MarketingDashboard = 'MARKETING_DASHBOARD',
    AccountantDashboard = 'ACCOUNTANT_DASHBOARD',
    CustomerServiceDashboard = 'CUSTOMER_SERVICE_DASHBOARD',
    InsuranceVerification = 'INSURANCE_VERIFICATION',
    Payment = 'PAYMENT',
}

export enum Role {
    Admin = 'Admin',
    Doctor = 'Doctor',
    Patient = 'Patient',
    LabTechnician = 'Lab Technician',
    Marketing = 'Marketing Administrator',
    Accountant = 'Accountant Administrator',
    CustomerService = 'Customer Service',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    password?: string; // Should not be stored in frontend state long-term, but needed for login/registration
    role: Role;
}

export interface Patient extends User {
    role: Role.Patient;
    dateOfBirth: string;
    contactNumber: string;
}

export interface Staff extends User {
    role: Role.Admin | Role.Doctor | Role.LabTechnician | Role.Marketing | Role.Accountant | Role.CustomerService;
    department: string;
    contactNumber: string;
    consultationFee?: number;
}

export type CurrentUser = Patient | Staff | null;

export interface Appointment {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    department: string;
    date: string;
    time: string;
    status: 'Upcoming' | 'Completed' | 'Cancelled';
    consultationFee?: number;
    paymentMethod?: 'Visa' | 'Mada' | 'ApplePay';
    paymentStatus?: 'Pending' | 'Completed' | 'Failed';
}

export interface MedicalRecord {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    appointmentId: string;
    date: string; // appointment date
    diagnosis: string;
    treatment: string;
    prescription: string;
    notes: string;
}

export interface InsuranceInfo {
    id: string;
    patientId: string;
    provider: string;
    policyNumber: string;
    expirationDate: string;
    isActive: boolean;
    createdAt: string;
}

export interface PaymentInfo {
    id: string;
    patientId: string;
    patientName?: string;
    patientEmail?: string;
    patientPhone?: string;
    cardNumber: string;
    cardHolderName: string;
    expiryDate: string;
    cvv: string;
    paymentMethod?: 'Visa' | 'Mada' | 'ApplePay';
    amount: number;
    paymentDate: string;
    status: 'Success' | 'Failed';
}

export interface LabTest {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    appointmentId?: string;
    testType: string;
    requestDate: string;
    status: 'Pending' | 'Completed' | 'In Progress';
    results?: string;
    resultDate?: string;
    notes?: string;
}