/**
 * Lab Test Service - Database operations for Lab_Tests table
 * HealSmart Hospital Management System
 */

import { executeQuery } from '../database/connection';
import { LabTest } from '../types';
import oracledb from 'oracledb';

interface DbLabTest {
    TEST_ID: number;
    PATIENT_ID: number;
    PATIENT_NAME: string;
    DOCTOR_ID: number;
    DOCTOR_NAME: string;
    APPOINTMENT_ID: number | null;
    TEST_NAME: string;
    TEST_STATUS: string;
    ORDERED_DATE: Date;
    COMPLETED_DATE: Date | null;
    RESULT: string | null;
    NOTES: string | null;
}

/**
 * Map database status to application status
 */
function mapStatus(dbStatus: string): 'Pending' | 'In Progress' | 'Completed' {
    switch (dbStatus) {
        case 'Ordered':
            return 'Pending';
        case 'InProgress':
            return 'In Progress';
        case 'Completed':
            return 'Completed';
        default:
            return 'Pending';
    }
}

/**
 * Map application status to database status
 */
function mapStatusToDb(appStatus: string): string {
    switch (appStatus) {
        case 'Pending':
            return 'Ordered';
        case 'In Progress':
            return 'InProgress';
        case 'Completed':
            return 'Completed';
        default:
            return 'Ordered';
    }
}

/**
 * Get all lab tests
 */
export async function getAllLabTests(): Promise<LabTest[]> {
    try {
        const sql = `
            SELECT
                lt.test_id,
                lt.patient_id,
                p.full_name as patient_name,
                lt.doctor_id,
                d.full_name as doctor_name,
                lt.appointment_id,
                lt.test_name,
                lt.test_status,
                lt.ordered_date,
                lt.completed_date,
                lt.result,
                lt.notes
            FROM Lab_Tests lt
            JOIN Users p ON lt.patient_id = p.user_id
            JOIN Users d ON lt.doctor_id = d.user_id
            ORDER BY lt.ordered_date DESC
        `;

        const result = await executeQuery<DbLabTest>(sql, [], {
            fetchInfo: {
                "RESULT": { type: oracledb.STRING },
                "NOTES": { type: oracledb.STRING }
            }
        });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(test => ({
            id: `lab_${test.TEST_ID}`,
            patientId: `user_${test.PATIENT_ID}`,
            patientName: test.PATIENT_NAME,
            doctorId: `user_${test.DOCTOR_ID}`,
            doctorName: test.DOCTOR_NAME,
            appointmentId: test.APPOINTMENT_ID ? `appointment_${test.APPOINTMENT_ID}` : undefined,
            testType: test.TEST_NAME,
            status: mapStatus(test.TEST_STATUS),
            requestDate: test.ORDERED_DATE.toISOString().split('T')[0],
            resultDate: test.COMPLETED_DATE ? test.COMPLETED_DATE.toISOString().split('T')[0] : undefined,
            results: test.RESULT || undefined,
            notes: test.NOTES || undefined
        }));
    } catch (error: any) {
        const errorMessage = error?.message || error?.toString?.() || 'Unknown error';
        console.error('Error fetching lab tests:', errorMessage);
        throw new Error(`Failed to fetch lab tests: ${errorMessage}`);
    }
}

/**
 * Create a new lab test
 */
export async function createLabTest(labTest: Omit<LabTest, 'id'>): Promise<LabTest> {
    try {
        const patientId = parseInt(labTest.patientId.replace('user_', ''));
        const doctorId = parseInt(labTest.doctorId.replace('user_', ''));
        const appointmentId = labTest.appointmentId ? parseInt(labTest.appointmentId.replace('appointment_', '')) : null;

        const sql = `
            INSERT INTO Lab_Tests (
                test_id, patient_id, doctor_id, appointment_id, test_name,
                test_status, ordered_date, notes, created_at
            )
            VALUES (
                lab_test_seq.NEXTVAL, :patientId, :doctorId, :appointmentId, :testName,
                :testStatus, CURRENT_TIMESTAMP, :notes, CURRENT_TIMESTAMP
            )
            RETURNING test_id INTO :id
        `;

        const binds = {
            patientId,
            doctorId,
            appointmentId,
            testName: labTest.testType,
            testStatus: mapStatusToDb(labTest.status),
            notes: labTest.notes || null,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const testId = result.outBinds?.id;

        return {
            id: `lab_${testId}`,
            ...labTest
        };
    } catch (error) {
        console.error('Error creating lab test:', error);
        throw error;
    }
}

/**
 * Update lab test status and results
 */
export async function updateLabTest(testId: string, updates: Partial<LabTest>): Promise<void> {
    try {
        const id = parseInt(testId.replace('lab_', ''));

        const setParts: string[] = [];
        const binds: any = { id };

        if (updates.status) {
            setParts.push('test_status = :status');
            binds.status = mapStatusToDb(updates.status);

            if (updates.status === 'Completed') {
                setParts.push('completed_date = CURRENT_TIMESTAMP');
            }
        }

        if (updates.results !== undefined) {
            setParts.push('result = :results');
            binds.results = updates.results;
        }

        if (updates.notes !== undefined) {
            setParts.push('notes = :notes');
            binds.notes = updates.notes;
        }

        if (setParts.length === 0) {
            return; // Nothing to update
        }

        const sql = `UPDATE Lab_Tests SET ${setParts.join(', ')} WHERE test_id = :id`;

        await executeQuery(sql, binds);
    } catch (error) {
        console.error('Error updating lab test:', error);
        throw error;
    }
}

/**
 * Get lab tests by patient ID
 */
export async function getLabTestsByPatient(patientId: string): Promise<LabTest[]> {
    try {
        const id = parseInt(patientId.replace('user_', ''));

        const sql = `
            SELECT
                lt.test_id,
                lt.patient_id,
                p.full_name as patient_name,
                lt.doctor_id,
                d.full_name as doctor_name,
                lt.appointment_id,
                lt.test_name,
                lt.test_status,
                lt.ordered_date,
                lt.completed_date,
                lt.result,
                lt.notes
            FROM Lab_Tests lt
            JOIN Users p ON lt.patient_id = p.user_id
            JOIN Users d ON lt.doctor_id = d.user_id
            WHERE lt.patient_id = :id
            ORDER BY lt.ordered_date DESC
        `;

        const result = await executeQuery<DbLabTest>(sql, { id }, {
            fetchInfo: {
                "RESULT": { type: oracledb.STRING },
                "NOTES": { type: oracledb.STRING }
            }
        });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(test => ({
            id: `lab_${test.TEST_ID}`,
            patientId: `user_${test.PATIENT_ID}`,
            patientName: test.PATIENT_NAME,
            doctorId: `user_${test.DOCTOR_ID}`,
            doctorName: test.DOCTOR_NAME,
            appointmentId: test.APPOINTMENT_ID ? `appointment_${test.APPOINTMENT_ID}` : undefined,
            testType: test.TEST_NAME,
            status: mapStatus(test.TEST_STATUS),
            requestDate: test.ORDERED_DATE.toISOString().split('T')[0],
            resultDate: test.COMPLETED_DATE ? test.COMPLETED_DATE.toISOString().split('T')[0] : undefined,
            results: test.RESULT || undefined,
            notes: test.NOTES || undefined
        }));
    } catch (error) {
        console.error('Error fetching patient lab tests:', error);
        throw error;
    }
}

/**
 * Get lab tests by doctor ID
 */
export async function getLabTestsByDoctor(doctorId: string): Promise<LabTest[]> {
    try {
        const id = parseInt(doctorId.replace('user_', ''));

        const sql = `
            SELECT
                lt.test_id,
                lt.patient_id,
                p.full_name as patient_name,
                lt.doctor_id,
                d.full_name as doctor_name,
                lt.appointment_id,
                lt.test_name,
                lt.test_status,
                lt.ordered_date,
                lt.completed_date,
                lt.result,
                lt.notes
            FROM Lab_Tests lt
            JOIN Users p ON lt.patient_id = p.user_id
            JOIN Users d ON lt.doctor_id = d.user_id
            WHERE lt.doctor_id = :id
            ORDER BY lt.ordered_date DESC
        `;

        const result = await executeQuery<DbLabTest>(sql, { id }, {
            fetchInfo: {
                "RESULT": { type: oracledb.STRING },
                "NOTES": { type: oracledb.STRING }
            }
        });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(test => ({
            id: `lab_${test.TEST_ID}`,
            patientId: `user_${test.PATIENT_ID}`,
            patientName: test.PATIENT_NAME,
            doctorId: `user_${test.DOCTOR_ID}`,
            doctorName: test.DOCTOR_NAME,
            appointmentId: test.APPOINTMENT_ID ? `appointment_${test.APPOINTMENT_ID}` : undefined,
            testType: test.TEST_NAME,
            status: mapStatus(test.TEST_STATUS),
            requestDate: test.ORDERED_DATE.toISOString().split('T')[0],
            resultDate: test.COMPLETED_DATE ? test.COMPLETED_DATE.toISOString().split('T')[0] : undefined,
            results: test.RESULT || undefined,
            notes: test.NOTES || undefined
        }));
    } catch (error) {
        console.error('Error fetching doctor lab tests:', error);
        throw error;
    }
}

export default {
    getAllLabTests,
    createLabTest,
    updateLabTest,
    getLabTestsByPatient,
    getLabTestsByDoctor
};
