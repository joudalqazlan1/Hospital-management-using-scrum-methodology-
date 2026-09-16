import React, { useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';

export const MedicalRecord = () => {
    const { currentUser, medicalRecords } = useAppContext();

    const patientRecords = useMemo(() => {
        if (!currentUser) return [];
        return medicalRecords
            .filter(record => record.patientId === currentUser.id)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentUser, medicalRecords]);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Medical Records</h2>
            {patientRecords.length === 0 ? (
                <div className="text-center text-gray-500 py-12 bg-gray-50 rounded-lg">
                    <p className="text-lg">You have no medical records available.</p>
                    <p className="text-sm mt-2">Records from your doctors will appear here after your appointments.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {patientRecords.map(record => (
                        <div key={record.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-primary-dark">
                            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b pb-3 mb-4">
                                <h3 className="text-xl font-bold text-gray-800">{record.diagnosis}</h3>
                                <div className="text-sm text-gray-500 mt-2 sm:mt-0 text-left sm:text-right">
                                    <p><strong>Appointment ID:</strong> {record.appointmentId}</p>
                                    <p><strong>Date:</strong> {record.date}</p>
                                    <p><strong>Doctor:</strong> {record.doctorName}</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
                                <div className="md:col-span-2">
                                    <h4 className="font-semibold text-gray-600">Treatment / Procedure</h4>
                                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{record.treatment}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-600">Prescription</h4>
                                    <p className="mt-1 p-3 bg-gray-50 rounded-md">{record.prescription}</p>
                                </div>
                                {record.notes && (
                                    <div>
                                        <h4 className="font-semibold text-gray-600">Additional Notes</h4>
                                        <p className="mt-1 p-3 bg-gray-50 rounded-md">{record.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};