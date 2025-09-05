const express = require('express');
const router = express.Router();

// Sample counsellors data
const counsellors = [
    {
        id: 'dr-priya',
        name: 'Dr. Priya Sharma',
        specialization: 'Stress & Anxiety',
        languages: ['English', 'Hindi', 'Marathi'],
        avatar: '👩‍⚕️',
        description: 'Specialized in helping students manage academic stress, anxiety, and work-life balance. Uses evidence-based approaches including CBT and mindfulness techniques.',
        availability: {
            monday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            tuesday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            wednesday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            thursday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            friday: ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
        }
    },
    {
        id: 'dr-rajesh',
        name: 'Dr. Rajesh Kumar',
        specialization: 'Depression & Mood',
        languages: ['English', 'Hindi', 'Tamil'],
        avatar: '👨‍⚕️',
        description: 'Expert in treating depression, mood disorders, and helping students build resilience. Combines traditional therapy with modern psychological approaches.',
        availability: {
            monday: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
            tuesday: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
            wednesday: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
            thursday: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
            friday: ['10:00 AM', '11:00 AM', '12:00 PM', '3:00 PM', '4:00 PM', '5:00 PM']
        }
    },
    {
        id: 'dr-meera',
        name: 'Dr. Meera Patel',
        specialization: 'Relationships & Social',
        languages: ['English', 'Gujarati', 'Hindi'],
        avatar: '👩‍⚕️',
        description: 'Specializes in relationship issues, social anxiety, and helping students develop healthy interpersonal skills and communication.',
        availability: {
            monday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            tuesday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            wednesday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            thursday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'],
            friday: ['9:00 AM', '10:00 AM', '2:00 PM', '3:00 PM', '4:00 PM']
        }
    },
    {
        id: 'dr-amit',
        name: 'Dr. Amit Singh',
        specialization: 'Career & Academic',
        languages: ['English', 'Punjabi', 'Hindi'],
        avatar: '👨‍⚕️',
        description: 'Focuses on career guidance, academic pressure, and helping students navigate educational challenges and future planning.',
        availability: {
            monday: ['11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM'],
            tuesday: ['11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM'],
            wednesday: ['11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM'],
            thursday: ['11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM'],
            friday: ['11:00 AM', '12:00 PM', '1:00 PM', '4:00 PM', '5:00 PM']
        }
    }
];

// Sample bookings data (in a real app, this would be in a database)
let bookings = [];

// Get all counsellors
router.get('/counsellors', (req, res) => {
    res.json({
        success: true,
        counsellors: counsellors.map(c => ({
            id: c.id,
            name: c.name,
            specialization: c.specialization,
            languages: c.languages,
            avatar: c.avatar,
            description: c.description
        }))
    });
});

// Get counsellor details
router.get('/counsellors/:id', (req, res) => {
    const { id } = req.params;
    const counsellor = counsellors.find(c => c.id === id);
    
    if (!counsellor) {
        return res.status(404).json({
            success: false,
            message: 'Counsellor not found'
        });
    }
    
    res.json({
        success: true,
        counsellor
    });
});

// Get counsellor availability
router.get('/counsellors/:id/availability', (req, res) => {
    const { id } = req.params;
    const { date } = req.query;
    
    const counsellor = counsellors.find(c => c.id === id);
    
    if (!counsellor) {
        return res.status(404).json({
            success: false,
            message: 'Counsellor not found'
        });
    }
    
    // Get day of week from date
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const availableSlots = counsellor.availability[dayOfWeek] || [];
    
    // Filter out already booked slots
    const bookedSlots = bookings
        .filter(b => b.counsellorId === id && b.date === date)
        .map(b => b.time);
    
    const availableSlotsFiltered = availableSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
        success: true,
        availableSlots: availableSlotsFiltered
    });
});

// Book an appointment
router.post('/book', (req, res) => {
    const { userId, counsellorId, date, time, notes } = req.body;
    
    // Validate required fields
    if (!userId || !counsellorId || !date || !time) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }
    
    // Check if counsellor exists
    const counsellor = counsellors.find(c => c.id === counsellorId);
    if (!counsellor) {
        return res.status(404).json({
            success: false,
            message: 'Counsellor not found'
        });
    }
    
    // Check if slot is available
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const availableSlots = counsellor.availability[dayOfWeek] || [];
    
    if (!availableSlots.includes(time)) {
        return res.status(400).json({
            success: false,
            message: 'Selected time slot is not available'
        });
    }
    
    // Check if slot is already booked
    const existingBooking = bookings.find(b => 
        b.counsellorId === counsellorId && 
        b.date === date && 
        b.time === time
    );
    
    if (existingBooking) {
        return res.status(400).json({
            success: false,
            message: 'This time slot is already booked'
        });
    }
    
    // Create booking
    const booking = {
        id: `booking_${Date.now()}`,
        userId,
        counsellorId,
        counsellorName: counsellor.name,
        date,
        time,
        notes: notes || '',
        status: 'confirmed',
        createdAt: new Date()
    };
    
    bookings.push(booking);
    
    res.json({
        success: true,
        booking,
        message: 'Appointment booked successfully'
    });
});

// Get user's bookings
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    const userBookings = bookings.filter(b => b.userId === userId);
    
    res.json({
        success: true,
        bookings: userBookings
    });
});

// Cancel booking
router.post('/cancel/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    const { userId } = req.body;
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === userId);
    
    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    // Check if booking is within 24 hours (cancellation policy)
    const booking = bookings[bookingIndex];
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
    
    if (hoursUntilBooking < 24) {
        return res.status(400).json({
            success: false,
            message: 'Bookings can only be cancelled at least 24 hours in advance'
        });
    }
    
    bookings.splice(bookingIndex, 1);
    
    res.json({
        success: true,
        message: 'Booking cancelled successfully'
    });
});

// Reschedule booking
router.post('/reschedule/:bookingId', (req, res) => {
    const { bookingId } = req.params;
    const { userId, newDate, newTime } = req.body;
    
    const bookingIndex = bookings.findIndex(b => b.id === bookingId && b.userId === userId);
    
    if (bookingIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Booking not found'
        });
    }
    
    const booking = bookings[bookingIndex];
    const counsellor = counsellors.find(c => c.id === booking.counsellorId);
    
    // Check if new slot is available
    const dayOfWeek = new Date(newDate).toLocaleDateString('en-US', { weekday: 'lowercase' });
    const availableSlots = counsellor.availability[dayOfWeek] || [];
    
    if (!availableSlots.includes(newTime)) {
        return res.status(400).json({
            success: false,
            message: 'Selected time slot is not available'
        });
    }
    
    // Check if new slot is already booked
    const existingBooking = bookings.find(b => 
        b.counsellorId === booking.counsellorId && 
        b.date === newDate && 
        b.time === newTime &&
        b.id !== bookingId
    );
    
    if (existingBooking) {
        return res.status(400).json({
            success: false,
            message: 'This time slot is already booked'
        });
    }
    
    // Update booking
    bookings[bookingIndex] = {
        ...booking,
        date: newDate,
        time: newTime,
        updatedAt: new Date()
    };
    
    res.json({
        success: true,
        booking: bookings[bookingIndex],
        message: 'Booking rescheduled successfully'
    });
});

module.exports = router;
