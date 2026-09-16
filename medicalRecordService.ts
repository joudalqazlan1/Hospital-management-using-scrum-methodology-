/**
 * Medical Record Service - Database operations for Medical_Records table
 * HealSmart Hospital Management System
 */

import { executeQuery } from '../database/connection';
import { MedicalRecord } from '../types';
import oracledb from 'oracledb';

interface DbMedicalRecord {
    RECORD_ID: number;
    PATIENT_ID: number;
    DOCTOR_ID: number;
    DOCTOR_NAME: string;
    APPOINTMENT_ID: number | null;
    VISIT_DATE: Date;
    DIAGNOSIS: string;
    TREATMENT: string;
    PRESCRIPTION: string | null;
    NOTES: string | null;
}

/**
 * Get all medical records
 */
export async function getAllMedicalRecords(): Promise<MedicalRecord[]> {
    try {
        console.log('📋 Starting getAllMedicalRecords()');
        const sql = `
            SELECT
                mr.record_id,
                mr.patient_id,
                mr.doctor_id,
                d.full_name as doctor_name,
                mr.appointment_id,
                mr.visit_date,
                mr.diagnosis,
                mr.treatment,
                mr.prescription,
                mr.notes
            FROM Medical_Records mr
            JOIN Users d ON mr.doctor_id = d.user_id
            ORDER BY mr.visit_date DESC
        `;

        console.log('📋 SQL prepared, calling executeQuery...');
        const result = await executeQuery<DbMedicalRecord>(sql, [], {
            fetchInfo: {
                "DIAGNOSIS": { type: oracledb.STRING },
                "TREATMENT": { type: oracledb.STRING },
                "PRESCRIPTION": { type: oracledb.STRING },
                "NOTES": { type: oracledb.STRING }
            }
        });
        console.log('📋 Query executed successfully, rows:', result.rows?.length);

        if (!result.rows) {
            console.log('📋 No rows returned from query');
            return [];
        }

        console.log('📋 Mapping', result.rows.length, 'records...');
        const mappedRecords = result.rows.map((record, index) => {
            return {
                id: `record_${record.RECORD_ID}`,
                patientId: `user_${record.PATIENT_ID}`,
                doctorId: `user_${record.DOCTOR_ID}`,
                doctorName: record.DOCTOR_NAME,
                appointmentId: record.APPOINTMENT_ID ? `appointment_${record.APPOINTMENT_ID}` : '',
                date: record.VISIT_DATE.toISOString().split('T')[0],
                diagnosis: record.DIAGNOSIS || '',
                treatment: record.TREATMENT || '',
                prescription: record.PRESCRIPTION || '',
                notes: record.NOTES || ''
            };
        });
        console.log('📋 Successfully mapped records, returning', mappedRecords.length, 'records');
        return mappedRecords;
    } catch (error: any) {
        // Extract error details without triggering circular JSON
        const errorCode = error?.errorNum || error?.code || 'unknown';
        console.error('📋 ERROR in getAllMedicalRecords - Error code:', errorCode);
        console.error('Error stack (first 200 chars):', error?.stack?.substring?.(0, 200) || 'No stack');

        // Throw a simple string-based error
        throw new Error('Failed to fetch medical records');
    }
}

/**
 * Create a new medical record
 */
export async function createMedicalRecord(record: Omit<MedicalRecord, 'id'>): Promise<MedicalRecord> {
    try {
        const patientId = parseInt(record.patientId.replace('user_', ''));
        const doctorId = parseInt(record.doctorId.replace('user_', ''));
        const appointmentId = record.appointmentId ? parseInt(record.appointmentId.replace('appointment_', '')) : null;

        const sql = `
            INSERT INTO Medical_Records (
                record_id, patient_id, doctor_id, appointment_id,
                visit_date, diagnosis, treatment, prescription, notes, created_at
            )
            VALUES (
                medical_record_seq.NEXTVAL, :patientId, :doctorId, :appointmentId,
                TO_DATE(:visitDate, 'YYYY-MM-DD'), :diagnosis, :treatment,
                :prescription, :notes, CURRENT_TIMESTAMP
            )
            RETURNING record_id INTO :id
        `;

        const binds = {
            patientId,
            doctorId,
            appointmentId,
            visitDate: record.date,
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            prescription: record.prescription || null,
            notes: record.notes || null,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const recordId = result.outBinds?.id;

        return {
            id: `record_${recordId}`,
            ...record
        };
    } catch (error) {
        console.error('Error creating medical record:', error);
        throw error;
    }
}

/**
 * Get medical records by patient ID
 */
export async function getMedicalRecordsByPatient(patientId: string): Promise<MedicalRecord[]> {
    try {
        const id = parseInt(patientId.replace('user_', ''));

        const sql = `
            SELECT
                mr.record_id,
                mr.patient_id,
                mr.doctor_id,
                d.full_name as doctor_name,
                mr.appointment_id,
                mr.visit_date,
                mr.diagnosis,
                mr.treatment,
                mr.prescription,
                mr.notes
            FROM Medical_Records mr
            JOIN Users d ON mr.doctor_id = d.user_id
            WHERE mr.patient_id = :id
            ORDER BY mr.visit_date DESC
        `;

        const result = await executeQuery<DbMedicalRecord>(sql, { id });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(record => ({
            id: `record_${record.RECORD_ID}`,
            patientId: `user_${record.PATIENT_ID}`,
            doctorId: `user_${record.DOCTOR_ID}`,
            doctorName: record.DOCTOR_NAME,
            appointmentId: record.APPOINTMENT_ID ? `appointment_${record.APPOINTMENT_ID}` : '',
            date: record.VISIT_DATE.toISOString().split('T')[0],
            diagnosis: record.DIAGNOSIS,
            treatment: record.TREATMENT,
            prescription: record.PRESCRIPTION || '',
            notes: record.NOTES || ''
        }));
    } catch (error) {
        console.error('Error fetching patient medical records:', error);
        throw error;
    }
}

export default {
    getAllMedicalRecords,
    createMedicalRecord,
    getMedicalRecordsByPatient
};
