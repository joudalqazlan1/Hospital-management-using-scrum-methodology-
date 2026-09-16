-- ============================================================
-- HealSmart Hospital Management System
-- Oracle Database Schema
-- Database: localhost/XEPDB1
-- User: project332
-- ============================================================

-- Drop existing tables in reverse order (to handle foreign keys)
BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Payments CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Lab_Tests CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Prescriptions CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Medical_Records CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Appointments CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Insurance CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP TABLE Users CASCADE CONSTRAINTS';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- Drop sequences
BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE user_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE appointment_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE medical_record_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE insurance_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE payment_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE lab_test_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

BEGIN
   EXECUTE IMMEDIATE 'DROP SEQUENCE prescription_seq';
EXCEPTION
   WHEN OTHERS THEN NULL;
END;
/

-- ============================================================
-- Create Sequences for Auto-increment IDs
-- ============================================================

CREATE SEQUENCE user_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE appointment_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE medical_record_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE insurance_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE payment_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE lab_test_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

CREATE SEQUENCE prescription_seq
  START WITH 1
  INCREMENT BY 1
  NOCACHE
  NOCYCLE;

-- ============================================================
-- Table: Users
-- Stores all system users (Admin, Doctor, Patient, Staff)
-- ============================================================

CREATE TABLE Users (
  user_id         NUMBER PRIMARY KEY,
  full_name       VARCHAR2(100) NOT NULL,
  email           VARCHAR2(100) UNIQUE NOT NULL,
  password_hash   VARCHAR2(255) NOT NULL,
  role            VARCHAR2(20) NOT NULL CHECK (role IN ('Admin', 'Doctor', 'Patient', 'Nurse', 'LabTechnician', 'Accountant', 'Manager')),

  -- Common fields
  phone_number    VARCHAR2(20),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active       CHAR(1) DEFAULT '1' CHECK (is_active IN ('0', '1')),

  -- Patient specific fields
  date_of_birth   DATE,
  gender          VARCHAR2(10) CHECK (gender IN ('Male', 'Female', 'Other')),
  address         VARCHAR2(255),
  national_id     VARCHAR2(20),

  -- Staff specific fields (Doctor, Nurse, etc.)
  department      VARCHAR2(50),
  specialization  VARCHAR2(50),
  license_number  VARCHAR2(50),
  hire_date       DATE,
  consultation_fee NUMBER(10,2) DEFAULT 0,

  CONSTRAINT email_format_check CHECK (REGEXP_LIKE(email, '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'))
);

-- Index for faster lookups
CREATE INDEX idx_users_email ON Users(email);
CREATE INDEX idx_users_role ON Users(role);
CREATE INDEX idx_users_department ON Users(department);

-- ============================================================
-- Table: Appointments
-- Stores patient appointments with doctors
-- ============================================================

CREATE TABLE Appointments (
  appointment_id  NUMBER PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  doctor_id       NUMBER NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time VARCHAR2(10) NOT NULL,
  status          VARCHAR2(20) DEFAULT 'Scheduled'
                  CHECK (status IN ('Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'NoShow')),
  department      VARCHAR2(50),
  reason          VARCHAR2(255),
  notes           CLOB,
  consultation_fee NUMBER(10,2) DEFAULT 0,
  payment_method  VARCHAR2(20) CHECK (payment_method IN ('Visa', 'Mada', 'ApplePay')),
  payment_status  VARCHAR2(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed')),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_appointment_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_appointment_doctor FOREIGN KEY (doctor_id)
    REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_appointments_patient ON Appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON Appointments(doctor_id);
CREATE INDEX idx_appointments_date ON Appointments(appointment_date);
CREATE INDEX idx_appointments_status ON Appointments(status);

-- ============================================================
-- Table: Medical_Records
-- Stores patient medical records from doctor visits
-- ============================================================

CREATE TABLE Medical_Records (
  record_id       NUMBER PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  doctor_id       NUMBER NOT NULL,
  appointment_id  NUMBER,
  visit_date      DATE NOT NULL,
  diagnosis       CLOB NOT NULL,
  treatment       CLOB NOT NULL,
  prescription    CLOB,
  notes           CLOB,
  vital_signs     VARCHAR2(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_medical_record_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_doctor FOREIGN KEY (doctor_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_medical_record_appointment FOREIGN KEY (appointment_id)
    REFERENCES Appointments(appointment_id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_medical_records_patient ON Medical_Records(patient_id);
CREATE INDEX idx_medical_records_doctor ON Medical_Records(doctor_id);
CREATE INDEX idx_medical_records_date ON Medical_Records(visit_date);

-- ============================================================
-- Table: Insurance
-- Stores patient insurance information
-- ============================================================

CREATE TABLE Insurance (
  insurance_id      NUMBER PRIMARY KEY,
  patient_id        NUMBER NOT NULL,
  provider_name     VARCHAR2(100) NOT NULL,
  policy_number     VARCHAR2(50) NOT NULL,
  policy_type       VARCHAR2(50),
  coverage_amount   NUMBER(10,2),
  expiration_date   DATE NOT NULL,
  is_valid          CHAR(1) DEFAULT '1' CHECK (is_valid IN ('0', '1')),
  verification_status VARCHAR2(20) DEFAULT 'Pending'
                      CHECK (verification_status IN ('Pending', 'Verified', 'Rejected')),
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_insurance_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT unique_policy UNIQUE (patient_id, policy_number)
);

-- Indexes
CREATE INDEX idx_insurance_patient ON Insurance(patient_id);
CREATE INDEX idx_insurance_provider ON Insurance(provider_name);
CREATE INDEX idx_insurance_status ON Insurance(verification_status);

-- ============================================================
-- Table: Payments
-- Stores billing and payment information
-- ============================================================

CREATE TABLE Payments (
  payment_id      NUMBER PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  appointment_id  NUMBER,
  amount          NUMBER(10,2) NOT NULL,
  payment_method  VARCHAR2(20) CHECK (payment_method IN ('Cash', 'Card', 'Insurance', 'Visa', 'Mada', 'ApplePay')),
  payment_status  VARCHAR2(20) DEFAULT 'Pending'
                  CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
  transaction_id  VARCHAR2(100),
  insurance_id    NUMBER,
  discount_amount NUMBER(10,2) DEFAULT 0,
  final_amount    NUMBER(10,2),
  payment_date    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes           VARCHAR2(500),

  CONSTRAINT fk_payment_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_payment_appointment FOREIGN KEY (appointment_id)
    REFERENCES Appointments(appointment_id) ON DELETE SET NULL,
  CONSTRAINT fk_payment_insurance FOREIGN KEY (insurance_id)
    REFERENCES Insurance(insurance_id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_payments_patient ON Payments(patient_id);
CREATE INDEX idx_payments_status ON Payments(payment_status);
CREATE INDEX idx_payments_date ON Payments(payment_date);

-- ============================================================
-- Table: Lab_Tests
-- Stores laboratory test orders and results
-- ============================================================

CREATE TABLE Lab_Tests (
  test_id         NUMBER PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  doctor_id       NUMBER NOT NULL,
  appointment_id  NUMBER,
  test_name       VARCHAR2(100) NOT NULL,
  test_type       VARCHAR2(50),
  test_status     VARCHAR2(20) DEFAULT 'Ordered'
                  CHECK (test_status IN ('Ordered', 'InProgress', 'Completed', 'Cancelled')),
  ordered_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_date  TIMESTAMP,
  result          CLOB,
  result_file_url VARCHAR2(500),
  lab_technician_id NUMBER,
  notes           VARCHAR2(500),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_lab_test_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_lab_test_doctor FOREIGN KEY (doctor_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_lab_test_appointment FOREIGN KEY (appointment_id)
    REFERENCES Appointments(appointment_id) ON DELETE SET NULL,
  CONSTRAINT fk_lab_test_technician FOREIGN KEY (lab_technician_id)
    REFERENCES Users(user_id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_lab_tests_patient ON Lab_Tests(patient_id);
CREATE INDEX idx_lab_tests_doctor ON Lab_Tests(doctor_id);
CREATE INDEX idx_lab_tests_status ON Lab_Tests(test_status);

-- ============================================================
-- Table: Prescriptions
-- Stores medication prescriptions
-- ============================================================

CREATE TABLE Prescriptions (
  prescription_id NUMBER PRIMARY KEY,
  patient_id      NUMBER NOT NULL,
  doctor_id       NUMBER NOT NULL,
  appointment_id  NUMBER,
  medical_record_id NUMBER,
  medication_name VARCHAR2(200) NOT NULL,
  dosage          VARCHAR2(100) NOT NULL,
  frequency       VARCHAR2(100),
  duration        VARCHAR2(100),
  instructions    VARCHAR2(500),
  prescribed_date DATE DEFAULT SYSDATE,
  status          VARCHAR2(20) DEFAULT 'Active'
                  CHECK (status IN ('Active', 'Completed', 'Cancelled')),
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_prescription_patient FOREIGN KEY (patient_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_prescription_doctor FOREIGN KEY (doctor_id)
    REFERENCES Users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_prescription_appointment FOREIGN KEY (appointment_id)
    REFERENCES Appointments(appointment_id) ON DELETE SET NULL,
  CONSTRAINT fk_prescription_record FOREIGN KEY (medical_record_id)
    REFERENCES Medical_Records(record_id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_prescriptions_patient ON Prescriptions(patient_id);
CREATE INDEX idx_prescriptions_doctor ON Prescriptions(doctor_id);
CREATE INDEX idx_prescriptions_status ON Prescriptions(status);

-- ============================================================
-- Commit all changes
-- ============================================================

COMMIT;

-- Display success message
SELECT 'Database schema created successfully!' AS STATUS FROM DUAL;
