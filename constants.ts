import { Patient, Staff, Role, Appointment, MedicalRecord, LabTest } from './types';

export const INITIAL_PATIENTS: Patient[] = [
    {
        id: 'patient_1',
        fullName: 'John Doe',
        email: 'john.doe@example.com',
        password: 'Password1!',
        role: Role.Patient,
        dateOfBirth: '1990-01-15',
        contactNumber: '123-456-7890'
    }
];

export const INITIAL_STAFF: Staff[] = [
    {
        id: 'admin_1',
        fullName: 'System Administrator',
        email: 'bushramug9@gmail.com',
        password: '12345678Bb@',
        role: Role.Admin,
        department: 'IT Administration',
        contactNumber: '0501234567'
    },
    {
        id: 'doctor_1',
        fullName: 'Dr. Sarah Smith',
        email: 'doctor@hospital.com',
        password: 'Doctor123!',
        role: Role.Doctor,
        department: 'General Medicine',
        contactNumber: '0501234569'
    },
    {
        id: 'labtech_1',
        fullName: 'Sarah Johnson',
        email: 'lab.tech@hospital.com',
        password: 'LabTech123!',
        role: Role.LabTechnician,
        department: 'Laboratory',
        contactNumber: '0501234568'
    }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

export const INITIAL_MEDICAL_RECORDS: MedicalRecord[] = [];

export const INITIAL_LAB_TESTS: LabTest[] = [
    {
        id: 'lab_1',
        patientId: 'patient_1',
        patientName: 'John Doe',
        doctorId: 'doctor_1',
        doctorName: 'Dr. Sarah Smith',
        testType: 'Complete Blood Count (CBC)',
        requestDate: '2025-11-20',
        status: 'Completed',
        results: 'All values within normal range. WBC: 7.5 K/uL, RBC: 5.2 M/uL, Hemoglobin: 15.2 g/dL, Platelets: 250 K/uL',
        resultDate: '2025-11-21',
        notes: 'Routine annual checkup'
    },
    {
        id: 'lab_2',
        patientId: 'patient_1',
        patientName: 'John Doe',
        doctorId: 'doctor_1',
        doctorName: 'Dr. Sarah Smith',
        testType: 'Lipid Panel',
        requestDate: '2025-11-21',
        status: 'In Progress',
        notes: 'Fasting required - Patient fasted for 12 hours'
    },
    {
        id: 'lab_3',
        patientId: 'patient_1',
        patientName: 'John Doe',
        doctorId: 'doctor_1',
        doctorName: 'Dr. Sarah Smith',
        testType: 'Thyroid Function Test (TSH, T3, T4)',
        requestDate: '2025-11-22',
        status: 'Pending',
        notes: 'Follow-up test requested due to patient symptoms'
    }
];