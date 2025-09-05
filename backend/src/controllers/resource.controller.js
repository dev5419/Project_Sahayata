const Resource = require('../models/resource.model');

// Get all resources with pagination and filtering
exports.getAllResources = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            category, 
            type, 
            language, 
            search,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const query = { isPublished: true };

        // Apply filters
        if (category) query.category = category;
        if (type) query.type = type;
        if (language) query.language = language;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const resources = await Resource.find(query)
            .populate('createdBy', 'fullName')
            .sort(sort)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Resource.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                resources: resources.map(resource => ({
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    category: resource.category,
                    type: resource.type,
                    language: resource.language,
                    duration: resource.duration,
                    thumbnailUrl: resource.thumbnailUrl,
                    tags: resource.tags,
                    viewCount: resource.viewCount,
                    rating: resource.rating,
                    ratingCount: resource.ratingCount,
                    averageRating: resource.averageRating,
                    createdBy: resource.createdBy,
                    createdAt: resource.createdAt
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
        console.error('Get all resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching resources.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get resource by ID
exports.getResourceById = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id)
            .populate('createdBy', 'fullName')
            .lean();

        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found!'
            });
        }

        if (!resource.isPublished) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found!'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                resource: {
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    content: resource.content,
                    category: resource.category,
                    type: resource.type,
                    language: resource.language,
                    duration: resource.duration,
                    fileUrl: resource.fileUrl,
                    thumbnailUrl: resource.thumbnailUrl,
                    tags: resource.tags,
                    viewCount: resource.viewCount,
                    rating: resource.rating,
                    ratingCount: resource.ratingCount,
                    averageRating: resource.averageRating,
                    createdBy: resource.createdBy,
                    createdAt: resource.createdAt,
                    updatedAt: resource.updatedAt
                }
            }
        });

    } catch (error) {
        console.error('Get resource by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching resource.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Increment view count
exports.incrementViewCount = async (req, res) => {
    try {
        const { id } = req.params;

        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found!'
            });
        }

        await resource.incrementViewCount();

        res.status(200).json({
            success: true,
            message: 'View count updated successfully!'
        });

    } catch (error) {
        console.error('Increment view count error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while updating view count.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Rate a resource
exports.rateResource = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating } = req.body;
        const userId = req.user.id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5!'
            });
        }

        const resource = await Resource.findById(id);
        if (!resource) {
            return res.status(404).json({
                success: false,
                message: 'Resource not found!'
            });
        }

        await resource.addRating(rating);

        res.status(200).json({
            success: true,
            message: 'Resource rated successfully!',
            data: {
                newRating: resource.rating,
                ratingCount: resource.ratingCount
            }
        });

    } catch (error) {
        console.error('Rate resource error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while rating resource.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get resources by category
exports.getResourcesByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const query = { 
            category: category,
            isPublished: true 
        };

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const resources = await Resource.find(query)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Resource.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                category,
                resources: resources.map(resource => ({
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    type: resource.type,
                    language: resource.language,
                    duration: resource.duration,
                    thumbnailUrl: resource.thumbnailUrl,
                    tags: resource.tags,
                    viewCount: resource.viewCount,
                    rating: resource.rating,
                    ratingCount: resource.ratingCount,
                    averageRating: resource.averageRating,
                    createdBy: resource.createdBy,
                    createdAt: resource.createdAt
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
        console.error('Get resources by category error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching resources by category.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Search resources
exports.searchResources = async (req, res) => {
    try {
        const { 
            q, 
            category, 
            type, 
            language, 
            page = 1, 
            limit = 10 
        } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required!'
            });
        }

        const query = { 
            isPublished: true,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { content: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } }
            ]
        };

        // Apply additional filters
        if (category) query.category = category;
        if (type) query.type = type;
        if (language) query.language = language;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const resources = await Resource.find(query)
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await Resource.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                query: q,
                filters: { category, type, language },
                resources: resources.map(resource => ({
                    id: resource._id,
                    title: resource.title,
                    description: resource.description,
                    category: resource.category,
                    type: resource.type,
                    language: resource.language,
                    duration: resource.duration,
                    thumbnailUrl: resource.thumbnailUrl,
                    tags: resource.tags,
                    viewCount: resource.viewCount,
                    rating: resource.rating,
                    ratingCount: resource.ratingCount,
                    averageRating: resource.averageRating,
                    createdBy: resource.createdBy,
                    createdAt: resource.createdAt
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
        console.error('Search resources error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while searching resources.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
