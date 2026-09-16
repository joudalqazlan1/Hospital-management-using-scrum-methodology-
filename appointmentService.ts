/**
 * Appointment Service - Database operations for Appointments table
 * HealSmart Hospital Management System
 */

import { executeQuery } from '../database/connection';
import { Appointment } from '../types';
import oracledb from 'oracledb';

interface DbAppointment {
    APPOINTMENT_ID: number;
    PATIENT_ID: number;
    PATIENT_NAME: string;
    DOCTOR_ID: number;
    DOCTOR_NAME: string;
    APPOINTMENT_DATE: Date;
    APPOINTMENT_TIME: string;
    STATUS: string;
    DEPARTMENT: string | null;
    CONSULTATION_FEE: number | null;
    PAYMENT_METHOD: string | null;
    PAYMENT_STATUS: string | null;
}

/**
 * Get all appointments
 */
export async function getAllAppointments(): Promise<Appointment[]> {
    try {
        const sql = `
            SELECT
                a.appointment_id,
                a.patient_id,
                p.full_name as patient_name,
                a.doctor_id,
                d.full_name as doctor_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.department,
                a.consultation_fee,
                a.payment_method,
                a.payment_status
            FROM Appointments a
            JOIN Users p ON a.patient_id = p.user_id
            JOIN Users d ON a.doctor_id = d.user_id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;

        const result = await executeQuery<DbAppointment>(sql);

        if (!result.rows) {
            return [];
        }

        return result.rows.map(apt => ({
            id: `appointment_${apt.APPOINTMENT_ID}`,
            patientId: `user_${apt.PATIENT_ID}`,
            patientName: apt.PATIENT_NAME,
            doctorId: `user_${apt.DOCTOR_ID}`,
            doctorName: apt.DOCTOR_NAME,
            date: apt.APPOINTMENT_DATE.toISOString().split('T')[0],
            time: apt.APPOINTMENT_TIME,
            status: apt.STATUS as 'Upcoming' | 'Completed' | 'Cancelled',
            department: apt.DEPARTMENT || '',
            consultationFee: apt.CONSULTATION_FEE || undefined,
            paymentMethod: apt.PAYMENT_METHOD as 'Visa' | 'Mada' | 'ApplePay' | undefined,
            paymentStatus: apt.PAYMENT_STATUS as 'Pending' | 'Completed' | 'Failed' | undefined
        }));
    } catch (error) {
        console.error('Error fetching appointments:', error);
        throw error;
    }
}

/**
 * Create a new appointment
 */
export async function createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    try {
        const patientId = parseInt(appointment.patientId.replace('user_', ''));
        const doctorId = parseInt(appointment.doctorId.replace('user_', ''));

        const sql = `
            INSERT INTO Appointments (
                appointment_id, patient_id, doctor_id, appointment_date,
                appointment_time, status, department, consultation_fee,
                payment_method, payment_status, created_at
            )
            VALUES (
                appointment_seq.NEXTVAL, :patientId, :doctorId,
                TO_DATE(:appointmentDate, 'YYYY-MM-DD'), :appointmentTime, :status,
                :department, :consultationFee, :paymentMethod, :paymentStatus, CURRENT_TIMESTAMP
            )
            RETURNING appointment_id INTO :id
        `;

        const binds = {
            patientId,
            doctorId,
            appointmentDate: appointment.date,
            appointmentTime: appointment.time,
            status: appointment.status || 'Upcoming',
            department: appointment.department,
            consultationFee: appointment.consultationFee || 0,
            paymentMethod: appointment.paymentMethod || null,
            paymentStatus: appointment.paymentStatus || 'Pending',
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const appointmentId = result.outBinds?.id;

        return {
            id: `appointment_${appointmentId}`,
            ...appointment
        };
    } catch (error) {
        console.error('Error creating appointment:', error);
        throw error;
    }
}

/**
 * Update appointment status
 */
export async function updateAppointmentStatus(appointmentId: string, status: string): Promise<void> {
    try {
        const id = parseInt(appointmentId.replace('appointment_', ''));

        const sql = `
            UPDATE Appointments
            SET status = :status
            WHERE appointment_id = :id
        `;

        await executeQuery(sql, { id, status });
    } catch (error) {
        console.error('Error updating appointment status:', error);
        throw error;
    }
}

/**
 * Delete an appointment
 */
export async function deleteAppointment(appointmentId: string): Promise<void> {
    try {
        const id = parseInt(appointmentId.replace('appointment_', ''));

        const sql = `
            DELETE FROM Appointments
            WHERE appointment_id = :id
        `;

        await executeQuery(sql, { id });
    } catch (error) {
        console.error('Error deleting appointment:', error);
        throw error;
    }
}

/**
 * Get appointments by patient ID
 */
export async function getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    try {
        const id = parseInt(patientId.replace('user_', ''));

        const sql = `
            SELECT
                a.appointment_id,
                a.patient_id,
                p.full_name as patient_name,
                a.doctor_id,
                d.full_name as doctor_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.department,
                a.consultation_fee,
                a.payment_method,
                a.payment_status
            FROM Appointments a
            JOIN Users p ON a.patient_id = p.user_id
            JOIN Users d ON a.doctor_id = d.user_id
            WHERE a.patient_id = :id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;

        const result = await executeQuery<DbAppointment>(sql, { id });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(apt => ({
            id: `appointment_${apt.APPOINTMENT_ID}`,
            patientId: `user_${apt.PATIENT_ID}`,
            patientName: apt.PATIENT_NAME,
            doctorId: `user_${apt.DOCTOR_ID}`,
            doctorName: apt.DOCTOR_NAME,
            date: apt.APPOINTMENT_DATE.toISOString().split('T')[0],
            time: apt.APPOINTMENT_TIME,
            status: apt.STATUS as 'Upcoming' | 'Completed' | 'Cancelled',
            department: apt.DEPARTMENT || '',
            consultationFee: apt.CONSULTATION_FEE || undefined,
            paymentMethod: apt.PAYMENT_METHOD as 'Visa' | 'Mada' | 'ApplePay' | undefined,
            paymentStatus: apt.PAYMENT_STATUS as 'Pending' | 'Completed' | 'Failed' | undefined
        }));
    } catch (error) {
        console.error('Error fetching patient appointments:', error);
        throw error;
    }
}

/**
 * Get appointments by doctor ID
 */
export async function getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    try {
        const id = parseInt(doctorId.replace('user_', ''));

        const sql = `
            SELECT
                a.appointment_id,
                a.patient_id,
                p.full_name as patient_name,
                a.doctor_id,
                d.full_name as doctor_name,
                a.appointment_date,
                a.appointment_time,
                a.status,
                a.department,
                a.consultation_fee,
                a.payment_method,
                a.payment_status
            FROM Appointments a
            JOIN Users p ON a.patient_id = p.user_id
            JOIN Users d ON a.doctor_id = d.user_id
            WHERE a.doctor_id = :id
            ORDER BY a.appointment_date DESC, a.appointment_time DESC
        `;

        const result = await executeQuery<DbAppointment>(sql, { id });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(apt => ({
            id: `appointment_${apt.APPOINTMENT_ID}`,
            patientId: `user_${apt.PATIENT_ID}`,
            patientName: apt.PATIENT_NAME,
            doctorId: `user_${apt.DOCTOR_ID}`,
            doctorName: apt.DOCTOR_NAME,
            date: apt.APPOINTMENT_DATE.toISOString().split('T')[0],
            time: apt.APPOINTMENT_TIME,
            status: apt.STATUS as 'Upcoming' | 'Completed' | 'Cancelled',
            department: apt.DEPARTMENT || '',
            consultationFee: apt.CONSULTATION_FEE || undefined,
            paymentMethod: apt.PAYMENT_METHOD as 'Visa' | 'Mada' | 'ApplePay' | undefined,
            paymentStatus: apt.PAYMENT_STATUS as 'Pending' | 'Completed' | 'Failed' | undefined
        }));
    } catch (error) {
        console.error('Error fetching doctor appointments:', error);
        throw error;
    }
}

export default {
    getAllAppointments,
    createAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor
};
