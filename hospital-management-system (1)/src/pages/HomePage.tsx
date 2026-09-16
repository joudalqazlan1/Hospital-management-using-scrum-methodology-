import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Page, Role } from '../types';
import { AdminIcon, DoctorIcon, PatientIcon } from '../components/icons';

const RoleButton = ({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick: () => void }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-56 text-center">
        <div className="text-primary rounded-full bg-primary-light p-4 mb-4">
            {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
    </button>
);

const ServiceCard = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="text-4xl mb-4">{icon}</div>
        <h4 className="text-xl font-semibold text-gray-800 mb-3">{title}</h4>
        <p className="text-gray-600">{description}</p>
    </div>
);

export const HomePage = () => {
    const { navigate, setLoginTargetRole } = useAppContext();

    const handleLoginClick = (role: Role) => {
        setLoginTargetRole(role);
        navigate(Page.Login);
    }

    const handleRegisterClick = () => {
        navigate(Page.Register);
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <main>
                {/* Hero Section */}
                <section className="bg-gradient-to-br from-primary-light via-blue-50 to-white py-20 md:py-32">
                    <div className="container mx-auto px-6 text-center">
                        <div className="mb-6">
                            <h1 className="text-5xl md:text-6xl font-bold text-primary-dark mb-2">HealSmart</h1>
                            <p className="text-xl text-primary italic">Your Partner in Health & Wellness</p>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
                            Reinventing Healthcare Management
                        </h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                            HealSmart is a smart, fully integrated hospital management system that connects all departments in one seamless platform—streamlining operations, elevating patient care, and boosting overall hospital efficiency.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
                            <button
                                onClick={handleRegisterClick}
                                className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                Register as Patient
                            </button>
                            <button
                                onClick={() => navigate(Page.Login)}
                                className="bg-white hover:bg-gray-50 text-primary border-2 border-primary font-semibold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                            >
                                Login
                            </button>
                        </div>
                    </div>
                </section>

                {/* Vision Section */}
                <section id="about" className="py-16 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-3xl font-bold text-center text-gray-800 mb-6">Our Vision</h3>
                            <div className="bg-primary-light border-l-4 border-primary p-6 rounded-r-lg">
                                <p className="text-lg text-gray-700 leading-relaxed">
                                    To provide <span className="font-semibold text-primary-dark">one single and efficient system</span> that drives hospital operations, manages patient data, and enhances communication within healthcare facilities. HealSmart transforms traditional healthcare administration by delivering a <span className="font-semibold text-primary-dark">smart, simple, and fully integrated</span> platform that enhances hospital efficiency, accuracy, and patient satisfaction.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services Section */}
                <section className="py-16 bg-gray-50">
                    <div className="container mx-auto px-6">
                        <h3 className="text-3xl font-bold text-center text-gray-800 mb-4">Our Services</h3>
                        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                            Comprehensive healthcare solutions designed for doctors, patients, nurses, administrators, and pharmacists
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            <ServiceCard
                                icon="📅"
                                title="Appointment Scheduling"
                                description="Book, manage, and track appointments with ease. Patients can choose preferred doctors and convenient time slots online."
                            />
                            <ServiceCard
                                icon="📋"
                                title="Medical Records"
                                description="Secure, centralized patient medical records accessible to authorized healthcare providers for better diagnosis and treatment."
                            />
                            <ServiceCard
                                icon="🔬"
                                title="Laboratory Management"
                                description="Request lab tests, upload results, and access test data digitally for faster medical decisions."
                            />
                            <ServiceCard
                                icon="💊"
                                title="Prescription Management"
                                description="Digital prescription system for doctors to prescribe medications and patients to view their prescriptions online."
                            />
                            <ServiceCard
                                icon="💳"
                                title="Billing & Payments"
                                description="Secure online payment system supporting multiple payment methods including Visa, Mada, and Apple Pay."
                            />
                            <ServiceCard
                                icon="🛡️"
                                title="Insurance Integration"
                                description="Verify insurance coverage, check policy validity, and apply discounts automatically to medical bills."
                            />
                            <ServiceCard
                                icon="👥"
                                title="Staff Management"
                                description="Comprehensive employee management system for tracking doctors, nurses, and administrative staff."
                            />
                            <ServiceCard
                                icon="📊"
                                title="Reports & Analytics"
                                description="Generate detailed billing reports, payment tracking, and revenue analysis for hospital management."
                            />
                            <ServiceCard
                                icon="💬"
                                title="Communication"
                                description="Chat support for patients, email notifications for appointments, and promotional campaigns."
                            />
                        </div>
                    </div>
                </section>

                {/* Purpose Section */}
                <section className="py-16 bg-white">
                    <div className="container mx-auto px-6">
                        <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose HealSmart?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Reduce Paperwork</h4>
                                    <p className="text-gray-600">Eliminate manual documentation and reduce administrative burden with our digital-first approach.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Improve Coordination</h4>
                                    <p className="text-gray-600">Enhance interdepartmental communication and collaboration for seamless hospital operations.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Better Patient Care</h4>
                                    <p className="text-gray-600">Provide accurate and timely information flow for improved diagnosis and treatment decisions.</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                                    ✓
                                </div>
                                <div>
                                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Prevent Data Loss</h4>
                                    <p className="text-gray-600">Secure cloud-based storage ensures your critical medical data is never lost or misplaced.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Contact Section */}
                <section id="contact" className="py-16 bg-white">
                    <div className="container mx-auto px-6 text-center">
                        <h3 className="text-3xl font-bold text-gray-800 mb-6">Get In Touch</h3>
                        <div className="max-w-2xl mx-auto space-y-4">
                            <p className="text-gray-600">
                                <span className="font-semibold text-gray-800">Email:</span>{' '}
                                <a href="mailto:contact@healsmart.com" className="text-primary hover:underline">
                                    contact@healsmart.com
                                </a>
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold text-gray-800">Phone:</span> +966 50 123 4567
                            </p>
                            <p className="text-gray-600">
                                <span className="font-semibold text-gray-800">Address:</span> King Fahd Road, Riyadh, Saudi Arabia
                            </p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-primary-dark text-white py-8">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-lg font-semibold mb-2">HealSmart Hospital Management System</p>
                        <p className="text-sm opacity-90">
                            Transforming healthcare administration · Enhancing patient satisfaction
                        </p>
                        <p className="text-xs mt-4 opacity-75">© 2025 HealSmart. All rights reserved.</p>
                    </div>
                </footer>
            </main>
        </div>
    );
};
