const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    studentId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['student', 'moderator', 'admin', 'counsellor'],
        default: 'student'
    },
    department: {
        type: String,
        trim: true
    },
    yearOfStudy: {
        type: Number,
        min: 1,
        max: 6
    },
    phone: {
        type: String,
        trim: true
    },
    emergencyContact: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsReminders: {
            type: Boolean,
            default: false
        },
        anonymousForumPosts: {
            type: Boolean,
            default: true
        },
        weeklyWellnessCheckins: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Hash password before saving the user (Mongoose pre-save hook)
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords for login
userSchema.methods.isValidPassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

// Method to get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
    const userObject = this.toObject();
    delete userObject.password;
    return userObject;
};

// Create indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ studentId: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

const User = mongoose.model('User', userSchema);

module.exports = User;
