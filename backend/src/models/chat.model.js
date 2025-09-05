const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionId: {
        type: String,
        unique: true,
        default: () => mongoose.Types.ObjectId().toString()
    },
    status: {
        type: String,
        enum: ['active', 'ended', 'emergency'],
        default: 'active'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: {
        type: Date
    },
    emergencyTriggered: {
        type: Boolean,
        default: false
    },
    emergencyTriggeredAt: {
        type: Date
    },
    emergencyKeywords: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

const chatMessageSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatSession',
        required: true
    },
    sender: {
        type: String,
        enum: ['user', 'ai'],
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    messageType: {
        type: String,
        enum: ['text', 'suggestion', 'emergency'],
        default: 'text'
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
chatSessionSchema.index({ userId: 1 });
chatSessionSchema.index({ sessionId: 1 });
chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ startTime: 1 });
chatSessionSchema.index({ emergencyTriggered: 1 });

chatMessageSchema.index({ sessionId: 1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ timestamp: 1 });
chatMessageSchema.index({ messageType: 1 });

// Virtual for session duration
chatSessionSchema.virtual('duration').get(function() {
    if (this.endTime) {
        return this.endTime - this.startTime;
    }
    return Date.now() - this.startTime;
});

// Method to end session
chatSessionSchema.methods.endSession = function() {
    this.status = 'ended';
    this.endTime = new Date();
    return this.save();
};

// Method to trigger emergency
chatSessionSchema.methods.triggerEmergency = function(keywords) {
    this.status = 'emergency';
    this.emergencyTriggered = true;
    this.emergencyTriggeredAt = new Date();
    if (keywords) {
        this.emergencyKeywords = keywords;
    }
    return this.save();
};

// Ensure virtual fields are serialized
chatSessionSchema.set('toJSON', { virtuals: true });
chatSessionSchema.set('toObject', { virtuals: true });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

module.exports = { ChatSession, ChatMessage };
