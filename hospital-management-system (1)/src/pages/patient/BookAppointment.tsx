// Fix: Implement the BookAppointment component.
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { Staff, Role, Appointment, Page } from '../../types';
import { getDoctorAvailability } from '../../services/doctors';
import api from '../../api/client';

export const BookAppointment = () => {
    const { currentUser, staff, appointments, refreshData, paymentMethods, insuranceRecords, navigate } = useAppContext();
    const [selectedDept, setSelectedDept] = useState('');
    const [selectedDoctor, setSelectedDoctor] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [availableTimes, setAvailableTimes] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState('');
    const [isLoadingTimes, setIsLoadingTimes] = useState(false);
    const [message, setMessage] = useState('');
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'Visa' | 'Mada' | 'ApplePay'>('Visa');
    const [selectedPayment, setSelectedPayment] = useState('');
    const [selectedInsurance, setSelectedInsurance] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [consultationFee, setConsultationFee] = useState(0);

    const doctors = useMemo(() => staff.filter(s => s.role === Role.Doctor), [staff]);
    
    const departments = useMemo(() => {
        const depts = doctors.map(d => d.department);
        return [...new Set(depts)];
    }, [doctors]);

    const doctorsInDept = useMemo(() => {
        if (!selectedDept) return [];
        return doctors.filter(d => d.department === selectedDept);
    }, [selectedDept, doctors]);

    useEffect(() => {
        setSelectedDoctor('');
        setAvailableTimes([]);
        setSelectedTime('');
        setConsultationFee(0);
    }, [selectedDept]);

    // Update consultation fee when doctor is selected
    useEffect(() => {
        if (selectedDoctor) {
            const doctor = staff.find(s => s.id === selectedDoctor);
            if (doctor && 'consultationFee' in doctor) {
                setConsultationFee(doctor.consultationFee || 100); // Default fee if not set
            }
        }
    }, [selectedDoctor, staff]);

    useEffect(() => {
        if (selectedDoctor && appointmentDate) {
            setIsLoadingTimes(true);
            setAvailableTimes([]);
            setSelectedTime('');
            setMessage('');
            getDoctorAvailability(selectedDoctor, appointmentDate)
                .then(times => {
                    const bookedTimes = appointments
                        .filter(apt => apt.doctorId === selectedDoctor && apt.date === appointmentDate && apt.status === 'Upcoming')
                        .map(apt => apt.time);
                    
                    const available = times.filter(time => !bookedTimes.includes(time));
                    setAvailableTimes(available);
                })
                .catch(err => {
                    console.error(err);
                    setMessage('Could not fetch available times.');
                })
                .finally(() => setIsLoadingTimes(false));
        }
    }, [selectedDoctor, appointmentDate, appointments]);
    
    // Get user's saved payment methods and insurance
    const userPayments = currentUser ? paymentMethods.filter(p => p.patientId === currentUser.id) : [];
    const userInsurance = currentUser ? insuranceRecords.filter(i => i.patientId === currentUser.id && i.isActive) : [];

    // Calculate final amount with insurance discount (20% off ONLY if insurance is selected)
    const selectedInsuranceInfo = selectedInsurance ? userInsurance.find(ins => ins.id === selectedInsurance) : null;
    const insuranceDiscount = selectedInsuranceInfo ? consultationFee * 0.20 : 0;
    const finalAmount = consultationFee - insuranceDiscount;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        if (!selectedDept || !selectedDoctor || !appointmentDate || !selectedTime) {
            setMessage('Please fill out all fields.');
            return;
        }

        // Show payment/insurance selection modal
        setShowPaymentModal(true);
    };

    const handleConfirmBooking = async () => {
        if (!selectedPayment) {
            setMessage('Please select a payment card.');
            return;
        }

        const doctor = staff.find(s => s.id === selectedDoctor);
        const selectedPaymentInfo = userPayments.find(p => p.id === selectedPayment);

        if (!doctor || !currentUser || !selectedPaymentInfo) {
            setMessage('An error occurred. Please try again.');
            return;
        }

        try {
            // Create the appointment
            await api.appointments.create({
                patientId: currentUser.id,
                patientName: currentUser.fullName,
                doctorId: doctor.id,
                doctorName: doctor.fullName,
                department: doctor.department,
                date: appointmentDate,
                time: selectedTime,
                status: 'Upcoming',
                consultationFee: consultationFee,
                paymentMethod: selectedPaymentMethod,
                paymentStatus: 'Completed'
            });

            // Create the payment record (with insurance discount applied if available)
            await api.payments.create({
                patientId: currentUser.id,
                cardNumber: selectedPaymentInfo.cardNumber,
                cardHolderName: selectedPaymentInfo.cardHolderName,
                expiryDate: selectedPaymentInfo.expiryDate,
                cvv: selectedPaymentInfo.cvv,
                paymentMethod: selectedPaymentMethod,
                amount: finalAmount,
                status: 'Success'
            });

            // Refresh data from database
            await refreshData();

            setShowPaymentModal(false);
            setBookingSuccess(true);
        } catch (error) {
            console.error('Error booking appointment:', error);
            setMessage('Failed to book appointment. Please try again.');
        }
    };
    
    const today = new Date().toISOString().split('T')[0];

    // Success screen
    if (bookingSuccess) {
        const selectedPaymentInfo = userPayments.find(p => p.id === selectedPayment);
        const selectedInsuranceInfo = selectedInsurance ? userInsurance.find(i => i.id === selectedInsurance) : null;

        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Appointment Booked!</h2>
                    <p className="text-gray-600 mb-6">Your appointment has been successfully booked.</p>

                    {/* Payment Success Message */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-center mb-2">
                            <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <h3 className="font-semibold text-green-800">Payment Successful</h3>
                        </div>
                        <p className="text-sm text-green-700">
                            Payment of {consultationFee} SAR processed via {selectedPaymentInfo?.paymentMethod} (**** {selectedPaymentInfo?.cardNumber.replace(/\s/g, '').slice(-4)})
                        </p>
                    </div>

                    {/* Insurance Deduction Message */}
                    {selectedInsuranceInfo && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex items-center justify-center mb-2">
                                <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <h3 className="font-semibold text-blue-800">Insurance Applied</h3>
                            </div>
                            <p className="text-sm text-blue-700">
                                Your insurance ({selectedInsuranceInfo.provider}) has been successfully applied to this appointment.
                            </p>
                        </div>
                    )}

                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-800 mb-3">Appointment Details:</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Doctor:</span>
                                <span className="font-medium text-gray-800">{staff.find(s => s.id === selectedDoctor)?.fullName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Department:</span>
                                <span className="font-medium text-gray-800">{selectedDept}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date:</span>
                                <span className="font-medium text-gray-800">{appointmentDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Time:</span>
                                <span className="font-medium text-gray-800">{selectedTime}</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-6">A confirmation email will be sent to your registered email address.</p>

                    <button
                        onClick={() => {
                            setBookingSuccess(false);
                            setSelectedDept('');
                            setSelectedDoctor('');
                            setAppointmentDate('');
                            setSelectedTime('');
                            setAvailableTimes([]);
                            setSelectedPayment('');
                            setSelectedPaymentMethod('Visa');
                            setSelectedInsurance('');
                            setConsultationFee(0);
                        }}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
                    >
                        Book Another Appointment
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Book an Appointment</h2>
            {message && <div className={`p-4 mb-4 text-sm rounded-lg ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Department</label>
                    <select
                        value={selectedDept}
                        onChange={e => setSelectedDept(e.target.value)}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    >
                        <option value="">-- Choose a department --</option>
                        {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                    </select>
                </div>

                {selectedDept && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Doctor</label>
                        <select
                            value={selectedDoctor}
                            onChange={e => setSelectedDoctor(e.target.value)}
                            disabled={!selectedDept}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
                        >
                            <option value="">-- Choose a doctor --</option>
                            {doctorsInDept.map(doc => <option key={doc.id} value={doc.id}>{doc.fullName}</option>)}
                        </select>
                    </div>
                )}
                
                {selectedDoctor && (
                     <div>
                        <label className="block text-sm font-medium text-gray-700">Select Date</label>
                        <input
                            type="date"
                            value={appointmentDate}
                            onChange={e => setAppointmentDate(e.target.value)}
                            min={today}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-gray-100"
                        />
                    </div>
                )}

                {isLoadingTimes && <p className="text-gray-500">Loading available times...</p>}

                {availableTimes.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Select Time</label>
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-2">
                            {availableTimes.map(time => (
                                <button
                                    key={time}
                                    type="button"
                                    onClick={() => setSelectedTime(time)}
                                    className={`px-3 py-2 text-sm rounded-md transition-colors ${selectedTime === time ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {appointmentDate && !isLoadingTimes && availableTimes.length === 0 && selectedDoctor && (
                    <p className="text-gray-500 text-center py-2">No available slots for this day. Please choose another date.</p>
                )}

                <button
                    type="submit"
                    disabled={!selectedTime}
                    className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-dark transition-colors duration-300 disabled:bg-gray-400"
                >
                    Book Appointment
                </button>
            </form>

            {/* Payment & Insurance Selection Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-gray-800 mb-4">Payment & Insurance</h3>
                        <p className="text-gray-600 mb-6">Complete your booking by selecting a payment method.</p>

                        {/* Consultation Fee Display */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-gray-700 font-medium">Consultation Fee:</span>
                                <span className={`text-lg font-semibold ${selectedInsuranceInfo ? 'line-through text-gray-500' : 'text-primary'}`}>
                                    {consultationFee} SAR
                                </span>
                            </div>

                            {selectedInsuranceInfo && (
                                <>
                                    <div className="flex justify-between items-center mb-2 text-green-600">
                                        <span className="text-sm font-medium">
                                            Insurance Discount (20%):
                                        </span>
                                        <span className="text-sm font-semibold">
                                            - {insuranceDiscount.toFixed(2)} SAR
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-blue-300">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-800 font-bold">Total Amount:</span>
                                            <span className="text-2xl font-bold text-green-600">{finalAmount.toFixed(2)} SAR</span>
                                        </div>
                                    </div>
                                    <div className="mt-3 bg-green-50 border border-green-300 rounded p-2">
                                        <p className="text-xs text-green-800">
                                            ✓ Insurance: {selectedInsuranceInfo.provider} ({selectedInsuranceInfo.policyNumber})
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Saved Payment Cards Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Payment Card *
                            </label>
                            <div className="space-y-2">
                                {userPayments.map((payment) => (
                                    <label
                                        key={payment.id}
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedPayment === payment.id
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-300 hover:border-primary'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={payment.id}
                                            checked={selectedPayment === payment.id}
                                            onChange={(e) => {
                                                setSelectedPayment(e.target.value);
                                                setSelectedPaymentMethod(payment.paymentMethod || 'Visa');
                                            }}
                                            className="mr-3"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div className="font-medium text-gray-800">
                                                    {payment.paymentMethod || 'Card'} **** {payment.cardNumber.replace(/\s/g, '').slice(-4)}
                                                </div>
                                                <div className="text-xs text-gray-500">{payment.paymentMethod}</div>
                                            </div>
                                            <div className="text-sm text-gray-600">{payment.cardHolderName}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {userPayments.length === 0 && (
                                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                    No payment methods found.{' '}
                                    <button
                                        onClick={() => navigate(Page.Payment)}
                                        className="text-primary hover:underline font-medium"
                                    >
                                        Add one now
                                    </button>
                                </div>
                            )}
                        </div>


                        {/* Insurance Selection (Optional) */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Insurance (Optional)
                            </label>
                            {userInsurance.length > 0 ? (
                                <div className="space-y-2">
                                    <label
                                        className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                            selectedInsurance === ''
                                                ? 'border-primary bg-primary-light'
                                                : 'border-gray-300 hover:border-primary'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="insurance"
                                            value=""
                                            checked={selectedInsurance === ''}
                                            onChange={(e) => setSelectedInsurance(e.target.value)}
                                            className="mr-3"
                                        />
                                        <div className="text-gray-800">No insurance</div>
                                    </label>
                                    {userInsurance.map((insurance) => (
                                        <label
                                            key={insurance.id}
                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                                selectedInsurance === insurance.id
                                                    ? 'border-primary bg-primary-light'
                                                    : 'border-gray-300 hover:border-primary'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="insurance"
                                                value={insurance.id}
                                                checked={selectedInsurance === insurance.id}
                                                onChange={(e) => setSelectedInsurance(e.target.value)}
                                                className="mr-3"
                                            />
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-800">{insurance.provider}</div>
                                                <div className="text-sm text-gray-600">Policy: {insurance.policyNumber}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                                    No insurance on file.{' '}
                                    <button
                                        onClick={() => navigate(Page.InsuranceVerification)}
                                        className="text-primary hover:underline"
                                    >
                                        Add insurance
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    setShowPaymentModal(false);
                                    setSelectedPayment('');
                                    setSelectedPaymentMethod('Visa');
                                    setSelectedInsurance('');
                                }}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmBooking}
                                disabled={!selectedPayment}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:bg-gray-400"
                            >
                                Confirm Booking
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};