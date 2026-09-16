-- ============================================================
-- HealSmart Hospital Management System
-- Sample Data for Testing
-- ============================================================

-- Note: Passwords should be hashed in production
-- For testing purposes, using simple passwords

-- ============================================================
-- Insert Sample Users
-- ============================================================

-- Admin User (ONLY ONE - Created by IT Department)
-- Username: bushramug9@gmail.com
-- Password: 12345678Bb@
INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, is_active)
VALUES (user_seq.NEXTVAL, 'System Administrator', 'bushramug9@gmail.com', '12345678Bb@', 'Admin', '0501234567', '1');

-- Doctors
INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, specialization, license_number, hire_date, consultation_fee, is_active)
VALUES (user_seq.NEXTVAL, 'Dr. Ahmed Al-Rashid', 'ahmed.rashid@healsmart.com', 'doctor123', 'Doctor', '0501111111', 'Cardiology', 'Cardiologist', 'DOC-2020-001', TO_DATE('2020-01-15', 'YYYY-MM-DD'), 250.00, '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, specialization, license_number, hire_date, consultation_fee, is_active)
VALUES (user_seq.NEXTVAL, 'Dr. Fatima Hassan', 'fatima.hassan@healsmart.com', 'doctor123', 'Doctor', '0501111112', 'Pediatrics', 'Pediatrician', 'DOC-2019-002', TO_DATE('2019-06-01', 'YYYY-MM-DD'), 200.00, '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, specialization, license_number, hire_date, consultation_fee, is_active)
VALUES (user_seq.NEXTVAL, 'Dr. Mohammed Ali', 'mohammed.ali@healsmart.com', 'doctor123', 'Doctor', '0501111113', 'Orthopedics', 'Orthopedic Surgeon', 'DOC-2021-003', TO_DATE('2021-03-10', 'YYYY-MM-DD'), 300.00, '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, specialization, license_number, hire_date, consultation_fee, is_active)
VALUES (user_seq.NEXTVAL, 'Dr. Noura Abdullah', 'noura.abdullah@healsmart.com', 'doctor123', 'Doctor', '0501111114', 'Dermatology', 'Dermatologist', 'DOC-2020-004', TO_DATE('2020-09-20', 'YYYY-MM-DD'), 180.00, '1');

-- Nurses
INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, hire_date, is_active)
VALUES (user_seq.NEXTVAL, 'Nurse Aisha Ahmed', 'aisha.ahmed@healsmart.com', 'nurse123', 'Nurse', '0502222221', 'Cardiology', TO_DATE('2021-01-15', 'YYYY-MM-DD'), '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, hire_date, is_active)
VALUES (user_seq.NEXTVAL, 'Nurse Layla Mohammed', 'layla.mohammed@healsmart.com', 'nurse123', 'Nurse', '0502222222', 'Pediatrics', TO_DATE('2020-07-10', 'YYYY-MM-DD'), '1');

-- Lab Technician
INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, department, hire_date, is_active)
VALUES (user_seq.NEXTVAL, 'Lab Tech Omar Hassan', 'omar.hassan@healsmart.com', 'lab123', 'LabTechnician', '0503333331', 'Laboratory', TO_DATE('2020-05-01', 'YYYY-MM-DD'), '1');

-- Patients
INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, date_of_birth, gender, address, national_id, is_active)
VALUES (user_seq.NEXTVAL, 'Ali Ibrahim', 'ali.ibrahim@email.com', 'patient123', 'Patient', '0504444441', TO_DATE('1990-05-15', 'YYYY-MM-DD'), 'Male', '123 King Fahd Road, Riyadh', '1234567890', '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, date_of_birth, gender, address, national_id, is_active)
VALUES (user_seq.NEXTVAL, 'Maryam Khalid', 'maryam.khalid@email.com', 'patient123', 'Patient', '0504444442', TO_DATE('1985-08-22', 'YYYY-MM-DD'), 'Female', '456 Al Olaya Street, Riyadh', '0987654321', '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, date_of_birth, gender, address, national_id, is_active)
VALUES (user_seq.NEXTVAL, 'Khalid Ahmed', 'khalid.ahmed@email.com', 'patient123', 'Patient', '0504444443', TO_DATE('2010-03-10', 'YYYY-MM-DD'), 'Male', '789 Prince Sultan Road, Jeddah', '1122334455', '1');

INSERT INTO Users (user_id, full_name, email, password_hash, role, phone_number, date_of_birth, gender, address, national_id, is_active)
VALUES (user_seq.NEXTVAL, 'Sara Mohammed', 'sara.mohammed@email.com', 'patient123', 'Patient', '0504444444', TO_DATE('1995-11-30', 'YYYY-MM-DD'), 'Female', '321 Tahlia Street, Jeddah', '5544332211', '1');

-- ============================================================
-- Insert Sample Appointments
-- ============================================================

INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, department, reason)
VALUES (appointment_seq.NEXTVAL, 11, 4, TO_DATE('2025-11-25', 'YYYY-MM-DD'), '09:00 AM', 'Scheduled', 'Cardiology', 'Regular checkup');

INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, department, reason)
VALUES (appointment_seq.NEXTVAL, 12, 5, TO_DATE('2025-11-26', 'YYYY-MM-DD'), '10:30 AM', 'Scheduled', 'Pediatrics', 'Vaccination');

INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, department, reason)
VALUES (appointment_seq.NEXTVAL, 13, 5, TO_DATE('2025-11-23', 'YYYY-MM-DD'), '02:00 PM', 'Completed', 'Pediatrics', 'Cold and flu symptoms');

INSERT INTO Appointments (appointment_id, patient_id, doctor_id, appointment_date, appointment_time, status, department, reason)
VALUES (appointment_seq.NEXTVAL, 14, 7, TO_DATE('2025-11-24', 'YYYY-MM-DD'), '11:00 AM', 'Confirmed', 'Dermatology', 'Skin rash');

-- ============================================================
-- Insert Sample Medical Records
-- ============================================================

INSERT INTO Medical_Records (record_id, patient_id, doctor_id, appointment_id, visit_date, diagnosis, treatment, prescription, notes)
VALUES (medical_record_seq.NEXTVAL, 13, 5, 3, TO_DATE('2025-11-23', 'YYYY-MM-DD'),
        'Common cold with mild fever',
        'Rest, plenty of fluids, and prescribed medication',
        'Paracetamol 500mg - 3 times daily for 3 days',
        'Patient advised to return if symptoms worsen');

-- ============================================================
-- Insert Sample Insurance
-- ============================================================

INSERT INTO Insurance (insurance_id, patient_id, provider_name, policy_number, policy_type, coverage_amount, expiration_date, is_valid, verification_status)
VALUES (insurance_seq.NEXTVAL, 11, 'BUPA Arabia', 'BUP-2024-12345', 'Comprehensive', 500000.00, TO_DATE('2026-12-31', 'YYYY-MM-DD'), '1', 'Verified');

INSERT INTO Insurance (insurance_id, patient_id, provider_name, policy_number, policy_type, coverage_amount, expiration_date, is_valid, verification_status)
VALUES (insurance_seq.NEXTVAL, 14, 'Tawuniya', 'TAW-2024-67890', 'Basic', 250000.00, TO_DATE('2025-06-30', 'YYYY-MM-DD'), '1', 'Verified');

-- ============================================================
-- Insert Sample Payments
-- ============================================================

INSERT INTO Payments (payment_id, patient_id, appointment_id, amount, payment_method, payment_status, final_amount, payment_date)
VALUES (payment_seq.NEXTVAL, 13, 3, 300.00, 'Card', 'Completed', 300.00, CURRENT_TIMESTAMP);

-- ============================================================
-- Insert Sample Lab Tests
-- ============================================================

INSERT INTO Lab_Tests (test_id, patient_id, doctor_id, appointment_id, test_name, test_type, test_status, ordered_date)
VALUES (lab_test_seq.NEXTVAL, 11, 4, 1, 'Complete Blood Count (CBC)', 'Blood Test', 'Ordered', CURRENT_TIMESTAMP);

INSERT INTO Lab_Tests (test_id, patient_id, doctor_id, appointment_id, test_name, test_type, test_status, ordered_date, completed_date, result, lab_technician_id)
VALUES (lab_test_seq.NEXTVAL, 13, 5, 3, 'Throat Swab Culture', 'Culture Test', 'Completed', CURRENT_TIMESTAMP - 2, CURRENT_TIMESTAMP - 1, 'Negative for bacterial infection', 10);

-- ============================================================
-- Insert Sample Prescriptions
-- ============================================================

INSERT INTO Prescriptions (prescription_id, patient_id, doctor_id, appointment_id, medical_record_id, medication_name, dosage, frequency, duration, instructions, status)
VALUES (prescription_seq.NEXTVAL, 13, 5, 3, 1, 'Paracetamol', '500mg', '3 times daily', '3 days', 'Take after meals', 'Active');

INSERT INTO Prescriptions (prescription_id, patient_id, doctor_id, appointment_id, medical_record_id, medication_name, dosage, frequency, duration, instructions, status)
VALUES (prescription_seq.NEXTVAL, 13, 5, 3, 1, 'Vitamin C', '1000mg', 'Once daily', '7 days', 'Take with water', 'Active');

-- ============================================================
-- Commit all changes
-- ============================================================

COMMIT;

-- Display success message
SELECT 'Sample data inserted successfully!' AS STATUS FROM DUAL;
SELECT COUNT(*) AS USER_COUNT FROM Users;
SELECT COUNT(*) AS APPOINTMENT_COUNT FROM Appointments;
SELECT COUNT(*) AS MEDICAL_RECORD_COUNT FROM Medical_Records;
