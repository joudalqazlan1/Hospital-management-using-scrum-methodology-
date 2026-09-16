/**
 * Express API Server for HealSmart Hospital Management System
 * Handles database operations for React frontend
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { initializePool, closePool } from '../src/database/connection';

// Import service modules
import userService from '../src/services/userService';
import appointmentService from '../src/services/appointmentService';
import labTestService from '../src/services/labTestService';
import medicalRecordService from '../src/services/medicalRecordService';
import insuranceService from '../src/services/insuranceService';
import paymentService from '../src/services/paymentService';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection pool
initializePool()
    .then(() => console.log('✅ Database connection pool initialized'))
    .catch(err => {
        console.error('❌ Failed to initialize database:', err);
        process.exit(1);
    });

// =========================
// USER ROUTES
// =========================

/**
 * POST /api/auth/login
 * Authenticate user login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await userService.authenticateUser(email, password);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * POST /api/auth/register
 * Register a new patient
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const patient = await userService.registerPatient(req.body);
        res.status(201).json({ patient });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * GET /api/staff
 * Get all staff members
 */
app.get('/api/staff', async (req: Request, res: Response) => {
    try {
        const staff = await userService.getAllStaff();
        res.json({ staff });
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ error: 'Failed to fetch staff' });
    }
});

/**
 * POST /api/staff
 * Add a new staff member
 */
app.post('/api/staff', async (req: Request, res: Response) => {
    try {
        const staff = await userService.addStaff(req.body);
        res.status(201).json({ staff });
    } catch (error) {
        console.error('Add staff error:', error);
        res.status(500).json({ error: 'Failed to add staff' });
    }
});

/**
 * DELETE /api/staff/:id
 * Delete a staff member
 */
app.delete('/api/staff/:id', async (req: Request, res: Response) => {
    try {
        await userService.deleteStaff(req.params.id);
        res.json({ message: 'Staff deleted successfully' });
    } catch (error) {
        console.error('Delete staff error:', error);
        res.status(500).json({ error: 'Failed to delete staff' });
    }
});

/**
 * GET /api/patients
 * Get all patients
 */
app.get('/api/patients', async (req: Request, res: Response) => {
    try {
        const patients = await userService.getAllPatients();
        res.json({ patients });
    } catch (error) {
        console.error('Get patients error:', error);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

// =========================
// APPOINTMENT ROUTES
// =========================

/**
 * GET /api/appointments
 * Get all appointments
 */
app.get('/api/appointments', async (req: Request, res: Response) => {
    try {
        const appointments = await appointmentService.getAllAppointments();
        res.json({ appointments });
    } catch (error) {
        console.error('Get appointments error:', error);
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
});

/**
 * POST /api/appointments
 * Create a new appointment
 */
app.post('/api/appointments', async (req: Request, res: Response) => {
    try {
        const appointment = await appointmentService.createAppointment(req.body);
        res.status(201).json({ appointment });
    } catch (error) {
        console.error('Create appointment error:', error);
        res.status(500).json({ error: 'Failed to create appointment' });
    }
});

/**
 * PATCH /api/appointments/:id
 * Update appointment status
 */
app.patch('/api/appointments/:id', async (req: Request, res: Response) => {
    try {
        await appointmentService.updateAppointmentStatus(req.params.id, req.body.status);
        res.json({ message: 'Appointment updated successfully' });
    } catch (error) {
        console.error('Update appointment error:', error);
        res.status(500).json({ error: 'Failed to update appointment' });
    }
});

/**
 * DELETE /api/appointments/:id
 * Delete an appointment
 */
app.delete('/api/appointments/:id', async (req: Request, res: Response) => {
    try {
        await appointmentService.deleteAppointment(req.params.id);
        res.json({ message: 'Appointment deleted successfully' });
    } catch (error) {
        console.error('Delete appointment error:', error);
        res.status(500).json({ error: 'Failed to delete appointment' });
    }
});

// =========================
// LAB TEST ROUTES
// =========================

/**
 * GET /api/lab-tests
 * Get all lab tests
 */
app.get('/api/lab-tests', async (req: Request, res: Response) => {
    try {
        const labTests = await labTestService.getAllLabTests();
        console.log('Lab tests fetched successfully:', labTests.length, 'tests');
        res.json({ labTests });
    } catch (error: any) {
        const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
        console.error('Get lab tests error:', errorMessage);
        res.status(500).json({ error: 'Failed to fetch lab tests' });
    }
});

/**
 * POST /api/lab-tests
 * Create a new lab test
 */
app.post('/api/lab-tests', async (req: Request, res: Response) => {
    try {
        const labTest = await labTestService.createLabTest(req.body);
        res.status(201).json({ labTest });
    } catch (error) {
        console.error('Create lab test error:', error);
        res.status(500).json({ error: 'Failed to create lab test' });
    }
});

/**
 * PATCH /api/lab-tests/:id
 * Update a lab test
 */
app.patch('/api/lab-tests/:id', async (req: Request, res: Response) => {
    try {
        await labTestService.updateLabTest(req.params.id, req.body);
        res.json({ message: 'Lab test updated successfully' });
    } catch (error) {
        console.error('Update lab test error:', error);
        res.status(500).json({ error: 'Failed to update lab test' });
    }
});

// =========================
// MEDICAL RECORD ROUTES
// =========================

/**
 * GET /api/medical-records
 * Get all medical records
 */
app.get('/api/medical-records', async (req: Request, res: Response) => {
    try {
        console.log('🔹 API endpoint: Calling getAllMedicalRecords()...');
        const records = await medicalRecordService.getAllMedicalRecords();
        console.log('🔹 API endpoint: Received', records.length, 'records from service');
        console.log('🔹 API endpoint: Cleaning and serializing records...');
        // Force clean serialization to remove any Oracle metadata
        const cleanRecords = JSON.parse(JSON.stringify(records));
        console.log('🔹 API endpoint: Attempting to send JSON response...');
        res.json({ records: cleanRecords });
        console.log('🔹 API endpoint: JSON response sent successfully');
    } catch (error: any) {
        console.error('🔹 API endpoint ERROR occurred');
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error?.constructor?.name || 'unknown');
        try {
            const errorMsg = String(error);
            console.error('Error string:', errorMsg.substring(0, 200));
        } catch (e) {
            console.error('Could not stringify error');
        }
        res.status(500).json({ error: 'Failed to fetch medical records' });
    }
});

/**
 * POST /api/medical-records
 * Create a new medical record
 */
app.post('/api/medical-records', async (req: Request, res: Response) => {
    try {
        const record = await medicalRecordService.createMedicalRecord(req.body);
        res.status(201).json({ record });
    } catch (error) {
        console.error('Create medical record error:', error);
        res.status(500).json({ error: 'Failed to create medical record' });
    }
});

// =========================
// INSURANCE ROUTES
// =========================

/**
 * GET /api/insurance
 * Get all insurance records
 */
app.get('/api/insurance', async (req: Request, res: Response) => {
    try {
        const insurance = await insuranceService.getAllInsurance();
        res.json({ insurance });
    } catch (error) {
        console.error('Get insurance error:', error);
        res.status(500).json({ error: 'Failed to fetch insurance' });
    }
});

/**
 * POST /api/insurance
 * Create a new insurance record
 */
app.post('/api/insurance', async (req: Request, res: Response) => {
    try {
        const insurance = await insuranceService.createInsurance(req.body);
        res.status(201).json({ insurance });
    } catch (error) {
        console.error('Create insurance error:', error);
        res.status(500).json({ error: 'Failed to create insurance' });
    }
});

// =========================
// SUPPORTED INSURANCE ROUTES
// =========================

/**
 * GET /api/insurance/supported
 * Get all supported insurance providers
 */
app.get('/api/insurance/supported', async (req: Request, res: Response) => {
    try {
        const providers = await insuranceService.getSupportedInsurance();
        res.json({ providers });
    } catch (error) {
        console.error('Get supported insurance error:', error);
        res.status(500).json({ error: 'Failed to fetch supported insurance' });
    }
});

/**
 * POST /api/insurance/supported
 * Add a new supported insurance provider
 */
app.post('/api/insurance/supported', async (req: Request, res: Response) => {
    try {
        const provider = await insuranceService.addSupportedInsurance(req.body.providerName);
        res.status(201).json({ provider });
    } catch (error) {
        console.error('Add supported insurance error:', error);
        res.status(500).json({ error: 'Failed to add supported insurance' });
    }
});

/**
 * PUT /api/insurance/supported/:id
 * Update supported insurance provider
 */
app.put('/api/insurance/supported/:id', async (req: Request, res: Response) => {
    try {
        await insuranceService.updateSupportedInsurance(parseInt(req.params.id), req.body.isActive);
        res.json({ success: true });
    } catch (error) {
        console.error('Update supported insurance error:', error);
        res.status(500).json({ error: 'Failed to update supported insurance' });
    }
});

/**
 * DELETE /api/insurance/supported/:id
 * Delete supported insurance provider
 */
app.delete('/api/insurance/supported/:id', async (req: Request, res: Response) => {
    try {
        await insuranceService.deleteSupportedInsurance(parseInt(req.params.id));
        res.json({ success: true });
    } catch (error) {
        console.error('Delete supported insurance error:', error);
        res.status(500).json({ error: 'Failed to delete supported insurance' });
    }
});

/**
 * POST /api/insurance/check
 * Check if insurance provider is supported
 */
app.post('/api/insurance/check', async (req: Request, res: Response) => {
    try {
        const isSupported = await insuranceService.checkInsuranceSupport(req.body.provider);
        res.json({ isSupported });
    } catch (error) {
        console.error('Check insurance support error:', error);
        res.status(500).json({ error: 'Failed to check insurance support' });
    }
});

/**
 * POST /api/insurance/supported/check
 * Check if insurance provider is supported and get discount percentage
 */
app.post('/api/insurance/supported/check', async (req: Request, res: Response) => {
    try {
        const isSupported = await insuranceService.checkInsuranceSupport(req.body.provider);
        // Default 20% discount for all supported insurance
        res.json({ isSupported, discountPercentage: isSupported ? 20 : 0 });
    } catch (error) {
        console.error('Check insurance support error:', error);
        res.status(500).json({ error: 'Failed to check insurance support' });
    }
});

// =========================
// PAYMENT ROUTES
// =========================

/**
 * GET /api/payments
 * Get all payments
 */
app.get('/api/payments', async (req: Request, res: Response) => {
    try {
        const payments = await paymentService.getAllPayments();
        res.json({ payments });
    } catch (error) {
        console.error('Get payments error:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});

/**
 * POST /api/payments
 * Create a new payment
 */
app.post('/api/payments', async (req: Request, res: Response) => {
    try {
        const payment = await paymentService.createPayment(req.body);
        res.status(201).json({ payment });
    } catch (error) {
        console.error('Create payment error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'OK', message: 'HealSmart API Server is running' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 HealSmart API Server running on http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏸️  Shutting down gracefully...');
    await closePool();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n⏸️  Shutting down gracefully...');
    await closePool();
    process.exit(0);
});
