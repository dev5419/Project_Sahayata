const { validationResult } = require('express-validator');
const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');

// Get all counsellors
exports.getCounsellors = async (req, res) => {
    try {
        const counsellors = await User.find({
            role: 'counsellor',
            isActive: true
        })
        .select('fullName department preferences')
        .sort({ fullName: 1 });

        res.status(200).json({
            success: true,
            data: {
                counsellors: counsellors.map(counsellor => ({
                    id: counsellor._id,
                    name: counsellor.fullName,
                    department: counsellor.department,
                    specialization: counsellor.preferences?.specialization || 'General Counselling',
                    languages: counsellor.preferences?.languages || ['English'],
                    description: counsellor.preferences?.description || 'Experienced counsellor providing mental health support to students.'
                }))
            }
        });

    } catch (error) {
        console.error('Get counsellors error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching counsellors.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get counsellor details
exports.getCounsellorDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const counsellor = await User.findOne({
            _id: id,
            role: 'counsellor',
            isActive: true
        })
        .select('fullName department preferences');

        if (!counsellor) {
            return res.status(404).json({
                success: false,
                message: 'Counsellor not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                counsellor: {
                    id: counsellor._id,
                    name: counsellor.fullName,
                    department: counsellor.department,
                    specialization: counsellor.preferences?.specialization || 'General Counselling',
                    languages: counsellor.preferences?.languages || ['English'],
                    description: counsellor.preferences?.description || 'Experienced counsellor providing mental health support to students.',
                    availability: counsellor.preferences?.availability || {}
                }
            }
        });

    } catch (error) {
        console.error('Get counsellor details error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching counsellor details.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get counsellor availability
exports.getCounsellorAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { date } = req.query;

        const counsellor = await User.findOne({
            _id: id,
            role: 'counsellor',
            isActive: true
        });

        if (!counsellor) {
            return res.status(404).json({
                success: false,
                message: 'Counsellor not found!'
            });
        }

        // Get booked appointments for the date
        const startOfDay = new Date(date + 'T00:00:00.000Z');
        const endOfDay = new Date(date + 'T23:59:59.999Z');

        const bookedAppointments = await Appointment.find({
            counsellorId: id,
            startTime: { $gte: startOfDay, $lt: endOfDay },
            status: { $nin: ['cancelled', 'no-show'] }
        })
        .select('startTime endTime');

        // Generate available time slots (example: 9 AM to 5 PM, 1-hour slots)
        const availableSlots = [];
        const startHour = 9;
        const endHour = 17;

        for (let hour = startHour; hour < endHour; hour++) {
            const slotStart = new Date(date + `T${hour.toString().padStart(2, '0')}:00:00`);
            const slotEnd = new Date(date + `T${(hour + 1).toString().padStart(2, '0')}:00:00`);

            // Check if slot is available
            const isBooked = bookedAppointments.some(appointment => {
                const appointmentStart = new Date(appointment.startTime);
                const appointmentEnd = new Date(appointment.endTime);
                return appointmentStart < slotEnd && appointmentEnd > slotStart;
            });

            if (!isBooked) {
                availableSlots.push({
                    startTime: slotStart.toISOString(),
                    endTime: slotEnd.toISOString(),
                    time: `${hour.toString().padStart(2, '0')}:00 - ${(hour + 1).toString().padStart(2, '0')}:00`
                });
            }
        }

        res.status(200).json({
            success: true,
            data: {
                counsellorId: id,
                date: date,
                availableSlots: availableSlots
            }
        });

    } catch (error) {
        console.error('Get counsellor availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching availability.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Book appointment
exports.bookAppointment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { counsellorId, startTime, endTime, sessionType, notes } = req.body;
        const userId = req.user.id;

        // Check if counsellor exists and is active
        const counsellor = await User.findOne({
            _id: counsellorId,
            role: 'counsellor',
            isActive: true
        });

        if (!counsellor) {
            return res.status(404).json({
                success: false,
                message: 'Counsellor not found or inactive!'
            });
        }

        // Check if time slot is available
        const conflictingAppointment = await Appointment.findOne({
            counsellorId: counsellorId,
            startTime: { $lt: new Date(endTime) },
            endTime: { $gt: new Date(startTime) },
            status: { $nin: ['cancelled', 'no-show'] }
        });

        if (conflictingAppointment) {
            return res.status(400).json({
                success: false,
                message: 'This time slot is already booked!'
            });
        }

        // Create appointment
        const appointment = await Appointment.create({
            userId: userId,
            counsellorId: counsellorId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            sessionType: sessionType || 'in-person',
            notes: notes || null,
            status: 'scheduled'
        });

        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            data: {
                appointment: {
                    id: appointment._id,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    sessionType: appointment.sessionType,
                    status: appointment.status,
                    counsellor: {
                        id: counsellor._id,
                        name: counsellor.fullName
                    }
                }
            }
        });

    } catch (error) {
        console.error('Book appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while booking appointment.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's appointments
exports.getUserAppointments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status, page = 1, limit = 10 } = req.query;

        const query = { userId: userId };
        if (status) {
            query.status = status;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const appointments = await Appointment.find(query)
            .populate('counsellor', 'fullName department')
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments: appointments.map(appointment => ({
                    id: appointment._id,
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    sessionType: appointment.sessionType,
                    status: appointment.status,
                    notes: appointment.notes,
                    counsellor: appointment.counsellor
                })),
                pagination: {
                    total: total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get user appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching appointments.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Cancel appointment
exports.cancelAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;

        const appointment = await Appointment.findOne({
            _id: id,
            userId: userId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found!'
            });
        }

        if (appointment.status === 'cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Appointment is already cancelled!'
            });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel completed appointment!'
            });
        }

        // Check if appointment is within 24 hours
        const appointmentTime = new Date(appointment.startTime);
        const now = new Date();
        const hoursDifference = (appointmentTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 24) {
            return res.status(400).json({
                success: false,
                message: 'Appointments can only be cancelled at least 24 hours in advance!'
            });
        }

        await Appointment.findByIdAndUpdate(id, {
            status: 'cancelled',
            cancellationReason: reason,
            cancellationTime: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Appointment cancelled successfully!'
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while cancelling appointment.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
