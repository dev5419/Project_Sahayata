const User = require('../models/user.model');
const Appointment = require('../models/appointment.model');
const Resource = require('../models/resource.model');
const { ChatSession, ChatMessage } = require('../models/chat.model');
const analyticsService = require('../services/analytics.service');

// Get anonymized analytics data
exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await analyticsService.getAnonymizedAnalytics();
        
        res.status(200).json({
            success: true,
            data: analytics
        });

    } catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch analytics data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get real-time dashboard metrics
exports.getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await analyticsService.getDashboardMetrics();
        
        res.status(200).json({
            success: true,
            data: metrics
        });

    } catch (error) {
        console.error('Get dashboard metrics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard metrics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all users with pagination and filtering
exports.getAllUsers = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            role, 
            isActive, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Apply filters
        if (role) query.role = role;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { studentId: { $regex: search, $options: 'i' } },
                { department: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const users = await User.find(query)
            .select('-password')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await User.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                users: users.map(user => ({
                    id: user._id,
                    studentId: user.studentId,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    department: user.department,
                    yearOfStudy: user.yearOfStudy,
                    isActive: user.isActive,
                    lastLogin: user.lastLogin,
                    createdAt: user.createdAt
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching users.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update user status (activate/deactivate)
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive, reason } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found!'
            });
        }

        // Prevent admin from deactivating themselves
        if (user.role === 'admin' && !isActive) {
            return res.status(400).json({
                success: false,
                message: 'Cannot deactivate admin account!'
            });
        }

        await User.findByIdAndUpdate(id, { 
            isActive: isActive,
            ...(reason && { deactivationReason: reason })
        });

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully!`
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating user status.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get all appointments with filtering
exports.getAllAppointments = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            counsellorId,
            startDate,
            endDate,
            sortBy = 'startTime',
            sortOrder = 'desc'
        } = req.query;

        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (counsellorId) query.counsellorId = counsellorId;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const appointments = await Appointment.find(query)
            .populate('userId', 'fullName studentId email')
            .populate('counsellorId', 'fullName department')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments: appointments.map(appointment => ({
                    id: appointment._id,
                    user: {
                        id: appointment.userId._id,
                        fullName: appointment.userId.fullName,
                        studentId: appointment.userId.studentId,
                        email: appointment.userId.email
                    },
                    counsellor: {
                        id: appointment.counsellorId._id,
                        fullName: appointment.counsellorId.fullName,
                        department: appointment.counsellorId.department
                    },
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    status: appointment.status,
                    sessionType: appointment.sessionType,
                    notes: appointment.notes,
                    cancellationReason: appointment.cancellationReason,
                    createdAt: appointment.createdAt
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get all appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching appointments.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Generate comprehensive reports
exports.generateReports = async (req, res) => {
    try {
        const { reportType, startDate, endDate, format = 'json' } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default to last 30 days
        const end = endDate ? new Date(endDate) : new Date();

        let reportData = {};

        switch (reportType) {
            case 'user_engagement':
                reportData = await generateUserEngagementReport(start, end);
                break;
            case 'appointment_analysis':
                reportData = await generateAppointmentAnalysisReport(start, end);
                break;
            case 'resource_usage':
                reportData = await generateResourceUsageReport(start, end);
                break;
            case 'chat_analytics':
                reportData = await generateChatAnalyticsReport(start, end);
                break;
            case 'comprehensive':
                reportData = await generateComprehensiveReport(start, end);
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid report type. Available types: user_engagement, appointment_analysis, resource_usage, chat_analytics, comprehensive'
                });
        }

        res.status(200).json({
            success: true,
            data: {
                reportType,
                startDate: start,
                endDate: end,
                generatedAt: new Date(),
                ...reportData
            }
        });

    } catch (error) {
        console.error('Generate reports error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while generating reports.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Counsellor-specific routes
exports.getCounsellorAppointments = async (req, res) => {
    try {
        const counsellorId = req.user.id;
        const { page = 1, limit = 10, status, startDate, endDate } = req.query;

        const query = { counsellorId: counsellorId };

        if (status) query.status = status;
        if (startDate || endDate) {
            query.startTime = {};
            if (startDate) query.startTime.$gte = new Date(startDate);
            if (endDate) query.startTime.$lte = new Date(endDate);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const appointments = await Appointment.find(query)
            .populate('userId', 'fullName studentId email')
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Appointment.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                appointments: appointments.map(appointment => ({
                    id: appointment._id,
                    user: {
                        id: appointment.userId._id,
                        fullName: appointment.userId.fullName,
                        studentId: appointment.userId.studentId,
                        email: appointment.userId.email
                    },
                    startTime: appointment.startTime,
                    endTime: appointment.endTime,
                    status: appointment.status,
                    sessionType: appointment.sessionType,
                    notes: appointment.notes
                })),
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            }
        });

    } catch (error) {
        console.error('Get counsellor appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching counsellor appointments.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update appointment status (for counsellors)
exports.updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const counsellorId = req.user.id;

        const appointment = await Appointment.findOne({
            _id: id,
            counsellorId: counsellorId
        });

        if (!appointment) {
            return res.status(404).json({
                success: false,
                message: 'Appointment not found!'
            });
        }

        await Appointment.findByIdAndUpdate(id, {
            status: status,
            ...(notes && { notes: notes })
        });

        res.status(200).json({
            success: true,
            message: 'Appointment status updated successfully!'
        });

    } catch (error) {
        console.error('Update appointment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating appointment status.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get counsellor availability
exports.getCounsellorAvailability = async (req, res) => {
    try {
        const counsellorId = req.user.id;

        // Get counsellor's current availability settings
        const counsellor = await User.findById(counsellorId);
        if (!counsellor) {
            return res.status(404).json({
                success: false,
                message: 'Counsellor not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                availability: counsellor.preferences?.availability || {},
                workingHours: counsellor.preferences?.workingHours || {},
                specializations: counsellor.preferences?.specialization || 'General Counselling',
                languages: counsellor.preferences?.languages || ['English']
            }
        });

    } catch (error) {
        console.error('Get counsellor availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching counsellor availability.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update counsellor availability
exports.updateCounsellorAvailability = async (req, res) => {
    try {
        const counsellorId = req.user.id;
        const { availability, workingHours, specializations, languages } = req.body;

        const updateData = {
            preferences: {
                availability: availability || {},
                workingHours: workingHours || {},
                specialization: specializations,
                languages: languages || ['English']
            }
        };

        await User.findByIdAndUpdate(counsellorId, updateData);

        res.status(200).json({
            success: true,
            message: 'Availability updated successfully!'
        });

    } catch (error) {
        console.error('Update counsellor availability error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating counsellor availability.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Moderator routes for forum management
exports.getForumPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search } = req.query;

        // This would typically query a Forum model
        // For now, returning a placeholder response
        res.status(200).json({
            success: true,
            message: 'Forum posts functionality will be implemented with Forum model',
            data: {
                posts: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: 0
                }
            }
        });

    } catch (error) {
        console.error('Get forum posts error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching forum posts.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update forum post status
exports.updateForumPostStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        // This would typically update a Forum model
        // For now, returning a placeholder response
        res.status(200).json({
            success: true,
            message: 'Forum post status updated successfully!'
        });

    } catch (error) {
        console.error('Update forum post status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating forum post status.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get reported content
exports.getReportedContent = async (req, res) => {
    try {
        const { page = 1, limit = 10, contentType } = req.query;

        // This would typically query reported content
        // For now, returning a placeholder response
        res.status(200).json({
            success: true,
            message: 'Reported content functionality will be implemented',
            data: {
                reportedContent: [],
                pagination: {
                    total: 0,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: 0
                }
            }
        });

    } catch (error) {
        console.error('Get reported content error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching reported content.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Helper functions for report generation
async function generateUserEngagementReport(start, end) {
    const totalUsers = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const activeUsers = await User.countDocuments({ 
        lastLogin: { $gte: start, $lte: end },
        isActive: true 
    });
    const newRegistrations = await User.countDocuments({ createdAt: { $gte: start, $lte: end } });

    return {
        totalUsers,
        activeUsers,
        newRegistrations,
        engagementRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(2) : 0
    };
}

async function generateAppointmentAnalysisReport(start, end) {
    const totalAppointments = await Appointment.countDocuments({ 
        startTime: { $gte: start, $lte: end } 
    });
    const completedAppointments = await Appointment.countDocuments({ 
        startTime: { $gte: start, $lte: end },
        status: 'completed'
    });
    const cancelledAppointments = await Appointment.countDocuments({ 
        startTime: { $gte: start, $lte: end },
        status: 'cancelled'
    });

    return {
        totalAppointments,
        completedAppointments,
        cancelledAppointments,
        completionRate: totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0,
        cancellationRate: totalAppointments > 0 ? (cancelledAppointments / totalAppointments * 100).toFixed(2) : 0
    };
}

async function generateResourceUsageReport(start, end) {
    const totalResources = await Resource.countDocuments({ createdAt: { $gte: start, $lte: end } });
    const totalViews = await Resource.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
    ]);

    return {
        totalResources,
        totalViews: totalViews[0]?.totalViews || 0,
        averageViewsPerResource: totalResources > 0 ? (totalViews[0]?.totalViews || 0) / totalResources : 0
    };
}

async function generateChatAnalyticsReport(start, end) {
    const totalSessions = await ChatSession.countDocuments({ 
        startTime: { $gte: start, $lte: end } 
    });
    const emergencySessions = await ChatSession.countDocuments({ 
        startTime: { $gte: start, $lte: end },
        emergencyTriggered: true
    });
    const totalMessages = await ChatMessage.countDocuments({ 
        timestamp: { $gte: start, $lte: end } 
    });

    return {
        totalSessions,
        emergencySessions,
        totalMessages,
        emergencyRate: totalSessions > 0 ? (emergencySessions / totalSessions * 100).toFixed(2) : 0,
        averageMessagesPerSession: totalSessions > 0 ? (totalMessages / totalSessions).toFixed(2) : 0
    };
}

async function generateComprehensiveReport(start, end) {
    const [userEngagement, appointmentAnalysis, resourceUsage, chatAnalytics] = await Promise.all([
        generateUserEngagementReport(start, end),
        generateAppointmentAnalysisReport(start, end),
        generateResourceUsageReport(start, end),
        generateChatAnalyticsReport(start, end)
    ]);

    return {
        userEngagement,
        appointmentAnalysis,
        resourceUsage,
        chatAnalytics,
        summary: {
            period: `${start.toDateString()} to ${end.toDateString()}`,
            generatedAt: new Date()
        }
    };
}
