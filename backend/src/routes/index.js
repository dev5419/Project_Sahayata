const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

// Import controllers
const authController = require('../controllers/auth.controller');
const bookingController = require('../controllers/booking.controller');
const resourceController = require('../controllers/resource.controller');
const chatController = require('../controllers/chat.controller');
const adminController = require('../controllers/admin.controller');

// Import middleware
const { verifyToken, isAdmin, isCounsellor, isModerator } = require('../middlewares/auth.jwt');

// Validation rules
const registerValidation = [
    body('studentId')
        .isLength({ min: 3, max: 20 })
        .withMessage('Student ID must be between 3 and 20 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Student ID can only contain letters, numbers, hyphens, and underscores'),
    body('fullName')
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .trim(),
    body('email')
        .isEmail()
        .withMessage('Please enter a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    body('department')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Department must be between 2 and 100 characters'),
    body('yearOfStudy')
        .optional()
        .isInt({ min: 1, max: 6 })
        .withMessage('Year of study must be between 1 and 6'),
    body('phone')
        .optional()
        .matches(/^[\+]?[1-9][\d]{0,15}$/)
        .withMessage('Please enter a valid phone number')
];

const loginValidation = [
    body('identifier')
        .notEmpty()
        .withMessage('Email or Student ID is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

const appointmentValidation = [
    body('counsellorId')
        .isMongoId()
        .withMessage('Invalid counsellor ID'),
    body('startTime')
        .isISO8601()
        .withMessage('Start time must be a valid date')
        .custom((value) => {
            const startTime = new Date(value);
            const now = new Date();
            if (startTime <= now) {
                throw new Error('Start time must be in the future');
            }
            return true;
        }),
    body('endTime')
        .isISO8601()
        .withMessage('End time must be a valid date')
        .custom((value, { req }) => {
            const endTime = new Date(value);
            const startTime = new Date(req.body.startTime);
            if (endTime <= startTime) {
                throw new Error('End time must be after start time');
            }
            return true;
        }),
    body('sessionType')
        .optional()
        .isIn(['in-person', 'video', 'phone'])
        .withMessage('Session type must be in-person, video, or phone'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes must not exceed 500 characters')
];

const resourceValidation = [
    body('title')
        .isLength({ min: 1, max: 200 })
        .withMessage('Title must be between 1 and 200 characters'),
    body('description')
        .isLength({ min: 10, max: 1000 })
        .withMessage('Description must be between 10 and 1000 characters'),
    body('content')
        .notEmpty()
        .withMessage('Content is required'),
    body('category')
        .isIn(['academic', 'anxiety', 'depression', 'relationships', 'wellness', 'relaxation', 'stress', 'sleep', 'nutrition', 'exercise'])
        .withMessage('Invalid category'),
    body('type')
        .isIn(['article', 'video', 'audio', 'infographic', 'worksheet'])
        .withMessage('Invalid resource type'),
    body('language')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Language must be between 2 and 50 characters'),
    body('duration')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Duration must be a positive number'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    body('tags.*')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Each tag must be between 1 and 50 characters')
];

const chatValidation = [
    body('message')
        .isLength({ min: 1, max: 1000 })
        .withMessage('Message must be between 1 and 1000 characters'),
    body('sessionId')
        .optional()
        .isMongoId()
        .withMessage('Invalid session ID')
];

// === AUTHENTICATION ROUTES ===
router.post('/auth/register', registerValidation, authController.register);
router.post('/auth/login', loginValidation, authController.login);
router.get('/auth/profile', verifyToken, authController.getProfile);
router.put('/auth/profile', verifyToken, authController.updateProfile);
router.post('/auth/change-password', verifyToken, authController.changePassword);
router.post('/auth/logout', verifyToken, authController.logout);

// === BOOKING ROUTES ===
router.get('/counsellors', bookingController.getCounsellors);
router.get('/counsellors/:id', bookingController.getCounsellorDetails);
router.get('/counsellors/:id/availability', bookingController.getCounsellorAvailability);
router.post('/appointments', [verifyToken, ...appointmentValidation], bookingController.bookAppointment);
router.get('/appointments', verifyToken, bookingController.getUserAppointments);
router.delete('/appointments/:id', verifyToken, bookingController.cancelAppointment);

// === RESOURCE ROUTES ===
router.get('/resources', resourceController.getAllResources);
router.get('/resources/:id', resourceController.getResourceById);
router.post('/resources/:id/view', resourceController.incrementViewCount);
router.post('/resources/:id/rate', verifyToken, resourceController.rateResource);
router.get('/resources/categories/:category', resourceController.getResourcesByCategory);
router.get('/resources/search', resourceController.searchResources);

// === CHAT ROUTES ===
router.post('/chat/start', verifyToken, chatController.startSession);
router.post('/chat/message', [verifyToken, ...chatValidation], chatController.sendMessage);
router.get('/chat/sessions', verifyToken, chatController.getUserSessions);
router.get('/chat/sessions/:sessionId', verifyToken, chatController.getSessionMessages);
router.post('/chat/sessions/:sessionId/end', verifyToken, chatController.endSession);

// === ADMIN ROUTES ===
router.get('/admin/analytics', [verifyToken, isAdmin], adminController.getAnalytics);
router.get('/admin/dashboard-metrics', [verifyToken, isAdmin], adminController.getDashboardMetrics);
router.get('/admin/users', [verifyToken, isAdmin], adminController.getAllUsers);
router.put('/admin/users/:id/status', [verifyToken, isAdmin], adminController.updateUserStatus);
router.get('/admin/appointments', [verifyToken, isAdmin], adminController.getAllAppointments);
router.get('/admin/reports', [verifyToken, isAdmin], adminController.generateReports);

// === COUNSELLOR ROUTES ===
router.get('/counsellor/appointments', [verifyToken, isCounsellor], adminController.getCounsellorAppointments);
router.put('/counsellor/appointments/:id/status', [verifyToken, isCounsellor], adminController.updateAppointmentStatus);
router.get('/counsellor/availability', [verifyToken, isCounsellor], adminController.getCounsellorAvailability);
router.put('/counsellor/availability', [verifyToken, isCounsellor], adminController.updateCounsellorAvailability);

// === MODERATOR ROUTES ===
router.get('/moderator/forum-posts', [verifyToken, isModerator], adminController.getForumPosts);
router.put('/moderator/forum-posts/:id/status', [verifyToken, isModerator], adminController.updateForumPostStatus);
router.get('/moderator/reported-content', [verifyToken, isModerator], adminController.getReportedContent);

// === HEALTH CHECK ===
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Project Sahayata API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// === 404 HANDLER ===
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl
    });
});

module.exports = router;
