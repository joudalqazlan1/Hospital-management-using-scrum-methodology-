/**
 * User Service - Database operations for Users table
 * HealSmart Hospital Management System
 */

import { executeQuery } from '../database/connection';
import { Patient, Staff, Role, User } from '../types';
import oracledb from 'oracledb';

interface DbUser {
    USER_ID: number;
    FULL_NAME: string;
    EMAIL: string;
    PASSWORD_HASH: string;
    ROLE: string;
    PHONE_NUMBER: string | null;
    DATE_OF_BIRTH: Date | null;
    DEPARTMENT: string | null;
    CONSULTATION_FEE: number | null;
    CREATED_AT: Date;
    IS_ACTIVE: string;
}

/**
 * Authenticate user login
 */
export async function authenticateUser(email: string, password: string, role?: Role): Promise<Patient | Staff | null> {
    try {
        console.log('🔐 Authentication attempt:', { email, password });

        const sql = `
            SELECT user_id, full_name, email, password_hash as password, role,
                   phone_number as contact_number, date_of_birth, department,
                   consultation_fee, created_at, is_active
            FROM Users
            WHERE email = :email
              AND password_hash = :password
              AND is_active = '1'
        `;

        const result = await executeQuery<DbUser>(sql, {
            email,
            password // In production, this should be hashed
        });

        console.log('🔍 Full query result:', { rowCount: result.rows?.length || 0, rows: result.rows });

        if (!result.rows || result.rows.length === 0) {
            console.log('❌ No user found with provided credentials');
            return null;
        }

        const user = result.rows[0];

        // Map database result to application type
        if (user.ROLE === Role.Patient) {
            return {
                id: `user_${user.USER_ID}`,
                fullName: user.FULL_NAME,
                email: user.EMAIL,
                password: user.PASSWORD_HASH,
                role: Role.Patient,
                dateOfBirth: user.DATE_OF_BIRTH ? user.DATE_OF_BIRTH.toISOString().split('T')[0] : '',
                contactNumber: user.PHONE_NUMBER || ''
            } as Patient;
        } else {
            return {
                id: `user_${user.USER_ID}`,
                fullName: user.FULL_NAME,
                email: user.EMAIL,
                password: user.PASSWORD_HASH,
                role: user.ROLE as Role.Admin | Role.Doctor | Role.LabTechnician | Role.Marketing | Role.Accountant | Role.CustomerService,
                department: user.DEPARTMENT || '',
                contactNumber: user.PHONE_NUMBER || '',
                consultationFee: user.CONSULTATION_FEE || undefined
            } as Staff;
        }
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
}

/**
 * Register a new patient
 */
export async function registerPatient(patient: Omit<Patient, 'id'>): Promise<Patient> {
    try {
        const sql = `
            INSERT INTO Users (user_id, full_name, email, password_hash, role,
                             phone_number, date_of_birth, is_active, created_at)
            VALUES (user_seq.NEXTVAL, :fullName, :email, :password, :role,
                   :contactNumber, TO_DATE(:dateOfBirth, 'YYYY-MM-DD'), '1', CURRENT_TIMESTAMP)
            RETURNING user_id INTO :id
        `;

        const binds = {
            fullName: patient.fullName,
            email: patient.email,
            password: patient.password,
            role: Role.Patient,
            contactNumber: patient.contactNumber,
            dateOfBirth: patient.dateOfBirth,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const userId = result.outBinds?.id;

        return {
            id: `user_${userId}`,
            ...patient
        };
    } catch (error) {
        console.error('Error registering patient:', error);
        throw error;
    }
}

/**
 * Get all staff members (excluding admins and patients)
 */
export async function getAllStaff(): Promise<Staff[]> {
    try {
        const sql = `
            SELECT user_id, full_name, email, password_hash as password, role,
                   department, phone_number as contact_number, consultation_fee
            FROM Users
            WHERE role NOT IN ('Admin', 'Patient')
              AND is_active = '1'
            ORDER BY role, full_name
        `;

        const result = await executeQuery<DbUser>(sql);

        if (!result.rows) {
            return [];
        }

        return result.rows.map(user => ({
            id: `user_${user.USER_ID}`,
            fullName: user.FULL_NAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            role: user.ROLE as Role.Doctor | Role.LabTechnician | Role.Marketing | Role.Accountant | Role.CustomerService,
            department: user.DEPARTMENT || '',
            contactNumber: user.PHONE_NUMBER || '',
            consultationFee: user.CONSULTATION_FEE || undefined
        }));
    } catch (error) {
        console.error('Error fetching staff:', error);
        throw error;
    }
}

/**
 * Add a new staff member
 */
export async function addStaff(staff: Omit<Staff, 'id'>): Promise<Staff> {
    try {
        const sql = `
            INSERT INTO Users (user_id, full_name, email, password_hash, role,
                             department, phone_number, consultation_fee, is_active, created_at)
            VALUES (user_seq.NEXTVAL, :fullName, :email, :password, :role,
                   :department, :contactNumber, :consultationFee, '1', CURRENT_TIMESTAMP)
            RETURNING user_id INTO :id
        `;

        const binds = {
            fullName: staff.fullName,
            email: staff.email,
            password: staff.password,
            role: staff.role,
            department: staff.department,
            contactNumber: staff.contactNumber,
            consultationFee: staff.consultationFee || 0,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const userId = result.outBinds?.id;

        return {
            id: `user_${userId}`,
            ...staff
        };
    } catch (error) {
        console.error('Error adding staff:', error);
        throw error;
    }
}

/**
 * Delete a staff member
 */
export async function deleteStaff(staffId: string): Promise<void> {
    try {
        const userId = parseInt(staffId.replace('user_', ''));

        const sql = `
            UPDATE Users
            SET is_active = '0'
            WHERE user_id = :userId
        `;

        await executeQuery(sql, { userId });
    } catch (error) {
        console.error('Error deleting staff:', error);
        throw error;
    }
}

/**
 * Get all patients
 */
export async function getAllPatients(): Promise<Patient[]> {
    try {
        const sql = `
            SELECT user_id, full_name, email, password_hash as password,
                   phone_number as contact_number, date_of_birth
            FROM Users
            WHERE role = 'Patient'
              AND is_active = '1'
            ORDER BY full_name
        `;

        const result = await executeQuery<DbUser>(sql);

        if (!result.rows) {
            return [];
        }

        return result.rows.map(user => ({
            id: `user_${user.USER_ID}`,
            fullName: user.FULL_NAME,
            email: user.EMAIL,
            password: user.PASSWORD_HASH,
            role: Role.Patient,
            dateOfBirth: user.DATE_OF_BIRTH ? user.DATE_OF_BIRTH.toISOString().split('T')[0] : '',
            contactNumber: user.PHONE_NUMBER || ''
        }));
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw error;
    }
}

export default {
    authenticateUser,
    registerPatient,
    getAllStaff,
    addStaff,
    deleteStaff,
    getAllPatients
};
