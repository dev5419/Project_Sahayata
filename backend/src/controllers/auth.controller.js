const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user.model');

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            role: user.role,
            studentId: user.studentId 
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Register new user
exports.register = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { studentId, fullName, email, password, department, yearOfStudy, phone } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            $or: [
                { email: email },
                { studentId: studentId }
            ]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User with this email or student ID already exists!'
            });
        }

        // Create new user
        const user = await User.create({
            studentId,
            fullName,
            email,
            password,
            department,
            yearOfStudy,
            phone,
            role: 'student' // Default role for registration
        });

        // Generate token
        const token = generateToken(user);

        res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            data: {
                user: user.getPublicProfile(),
                token: token
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                success: false,
                message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists!`
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { identifier, password } = req.body; // identifier can be email or studentId

        // Find user by email or studentId
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { studentId: identifier }
            ]
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials!'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isValidPassword = await user.isValidPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials!'
            });
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        // Generate token
        const token = generateToken(user);

        res.status(200).json({
            success: true,
            message: 'Login successful!',
            data: {
                user: user.getPublicProfile(),
                token: token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get current user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                user: user.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching profile.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, department, yearOfStudy, phone, emergencyContact, preferences } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        // Update allowed fields
        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (department) updateData.department = department;
        if (yearOfStudy) updateData.yearOfStudy = yearOfStudy;
        if (phone) updateData.phone = phone;
        if (emergencyContact) updateData.emergencyContact = emergencyContact;
        if (preferences) updateData.preferences = { ...user.preferences, ...preferences };

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id, 
            updateData, 
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully!',
            data: {
                user: updatedUser.getPublicProfile()
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating profile.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Change password
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        // Verify current password
        const isValidPassword = await user.isValidPassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect!'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully!'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while changing password.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Logout (client-side token removal, but we can track if needed)
exports.logout = async (req, res) => {
    try {
        // In a more advanced setup, you might want to blacklist the token
        // For now, we'll just return a success message
        res.status(200).json({
            success: true,
            message: 'Logged out successfully!'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
