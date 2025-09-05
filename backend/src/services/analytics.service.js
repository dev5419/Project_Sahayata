const Appointment = require('../models/appointment.model');
const Resource = require('../models/resource.model');
const User = require('../models/user.model');
const { ChatSession, ChatMessage } = require('../models/chat.model');

exports.getAnonymizedAnalytics = async () => {
    try {
        // 1. Appointment trends per day (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const appointmentsPerDay = await Appointment.aggregate([
            {
                $match: {
                    startTime: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    total: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    total: 1,
                    completed: 1,
                    cancelled: 1
                }
            }
        ]);

        // 2. Resource popularity by category
        const resourcePopularity = await Resource.aggregate([
            {
                $match: { isPublished: true }
            },
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    avgRating: { $avg: "$rating" },
                    totalViews: { $sum: "$viewCount" }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    category: "$_id",
                    count: 1,
                    avgRating: { $round: ["$avgRating", 2] },
                    totalViews: 1
                }
            }
        ]);

        // 3. Most viewed resources
        const mostViewedResources = await Resource.find({
            isPublished: true
        })
        .select('title category viewCount rating type')
        .sort({ viewCount: -1 })
        .limit(5)
        .lean();

        // 4. Chat session statistics
        const chatStats = await ChatSession.aggregate([
            {
                $match: {
                    startTime: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    totalSessions: { $sum: 1 },
                    emergencySessions: {
                        $sum: { $cond: [{ $eq: ["$emergencyTriggered", true] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { _id: 1 }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id",
                    totalSessions: 1,
                    emergencySessions: 1
                }
            }
        ]);

        // 5. User engagement metrics
        const userEngagement = await User.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 },
                    avgLastLoginDays: {
                        $avg: {
                            $divide: [
                                { $subtract: [new Date(), "$lastLogin"] },
                                1000 * 60 * 60 * 24 // Convert to days
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    role: "$_id",
                    count: 1,
                    avgLastLoginDays: { $round: ["$avgLastLoginDays", 2] }
                }
            }
        ]);

        // 6. Counsellor utilization
        const counsellorUtilization = await Appointment.aggregate([
            {
                $match: {
                    startTime: { $gte: thirtyDaysAgo }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "counsellorId",
                    foreignField: "_id",
                    as: "counsellor"
                }
            },
            {
                $unwind: "$counsellor"
            },
            {
                $match: { "counsellor.role": "counsellor" }
            },
            {
                $group: {
                    _id: "$counsellorId",
                    counsellorName: { $first: "$counsellor.fullName" },
                    department: { $first: "$counsellor.department" },
                    totalAppointments: { $sum: 1 },
                    completedAppointments: {
                        $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] }
                    },
                    cancelledAppointments: {
                        $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { totalAppointments: -1 }
            },
            {
                $project: {
                    _id: 0,
                    counsellorName: 1,
                    department: 1,
                    totalAppointments: 1,
                    completedAppointments: 1,
                    cancelledAppointments: 1,
                    completionRate: {
                        $round: [
                            {
                                $multiply: [
                                    { $divide: ["$completedAppointments", "$totalAppointments"] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            }
        ]);

        // 7. Session type distribution
        const sessionTypeDistribution = await Appointment.aggregate([
            {
                $match: {
                    startTime: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: "$sessionType",
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    sessionType: "$_id",
                    count: 1
                }
            }
        ]);

        // 8. Emergency keyword frequency (anonymized)
        const emergencyKeywords = await ChatMessage.aggregate([
            {
                $match: {
                    messageType: 'emergency',
                    timestamp: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $toLower: "$message" },
                    frequency: { $sum: 1 }
                }
            },
            {
                $sort: { frequency: -1 }
            },
            {
                $limit: 10
            },
            {
                $project: {
                    _id: 0,
                    keyword: "$_id",
                    frequency: 1
                }
            }
        ]);

        // Calculate summary statistics
        const totalUsers = await User.countDocuments({ isActive: true });
        const totalAppointments = await Appointment.countDocuments({
            startTime: { $gte: thirtyDaysAgo }
        });
        const totalChatSessions = await ChatSession.countDocuments({
            startTime: { $gte: thirtyDaysAgo }
        });
        const emergencySessions = await ChatSession.countDocuments({
            emergencyTriggered: true,
            startTime: { $gte: thirtyDaysAgo }
        });

        // Return anonymized data only
        const anonymizedData = {
            summary: {
                totalActiveUsers: totalUsers,
                totalAppointments: totalAppointments,
                totalChatSessions: totalChatSessions,
                emergencySessions: emergencySessions,
                period: 'Last 30 days'
            },
            appointmentTrends: appointmentsPerDay,
            resourcePopularity: resourcePopularity,
            mostViewedResources: mostViewedResources.map(item => ({
                id: item._id,
                title: item.title,
                category: item.category,
                viewCount: item.viewCount,
                rating: item.rating,
                type: item.type
            })),
            chatStatistics: chatStats,
            userEngagement: userEngagement,
            counsellorUtilization: counsellorUtilization,
            sessionTypeDistribution: sessionTypeDistribution,
            emergencyKeywords: emergencyKeywords
        };

        return anonymizedData;

    } catch (error) {
        console.error('Analytics service error:', error);
        throw new Error('Failed to fetch analytics data.');
    }
};

// Get real-time dashboard metrics
exports.getDashboardMetrics = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Today's appointments
        const todayAppointments = await Appointment.countDocuments({
            startTime: { $gte: today, $lt: tomorrow }
        });

        // Today's chat sessions
        const todayChatSessions = await ChatSession.countDocuments({
            startTime: { $gte: today, $lt: tomorrow }
        });

        // Today's emergency sessions
        const todayEmergencySessions = await ChatSession.countDocuments({
            emergencyTriggered: true,
            startTime: { $gte: today, $lt: tomorrow }
        });

        // Active users today
        const activeUsersToday = await User.countDocuments({
            lastLogin: { $gte: today },
            isActive: true
        });

        return {
            todayAppointments,
            todayChatSessions,
            todayEmergencySessions,
            activeUsersToday,
            date: today.toISOString().split('T')[0]
        };

    } catch (error) {
        console.error('Dashboard metrics error:', error);
        throw new Error('Failed to fetch dashboard metrics.');
    }
};
