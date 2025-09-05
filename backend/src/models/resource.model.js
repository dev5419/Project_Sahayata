const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 200
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['academic', 'anxiety', 'depression', 'relationships', 'wellness', 'relaxation', 'stress', 'sleep', 'nutrition', 'exercise'],
        required: true
    },
    type: {
        type: String,
        enum: ['article', 'video', 'audio', 'infographic', 'worksheet'],
        required: true
    },
    language: {
        type: String,
        default: 'English',
        trim: true
    },
    duration: {
        type: Number, // in minutes
        min: 0
    },
    fileUrl: {
        type: String,
        trim: true
    },
    thumbnailUrl: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    viewCount: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
resourceSchema.index({ category: 1 });
resourceSchema.index({ language: 1 });
resourceSchema.index({ type: 1 });
resourceSchema.index({ isPublished: 1 });
resourceSchema.index({ viewCount: -1 });
resourceSchema.index({ rating: -1 });
resourceSchema.index({ tags: 1 });

// Virtual for average rating
resourceSchema.virtual('averageRating').get(function() {
    return this.ratingCount > 0 ? this.rating / this.ratingCount : 0;
});

// Method to increment view count
resourceSchema.methods.incrementViewCount = function() {
    this.viewCount += 1;
    return this.save();
};

// Method to add rating
resourceSchema.methods.addRating = function(newRating) {
    const totalRating = (this.rating * this.ratingCount) + newRating;
    this.ratingCount += 1;
    this.rating = totalRating / this.ratingCount;
    return this.save();
};

// Ensure virtual fields are serialized
resourceSchema.set('toJSON', { virtuals: true });
resourceSchema.set('toObject', { virtuals: true });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
