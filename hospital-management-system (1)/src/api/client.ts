/**
 * API Client for HealSmart Hospital Management System
 * Handles all HTTP requests to the Express API server
 */

const API_BASE_URL = 'http://localhost:5000/api';

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API request failed');
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
}

/**
 * Authentication API
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (patient: any) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(patient),
    });
  },
};

/**
 * Staff API
 */
export const staffAPI = {
  getAll: async () => {
    return apiRequest('/staff', { method: 'GET' });
  },

  add: async (staff: any) => {
    return apiRequest('/staff', {
      method: 'POST',
      body: JSON.stringify(staff),
    });
  },

  delete: async (staffId: string) => {
    return apiRequest(`/staff/${staffId}`, { method: 'DELETE' });
  },
};

/**
 * Patients API
 */
export const patientsAPI = {
  getAll: async () => {
    return apiRequest('/patients', { method: 'GET' });
  },
};

/**
 * Appointments API
 */
export const appointmentsAPI = {
  getAll: async () => {
    return apiRequest('/appointments', { method: 'GET' });
  },

  create: async (appointment: any) => {
    return apiRequest('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointment),
    });
  },

  updateStatus: async (appointmentId: string, status: string) => {
    return apiRequest(`/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete: async (appointmentId: string) => {
    return apiRequest(`/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Lab Tests API
 */
export const labTestsAPI = {
  getAll: async () => {
    return apiRequest('/lab-tests', { method: 'GET' });
  },

  create: async (labTest: any) => {
    return apiRequest('/lab-tests', {
      method: 'POST',
      body: JSON.stringify(labTest),
    });
  },

  update: async (testId: string, updates: any) => {
    return apiRequest(`/lab-tests/${testId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

/**
 * Medical Records API
 */
export const medicalRecordsAPI = {
  getAll: async () => {
    return apiRequest('/medical-records', { method: 'GET' });
  },

  create: async (record: any) => {
    return apiRequest('/medical-records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },
};

/**
 * Insurance API
 */
export const insuranceAPI = {
  getAll: async () => {
    return apiRequest('/insurance', { method: 'GET' });
  },

  create: async (insurance: any) => {
    return apiRequest('/insurance', {
      method: 'POST',
      body: JSON.stringify(insurance),
    });
  },

  checkSupported: async (companyName: string) => {
    return apiRequest('/insurance/supported/check', {
      method: 'POST',
      body: JSON.stringify({ provider: companyName }),
    });
  },
};

/**
 * Payments API
 */
export const paymentsAPI = {
  getAll: async () => {
    return apiRequest('/payments', { method: 'GET' });
  },

  create: async (payment: any) => {
    return apiRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  },
};

export default {
  auth: authAPI,
  staff: staffAPI,
  patients: patientsAPI,
  appointments: appointmentsAPI,
  labTests: labTestsAPI,
  medicalRecords: medicalRecordsAPI,
  insurance: insuranceAPI,
  payments: paymentsAPI,
};
