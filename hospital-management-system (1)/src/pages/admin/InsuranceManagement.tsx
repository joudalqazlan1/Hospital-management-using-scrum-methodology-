import React, { useState, useEffect } from 'react';

interface SupportedInsurance {
    id: number;
    providerName: string;
    isActive: boolean;
}

export const InsuranceManagement = () => {
    const [insuranceProviders, setInsuranceProviders] = useState<SupportedInsurance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInsuranceProviders();
    }, []);

    const fetchInsuranceProviders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/insurance/supported');
            const data = await response.json();
            setInsuranceProviders(data.providers || []);
        } catch (error) {
            console.error('Error fetching insurance providers:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Supported Insurance Providers</h2>
            <p className="text-gray-600 mb-6">View all insurance providers supported by the hospital.</p>

            {/* Providers List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Provider Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {insuranceProviders.map((provider) => (
                            <tr key={provider.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {provider.providerName}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span
                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            provider.isActive
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                        }`}
                                    >
                                        {provider.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
