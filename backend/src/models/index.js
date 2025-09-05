const mongoose = require('mongoose');
const dbConfig = require('../config/db.config');

const env = process.env.NODE_ENV || 'development';
const config = dbConfig[env];

// Connect to MongoDB
mongoose.connect(config.uri, config.options)
    .then(() => console.log('✅ MongoDB connected successfully.'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Import models
const User = require('./user.model');
const Appointment = require('./appointment.model');
const Resource = require('./resource.model');
const { ChatSession, ChatMessage } = require('./chat.model');

// Export models and mongoose instance
const db = {
    mongoose,
    User,
    Appointment,
    Resource,
    ChatSession,
    ChatMessage
};

module.exports = db;
