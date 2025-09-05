const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    counsellorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'],
        default: 'scheduled'
    },
    sessionType: {
        type: String,
        enum: ['in-person', 'video', 'phone'],
        default: 'in-person'
    },
    notes: {
        type: String,
        trim: true
    },
    cancellationReason: {
        type: String,
        trim: true
    },
    cancellationTime: {
        type: Date
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    reminderSentAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
appointmentSchema.index({ userId: 1 });
appointmentSchema.index({ counsellorId: 1 });
appointmentSchema.index({ startTime: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ userId: 1, startTime: 1 });
appointmentSchema.index({ counsellorId: 1, startTime: 1 });

// Virtual for checking if appointment is in the past
appointmentSchema.virtual('isPast').get(function() {
    return this.endTime < new Date();
});

// Virtual for checking if appointment is today
appointmentSchema.virtual('isToday').get(function() {
    const today = new Date();
    const appointmentDate = new Date(this.startTime);
    return appointmentDate.toDateString() === today.toDateString();
});

// Ensure virtual fields are serialized
appointmentSchema.set('toJSON', { virtuals: true });
appointmentSchema.set('toObject', { virtuals: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
