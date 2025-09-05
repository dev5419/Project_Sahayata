const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.User;

const verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.headers['x-access-token'];

        if (!token) {
            return res.status(403).json({
                success: false,
                message: 'No token provided!'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized! User not found or inactive.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired!'
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token!'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Internal server error during token verification.'
        });
    }
};

const isStudent = (req, res, next) => {
    if (req.user.role !== 'student') {
        return res.status(403).json({
            success: false,
            message: 'Require Student Role!'
        });
    }
    next();
};

const isCounsellor = (req, res, next) => {
    if (req.user.role !== 'counsellor') {
        return res.status(403).json({
            success: false,
            message: 'Require Counsellor Role!'
        });
    }
    next();
};

const isModerator = (req, res, next) => {
    if (req.user.role !== 'moderator' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Require Moderator or Admin Role!'
        });
    }
    next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Require Admin Role!'
        });
    }
    next();
};

const isCounsellorOrAdmin = (req, res, next) => {
    if (req.user.role !== 'counsellor' && req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Require Counsellor or Admin Role!'
        });
    }
    next();
};

module.exports = {
    verifyToken,
    isStudent,
    isCounsellor,
    isModerator,
    isAdmin,
    isCounsellorOrAdmin
};
