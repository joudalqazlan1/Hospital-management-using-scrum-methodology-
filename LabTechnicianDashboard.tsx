import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { LabTest } from '../../types';
import { LogoutIcon } from '../../components/icons';
import api from '../../api/client';

export const LabTechnicianDashboard = () => {
    const { currentUser, logout, labTests, refreshData } = useAppContext();
    const [selectedTest, setSelectedTest] = useState<LabTest | null>(null);
    const [results, setResults] = useState('');
    const [notes, setNotes] = useState('');
    const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'In Progress' | 'Completed'>('All');
    const [successMessage, setSuccessMessage] = useState('');

    // Filter tests based on status
    const filteredTests = filterStatus === 'All'
        ? labTests
        : labTests.filter(test => test.status === filterStatus);

    // Sort by request date (newest first)
    const sortedTests = [...filteredTests].sort((a, b) =>
        new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime()
    );

    const handleUpdateStatus = async (testId: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
        try {
            await api.labTests.update(testId, {
                status: newStatus,
                resultDate: newStatus === 'Completed' ? new Date().toISOString().split('T')[0] : undefined
            });
            // Refresh data from database
            await refreshData();
        } catch (error) {
            console.error('Error updating lab test status:', error);
            alert('Failed to update test status. Please try again.');
        }
    };

    const handleUploadResults = async () => {
        if (!selectedTest || !results.trim()) return;

        try {
            await api.labTests.update(selectedTest.id, {
                status: 'Completed',
                results: results.trim(),
                notes: notes.trim() || selectedTest.notes,
                resultDate: new Date().toISOString().split('T')[0]
            });

            // Refresh data from database
            await refreshData();

            // Show success message
            setSuccessMessage(`✓ Lab test results saved successfully! Results are now visible to the patient (${selectedTest.patientName}).`);
            setTimeout(() => setSuccessMessage(''), 4000);

            // Reset form
            setSelectedTest(null);
            setResults('');
            setNotes('');
        } catch (error) {
            console.error('Error uploading lab test results:', error);
            alert('Failed to upload results. Please try again.');
        }
    };

    const openUploadModal = (test: LabTest) => {
        setSelectedTest(test);
        setResults(test.results || '');
        setNotes(test.notes || '');
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

    const stats = {
        total: labTests.length,
        pending: labTests.filter(t => t.status === 'Pending').length,
        inProgress: labTests.filter(t => t.status === 'In Progress').length,
        completed: labTests.filter(t => t.status === 'Completed').length
    };

    return (
        <div className="min-h-screen bg-gray-100 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-20">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <h1 className="text-xl sm:text-2xl font-bold text-primary-dark">
                            Lab Technician Dashboard
                        </h1>
                        <div className="flex items-center">
                            <span className="hidden sm:inline text-gray-700 mr-4">
                                Welcome, <strong>{currentUser?.fullName}</strong>!
                            </span>
                            <button
                                onClick={logout}
                                className="flex items-center text-gray-600 hover:text-primary-dark transition-colors duration-300"
                                aria-label="Logout"
                            >
                                <LogoutIcon className="w-6 h-6" />
                                <span className="ml-2 hidden md:block">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="container mx-auto p-4 sm:p-6 lg:p-8">
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-lg shadow-md animate-fade-in">
                        <div className="flex items-center">
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="font-medium">{successMessage}</p>
                        </div>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex items-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Total Tests</p>
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

                {/* Filter Tabs */}
                <div className="bg-white rounded-lg shadow-md mb-6">
                    <div className="border-b border-gray-200 px-6 py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <h2 className="text-xl font-bold text-gray-800">Lab Tests</h2>
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
                                <p className="text-gray-600">No {filterStatus.toLowerCase()} tests available.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sortedTests.map((test) => (
                                    <div key={test.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-800">{test.testType}</h3>
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(test.status)}`}>
                                                        {test.status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                    <p><span className="font-medium">Patient:</span> {test.patientName}</p>
                                                    <p><span className="font-medium">Doctor:</span> {test.doctorName}</p>
                                                    <p><span className="font-medium">Requested:</span> {new Date(test.requestDate).toLocaleDateString()}</p>
                                                    {test.resultDate && (
                                                        <p><span className="font-medium">Completed:</span> {new Date(test.resultDate).toLocaleDateString()}</p>
                                                    )}
                                                </div>
                                                {test.notes && (
                                                    <p className="text-sm text-gray-600 mt-2"><span className="font-medium">Notes:</span> {test.notes}</p>
                                                )}
                                            </div>

                                            <div className="flex flex-col gap-2 sm:flex-row">
                                                {test.status === 'Pending' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(test.id, 'In Progress')}
                                                        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-colors duration-200"
                                                    >
                                                        Start Processing
                                                    </button>
                                                )}
                                                {(test.status === 'Pending' || test.status === 'In Progress') && (
                                                    <button
                                                        onClick={() => openUploadModal(test)}
                                                        className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg font-medium transition-colors duration-200"
                                                    >
                                                        Upload Results
                                                    </button>
                                                )}
                                                {test.status === 'Completed' && test.results && (
                                                    <button
                                                        onClick={() => openUploadModal(test)}
                                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors duration-200"
                                                    >
                                                        View/Edit Results
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Upload Results Modal */}
            {selectedTest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Upload Test Results</h2>
                                <button
                                    onClick={() => setSelectedTest(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <h3 className="font-semibold text-gray-800 mb-2">{selectedTest.testType}</h3>
                                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    <p><span className="font-medium">Patient:</span> {selectedTest.patientName}</p>
                                    <p><span className="font-medium">Doctor:</span> {selectedTest.doctorName}</p>
                                    <p><span className="font-medium">Requested:</span> {new Date(selectedTest.requestDate).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="results" className="block text-sm font-medium text-gray-700 mb-2">
                                        Test Results *
                                    </label>
                                    <textarea
                                        id="results"
                                        value={results}
                                        onChange={(e) => setResults(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows={6}
                                        placeholder="Enter detailed test results here..."
                                    />
                                </div>

                                <div>
                                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                                        Additional Notes (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                        rows={3}
                                        placeholder="Any additional notes or observations..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleUploadResults}
                                        disabled={!results.trim()}
                                        className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        Save Results
                                    </button>
                                    <button
                                        onClick={() => setSelectedTest(null)}
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
