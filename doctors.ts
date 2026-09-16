// Fix: Provide a mock implementation for fetching doctor availability.

const allTimeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM'
];

// This is a mock function. In a real application, this would fetch data from a server.
export const getDoctorAvailability = async (doctorId: string, date: string): Promise<string[]> => {
    console.log(`Fetching availability for doctor ${doctorId} on ${date}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simple mock logic: return a pseudo-random subset of time slots
    // that is consistent for the same doctor and date.
    const seed = date.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + doctorId.length;
    
    const availableSlots = allTimeSlots.filter((_, index) => (seed + index) % 3 !== 0);

    return availableSlots;
};
