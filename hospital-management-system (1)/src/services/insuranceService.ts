/**
 * Insurance Service - Database operations for Insurance table
 * HealSmart Hospital Management System
 */

import { executeQuery } from '../database/connection';
import { InsuranceInfo } from '../types';
import oracledb from 'oracledb';

interface DbInsurance {
    INSURANCE_ID: number;
    PATIENT_ID: number;
    PROVIDER_NAME: string;
    POLICY_NUMBER: string;
    EXPIRATION_DATE: Date;
    IS_VALID: string;
    CREATED_AT: Date;
}

/**
 * Get all insurance records
 */
export async function getAllInsurance(): Promise<InsuranceInfo[]> {
    try {
        const sql = `
            SELECT
                insurance_id, patient_id, provider_name, policy_number,
                expiration_date, is_valid, created_at
            FROM Insurance
            ORDER BY created_at DESC
        `;

        const result = await executeQuery<DbInsurance>(sql);

        if (!result.rows) {
            return [];
        }

        return result.rows.map(ins => ({
            id: `insurance_${ins.INSURANCE_ID}`,
            patientId: `user_${ins.PATIENT_ID}`,
            provider: ins.PROVIDER_NAME,
            policyNumber: ins.POLICY_NUMBER,
            expirationDate: ins.EXPIRATION_DATE.toISOString().split('T')[0],
            isActive: ins.IS_VALID === '1',
            createdAt: ins.CREATED_AT.toISOString()
        }));
    } catch (error) {
        console.error('Error fetching insurance records:', error);
        throw error;
    }
}

/**
 * Create a new insurance record
 */
export async function createInsurance(insurance: Omit<InsuranceInfo, 'id'>): Promise<InsuranceInfo> {
    try {
        const patientId = parseInt(insurance.patientId.replace('user_', ''));

        const sql = `
            INSERT INTO Insurance (
                insurance_id, patient_id, provider_name, policy_number,
                expiration_date, is_valid, created_at
            )
            VALUES (
                insurance_seq.NEXTVAL, :patientId, :provider, :policyNumber,
                TO_DATE(:expirationDate, 'YYYY-MM-DD'), :isActive, CURRENT_TIMESTAMP
            )
            RETURNING insurance_id INTO :id
        `;

        const binds = {
            patientId,
            provider: insurance.provider,
            policyNumber: insurance.policyNumber,
            expirationDate: insurance.expirationDate,
            isActive: insurance.isActive ? '1' : '0',
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };

        const result = await executeQuery(sql, binds);
        const insuranceId = result.outBinds?.id;

        return {
            id: `insurance_${insuranceId}`,
            ...insurance,
            createdAt: new Date().toISOString()
        };
    } catch (error) {
        console.error('Error creating insurance record:', error);
        throw error;
    }
}

/**
 * Get insurance records by patient ID
 */
export async function getInsuranceByPatient(patientId: string): Promise<InsuranceInfo[]> {
    try {
        const id = parseInt(patientId.replace('user_', ''));

        const sql = `
            SELECT
                insurance_id, patient_id, provider_name, policy_number,
                expiration_date, is_valid, created_at
            FROM Insurance
            WHERE patient_id = :id
            ORDER BY created_at DESC
        `;

        const result = await executeQuery<DbInsurance>(sql, { id });

        if (!result.rows) {
            return [];
        }

        return result.rows.map(ins => ({
            id: `insurance_${ins.INSURANCE_ID}`,
            patientId: `user_${ins.PATIENT_ID}`,
            provider: ins.PROVIDER_NAME,
            policyNumber: ins.POLICY_NUMBER,
            expirationDate: ins.EXPIRATION_DATE.toISOString().split('T')[0],
            isActive: ins.IS_VALID === '1',
            createdAt: ins.CREATED_AT.toISOString()
        }));
    } catch (error) {
        console.error('Error fetching patient insurance:', error);
        throw error;
    }
}

interface DbSupportedInsurance {
    INSURANCE_ID: number;
    PROVIDER_NAME: string;
    IS_ACTIVE: string;
}

/**
 * Get all supported insurance providers
 */
export async function getSupportedInsurance(): Promise<Array<{ id: number; providerName: string; isActive: boolean }>> {
    try {
        const sql = `
            SELECT insurance_id, provider_name, is_active
            FROM SupportedInsurance
            ORDER BY provider_name
        `;
        const result = await executeQuery<DbSupportedInsurance>(sql);

        if (!result.rows) return [];

        return result.rows.map(row => ({
            id: row.INSURANCE_ID,
            providerName: row.PROVIDER_NAME,
            isActive: row.IS_ACTIVE === 'Y'
        }));
    } catch (error) {
        console.error('Error fetching supported insurance:', error);
        throw error;
    }
}

/**
 * Add a new supported insurance provider
 */
export async function addSupportedInsurance(providerName: string): Promise<{ id: number; providerName: string; isActive: boolean }> {
    try {
        const sql = `
            INSERT INTO SupportedInsurance (insurance_id, provider_name, is_active)
            VALUES (insurance_seq.NEXTVAL, :providerName, 'Y')
            RETURNING insurance_id INTO :id
        `;
        const binds = {
            providerName,
            id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        };
        const result = await executeQuery(sql, binds);
        const id = result.outBinds?.id;

        return { id, providerName, isActive: true };
    } catch (error) {
        console.error('Error adding supported insurance:', error);
        throw error;
    }
}

/**
 * Update supported insurance provider status
 */
export async function updateSupportedInsurance(id: number, isActive: boolean): Promise<void> {
    try {
        const sql = `
            UPDATE SupportedInsurance
            SET is_active = :isActive
            WHERE insurance_id = :id
        `;
        await executeQuery(sql, { id, isActive: isActive ? 'Y' : 'N' });
    } catch (error) {
        console.error('Error updating supported insurance:', error);
        throw error;
    }
}

/**
 * Delete supported insurance provider
 */
export async function deleteSupportedInsurance(id: number): Promise<void> {
    try {
        const sql = `DELETE FROM SupportedInsurance WHERE insurance_id = :id`;
        await executeQuery(sql, { id });
    } catch (error) {
        console.error('Error deleting supported insurance:', error);
        throw error;
    }
}

/**
 * Check if insurance provider is supported
 */
export async function checkInsuranceSupport(provider: string): Promise<boolean> {
    try {
        const sql = `
            SELECT COUNT(*) as count
            FROM SupportedInsurance
            WHERE UPPER(provider_name) = UPPER(:provider) AND is_active = 'Y'
        `;
        const result = await executeQuery<{ COUNT: number }>(sql, { provider });
        return result.rows && result.rows.length > 0 && result.rows[0].COUNT > 0;
    } catch (error) {
        console.error('Error checking insurance support:', error);
        throw error;
    }
}

export default {
    getAllInsurance,
    createInsurance,
    getInsuranceByPatient,
    getSupportedInsurance,
    addSupportedInsurance,
    updateSupportedInsurance,
    deleteSupportedInsurance,
    checkInsuranceSupport
};
