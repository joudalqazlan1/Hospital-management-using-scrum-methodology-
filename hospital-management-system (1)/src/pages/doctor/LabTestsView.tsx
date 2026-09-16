import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LabTest } from '../../types';
import api from '../../api/client';

export const LabTestsView = () => {
    const { currentUser, labTests, refreshData, patients, appointments } = useAppContext();
    const [showRequestModal, setShowRequestModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState('');
    const [testType, setTestType] = useState('');
    const [notes, setNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');

    // Filter completed appointments with this doctor
    const eligibleAppointments = appointments.filter(apt =>
        apt.doctorId === currentUser?.id &&
        apt.status === 'Completed'
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter tests requested by this doctor
    const doctorTests = labTests.filter(test => test.doctorId === currentUser?.id);

    // Apply status filter
    const filteredTests = filterStatus === 'All'
        ? doctorTests
        : doctorTests.filter(test => test.status === filterStatus);

    // Sort by request date (newest first)
    const sortedTests = [...filteredTests].sort((a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );

    const handleRequestTest = async () => {
        if (!selectedAppointment || !testType.trim() || !currentUser) return;

        const appointment = appointments.find(a => a.id === selectedAppointment);
        if (!appointment) return;

        try {
            await api.labTests.create({
                patientId: appointment.patientId,
                patientName: appointment.patientName,
                doctorId: currentUser.id,
                doctorName: currentUser.fullName,
                appointmentId: appointment.id,
                testType: testType.trim(),
                requestDate: new Date().toISOString().split('T')[0],
                status: 'Pending',
                notes: notes.trim() || undefined
            });

            // Refresh data from database
            await refreshData();

            // Reset form
            setSelectedAppointment('');
            setTestType('');
            setNotes('');
            setShowRequestModal(false);
        } catch (error) {
            console.error('Error requesting lab test:', error);
            alert('Failed to request lab test. Please try again.');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Completed':
                return 'bg-green-100 text-green-700 border-green-300';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'Pending':
                return 'bg-gray-100 text-gray-700 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-700 border-gray-300';
        }
    };

    const commonTestTypes = [
        'Complete Blood Count (CBC)',
        'Basic Metabolic Panel (BMP)',
        'Comprehensive Metabolic Panel (CMP)',
        'Lipid Panel',
        'Liver Function Test',
        'Kidney Function Test',
        'Thyroid Function Test (TSH, T3, T4)',
        'Hemoglobin A1C',
        'Urinalysis',
        'Blood Glucose Test',
        'Vitamin D Test',
        'Iron Studies',
        'COVID-19 PCR Test',
        'X-Ray',
        'CT Scan',
        'MRI',
        'Ultrasound',
        'ECG/EKG',
        'Other'
    ];

    const stats = {
        total: doctorTests.length,
        pending: doctorTests.filter(t => t.status === 'Pending').length,
        inProgress: doctorTests.filter(t => t.status === 'In Progress').length,
        completed: doctorTests.filter(t => t.status === 'Completed').length
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Total Requested</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Pending</p>
                            <p className="text-2xl font-bold text-gray-700">{stats.pending}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-yellow-700">{stats.inProgress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions and Filters */}
            <div className="bg-white rounded-lg shadow-md">
                <div className="border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex gap-2 flex-wrap">
                            {(['All', 'Pending', 'In Progress', 'Completed'] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                                        filterStatus === status
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowRequestModal(true)}
                            className="px-6 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Request Lab Test
                        </button>
                    </div>
                </div>

                {/* Tests List */}
                <div className="p-6">
                    {sortedTests.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Tests Found</h3>
                            <p className="text-gray-600">No {filterStatus.toLowerCase()} lab tests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedTests.map((test) => (
                                <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">{test.testType}</h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                                                        {test.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <p><span className="font-medium">Patient:</span> {test.patientName}</p>
                                                    <p><span className="font-medium">Requested:</span> {new Date(test.requestDate).toLocaleDateString()}</p>
                                                    {test.resultDate && (
                                                        <p><span className="font-medium">Completed:</span> {new Date(test.resultDate).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                {test.notes && (
                                                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Notes:</span> {test.notes}</p>
                                                )}
                                            </div>
                                        </div>

                                        {test.status === 'Completed' && test.results && (
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 mb-1">Test Results</h4>
                                                        <p className="text-sm text-gray-700">{test.results}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Request Test Modal */}
            {showRequestModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Request Lab Test</h2>
                                <button
                                    onClick={() => setShowRequestModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="appointment" className="block text-sm font-medium text-gray-700 mb-2">
                                        Select Appointment *
                                    </label>
                                    <select
                                        id="appointment"
                                        value={selectedAppointment}
                                        onChange={(e) => setSelectedAppointment(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">-- Select a completed appointment --</option>
                                        {eligibleAppointments.map((apt) => (
                                            <option key={apt.id} value={apt.id}>
                                                {apt.patientName} - {apt.date} (ID: {apt.id})
                                            </option>
                                        ))}
                                    </select>
                                    {eligibleAppointments.length === 0 && (
                                        <p className="text-sm text-amber-600 mt-2">
                                            ⓘ No completed appointments. You can only request lab tests for completed appointments.
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="testType" className="block text-sm font-medium text-gray-700 mb-2">
                                        Test Type *
                                    </label>
                                    <select
                                        id="testType"
                                        value={testType}
                                        onChange={(e) => setTestType(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                    >
                                        <option value="">-- Select test type --</option>
                                        {commonTestTypes.map((type) => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                    {testType === 'Other' && (
                                        <input
                                            type="text"
                                            placeholder="Enter custom test type"
                                            value={testType === 'Other' ? '' : testType}
                                            onChange={(e) => setTestType(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent mt-2"
                                        />
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Clinical Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows={3}
                                        placeholder="Any clinical indications or special instructions..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleRequestTest}
                                        disabled={!selectedAppointment || !testType.trim()}
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Request Test
                                    </button>
                                    <button
                                        onClick={() => setShowRequestModal(false)}
                                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition duration-300"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
