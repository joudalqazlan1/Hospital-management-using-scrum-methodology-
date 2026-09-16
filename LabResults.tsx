import React from 'react';
import { useAppContext } from '../../contexts/AppContext';

export const LabResults = () => {
    const { currentUser, labTests } = useAppContext();

    // Filter lab tests for current patient
    const patientLabTests = currentUser
        ? labTests.filter(test => test.patientId === currentUser.id)
        : [];

    // Sort by request date (newest first)
    const sortedTests = [...patientLabTests].sort((a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );

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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Completed':
                return (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'In Progress':
                return (
                    <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'Pending':
                return (
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            default:
                return null;
        }
    };

    if (sortedTests.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Lab Tests Found</h3>
                <p className="text-gray-600">You don't have any lab test results yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-primary-light rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Lab Test Results</h2>
                        <p className="text-gray-600">View your lab test history and results</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-green-700">
                                    {sortedTests.filter(t => t.status === 'Completed').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-yellow-700">
                                    {sortedTests.filter(t => t.status === 'In Progress').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-700">
                                    {sortedTests.filter(t => t.status === 'Pending').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lab Test Cards */}
            <div className="space-y-4">
                {sortedTests.map((test) => (
                    <div key={test.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800 mr-3">{test.testType}</h3>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                                            <span className="mr-1">{getStatusIcon(test.status)}</span>
                                            {test.status}
                                        </span>
                                    </div>
                                    {test.appointmentId && (
                                        <p className="text-xs text-gray-500 mb-1">
                                            Appointment ID: <span className="font-medium">{test.appointmentId}</span>
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-600">
                                        Requested by: <span className="font-medium text-gray-800">{test.doctorName}</span>
                                    </p>
                                </div>
                                <div className="mt-3 md:mt-0 text-sm text-gray-600">
                                    <p>Requested: {new Date(test.requestDate).toLocaleDateString()}</p>
                                    {test.resultDate && (
                                        <p className="text-green-600 font-medium">
                                            Result Date: {new Date(test.resultDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {test.notes && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <p className="text-sm text-gray-700">
                                        <span className="font-semibold text-gray-800">Notes:</span> {test.notes}
                                    </p>
                                </div>
                            )}

                            {test.status === 'Completed' && test.results && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-start">
                                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
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

                            {test.status === 'In Progress' && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <p className="text-sm text-yellow-800 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Your test is currently being processed. Results will be available soon.
                                    </p>
                                </div>
                            )}

                            {test.status === 'Pending' && (
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                    <p className="text-sm text-gray-700 flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Test has been requested. Please visit the lab to complete the test.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
