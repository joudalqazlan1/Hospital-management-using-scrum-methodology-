import { MedicalRecord } from "../../types";

type MedicalRecordData = Omit<MedicalRecord, 'id'>;

// This is a mock function. In a real application, this would send data to a server.
export const saveMedicalRecord = async (recordData: MedicalRecordData): Promise<MedicalRecord> => {
    console.log('Saving medical record:', recordData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
        const existingRecordsRaw = localStorage.getItem('medicalRecords');
        const existingRecords: MedicalRecord[] = existingRecordsRaw ? JSON.parse(existingRecordsRaw) : [];
        
        const newRecord: MedicalRecord = {
            id: `rec_${Date.now()}`,
            ...recordData
        };

        const updatedRecords = [...existingRecords, newRecord];
        
        localStorage.setItem('medicalRecords', JSON.stringify(updatedRecords));

        // Dispatch a storage event to notify other tabs/windows (and the useLocalStorage hook)
        window.dispatchEvent(new StorageEvent('storage', {
            key: 'medicalRecords',
            newValue: JSON.stringify(updatedRecords),
        }));
        
        return newRecord;
    } catch (error) {
        console.error("Failed to save medical record to localStorage", error);
        throw new Error("Failed to save medical record.");
    }
};