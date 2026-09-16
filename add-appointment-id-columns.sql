-- ============================================================
-- Migration: Add APPOINTMENT_ID columns to Lab_Tests and Medical_Records
-- Description: Ensures both tables have proper foreign keys to Appointments
-- Date: 2025-11-22
-- ============================================================

-- Add APPOINTMENT_ID column to Lab_Tests if it doesn't exist
DECLARE
  v_column_exists NUMBER := 0;
BEGIN
  SELECT COUNT(*)
  INTO v_column_exists
  FROM user_tab_columns
  WHERE table_name = 'LAB_TESTS' AND column_name = 'APPOINTMENT_ID';

  IF v_column_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE Lab_Tests ADD appointment_id NUMBER';
    DBMS_OUTPUT.PUT_LINE('Added APPOINTMENT_ID column to Lab_Tests table');
  ELSE
    DBMS_OUTPUT.PUT_LINE('APPOINTMENT_ID column already exists in Lab_Tests table');
  END IF;
END;
/

-- Add foreign key constraint to Lab_Tests if it doesn't exist
DECLARE
  v_constraint_exists NUMBER := 0;
BEGIN
  SELECT COUNT(*)
  INTO v_constraint_exists
  FROM user_constraints
  WHERE table_name = 'LAB_TESTS' AND constraint_name = 'FK_LAB_TEST_APPOINTMENT';

  IF v_constraint_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE Lab_Tests
      ADD CONSTRAINT fk_lab_test_appointment FOREIGN KEY (appointment_id)
      REFERENCES Appointments(appointment_id) ON DELETE CASCADE';
    DBMS_OUTPUT.PUT_LINE('Added foreign key constraint to Lab_Tests table');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Foreign key constraint already exists on Lab_Tests table');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE = -2275 THEN
      DBMS_OUTPUT.PUT_LINE('Foreign key constraint already exists on Lab_Tests table');
    ELSE
      RAISE;
    END IF;
END;
/

-- Verify Medical_Records has APPOINTMENT_ID column
DECLARE
  v_column_exists NUMBER := 0;
BEGIN
  SELECT COUNT(*)
  INTO v_column_exists
  FROM user_tab_columns
  WHERE table_name = 'MEDICAL_RECORDS' AND column_name = 'APPOINTMENT_ID';

  IF v_column_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE Medical_Records ADD appointment_id NUMBER';
    DBMS_OUTPUT.PUT_LINE('Added APPOINTMENT_ID column to Medical_Records table');
  ELSE
    DBMS_OUTPUT.PUT_LINE('APPOINTMENT_ID column already exists in Medical_Records table');
  END IF;
END;
/

-- Add foreign key constraint to Medical_Records if it doesn't exist
DECLARE
  v_constraint_exists NUMBER := 0;
BEGIN
  SELECT COUNT(*)
  INTO v_constraint_exists
  FROM user_constraints
  WHERE table_name = 'MEDICAL_RECORDS' AND constraint_name = 'FK_MED_REC_APPOINTMENT';

  IF v_constraint_exists = 0 THEN
    EXECUTE IMMEDIATE 'ALTER TABLE Medical_Records
      ADD CONSTRAINT fk_med_rec_appointment FOREIGN KEY (appointment_id)
      REFERENCES Appointments(appointment_id) ON DELETE CASCADE';
    DBMS_OUTPUT.PUT_LINE('Added foreign key constraint to Medical_Records table');
  ELSE
    DBMS_OUTPUT.PUT_LINE('Foreign key constraint already exists on Medical_Records table');
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    IF SQLCODE = -2275 THEN
      DBMS_OUTPUT.PUT_LINE('Foreign key constraint already exists on Medical_Records table');
    ELSE
      RAISE;
    END IF;
END;
/

-- Display summary
DECLARE
  v_lab_col NUMBER;
  v_med_col NUMBER;
BEGIN
  SELECT COUNT(*) INTO v_lab_col FROM user_tab_columns WHERE table_name = 'LAB_TESTS' AND column_name = 'APPOINTMENT_ID';
  SELECT COUNT(*) INTO v_med_col FROM user_tab_columns WHERE table_name = 'MEDICAL_RECORDS' AND column_name = 'APPOINTMENT_ID';

  DBMS_OUTPUT.PUT_LINE('=== Migration Summary ===');
  DBMS_OUTPUT.PUT_LINE('Lab_Tests.appointment_id exists: ' || CASE WHEN v_lab_col > 0 THEN 'YES' ELSE 'NO' END);
  DBMS_OUTPUT.PUT_LINE('Medical_Records.appointment_id exists: ' || CASE WHEN v_med_col > 0 THEN 'YES' ELSE 'NO' END);
  DBMS_OUTPUT.PUT_LINE('========================');
END;
/

COMMIT;
