const express = require('express');
const router = express.Router();

// Sample resources data
const resources = [
    {
        id: 1,
        title: "Managing Exam Stress",
        description: "Comprehensive guide to managing stress during exam periods with practical techniques.",
        category: "academic",
        language: "english",
        icon: "📚",
        iconBg: "#e3f2fd",
        content: "Exam stress is a common experience for students. This guide provides practical strategies including time management, relaxation techniques, and healthy study habits. Learn how to create a balanced study schedule, practice mindfulness, and maintain your well-being during challenging periods.",
        readTime: "5 min read",
        tags: ["stress", "exams", "study", "academic"]
    },
    {
        id: 2,
        title: "Breathing Exercises for Anxiety",
        description: "Simple breathing techniques to help calm anxiety and reduce stress levels.",
        category: "anxiety",
        language: "english",
        icon: "🫁",
        iconBg: "#f3e5f5",
        content: "Breathing exercises are powerful tools for managing anxiety. This resource teaches you the 4-7-8 breathing technique, box breathing, and progressive muscle relaxation. Practice these exercises regularly to build resilience against anxiety.",
        readTime: "3 min read",
        tags: ["anxiety", "breathing", "relaxation", "techniques"]
    },
    {
        id: 3,
        title: "Understanding Depression",
        description: "Educational content about depression, its symptoms, and available support options.",
        category: "depression",
        language: "hindi",
        icon: "😔",
        iconBg: "#fff3e0",
        content: "Depression is more than just feeling sad. This resource explains the symptoms, causes, and treatment options for depression. Learn about the importance of seeking help and the various support systems available.",
        readTime: "7 min read",
        tags: ["depression", "mental health", "symptoms", "treatment"]
    },
    {
        id: 4,
        title: "Building Healthy Relationships",
        description: "Guidance on developing and maintaining healthy relationships with friends and family.",
        category: "relationships",
        language: "english",
        icon: "💕",
        iconBg: "#e8f5e8",
        content: "Healthy relationships are essential for mental well-being. Learn about communication skills, setting boundaries, and building trust. This guide helps you navigate friendships, family relationships, and romantic partnerships.",
        readTime: "6 min read",
        tags: ["relationships", "communication", "boundaries", "trust"]
    },
    {
        id: 5,
        title: "Daily Wellness Routine",
        description: "Simple daily practices to improve your overall mental and physical well-being.",
        category: "wellness",
        language: "english",
        icon: "🧘‍♀️",
        iconBg: "#fce4ec",
        content: "A daily wellness routine can significantly improve your mental health. This resource provides a step-by-step guide to creating morning and evening routines that promote relaxation, productivity, and self-care.",
        readTime: "4 min read",
        tags: ["wellness", "routine", "self-care", "daily"]
    },
    {
        id: 6,
        title: "Guided Meditation for Sleep",
        description: "Audio meditation to help you relax and fall asleep more easily.",
        category: "relaxation",
        language: "english",
        icon: "🎵",
        iconBg: "#e0f2f1",
        content: "This guided meditation helps you relax your mind and body for better sleep. Follow along with the audio to release tension, quiet your thoughts, and prepare your body for restful sleep.",
        readTime: "10 min audio",
        tags: ["meditation", "sleep", "relaxation", "audio"]
    },
    {
        id: 7,
        title: "Coping with Homesickness",
        description: "Strategies for dealing with homesickness when away from family.",
        category: "wellness",
        language: "english",
        icon: "🏠",
        iconBg: "#fff8e1",
        content: "Homesickness is a common experience for students living away from home. Learn practical strategies to stay connected with family while building independence and creating a new support network.",
        readTime: "5 min read",
        tags: ["homesickness", "family", "independence", "support"]
    },
    {
        id: 8,
        title: "Public Speaking Confidence",
        description: "Tips and techniques to build confidence for presentations and public speaking.",
        category: "anxiety",
        language: "english",
        icon: "🎤",
        iconBg: "#f1f8e9",
        content: "Public speaking anxiety affects many students. This resource provides practical techniques to build confidence, manage nervousness, and deliver effective presentations.",
        readTime: "6 min read",
        tags: ["public speaking", "confidence", "presentations", "anxiety"]
    }
];

// User saved resources (in a real app, this would be in a database)
let userSavedResources = new Map();

// Get all resources with optional filtering
router.get('/', (req, res) => {
    const { category, language, search } = req.query;
    
    let filteredResources = [...resources];
    
    // Filter by category
    if (category && category !== 'all') {
        filteredResources = filteredResources.filter(r => r.category === category);
    }
    
    // Filter by language
    if (language && language !== 'all') {
        filteredResources = filteredResources.filter(r => r.language === language);
    }
    
    // Search functionality
    if (search) {
        const searchLower = search.toLowerCase();
        filteredResources = filteredResources.filter(r => 
            r.title.toLowerCase().includes(searchLower) ||
            r.description.toLowerCase().includes(searchLower) ||
            r.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    }
    
    res.json({
        success: true,
        resources: filteredResources,
        total: filteredResources.length
    });
});

// Get resource by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    const resource = resources.find(r => r.id === parseInt(id));
    
    if (!resource) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }
    
    res.json({
        success: true,
        resource
    });
});

// Get resources by category
router.get('/category/:category', (req, res) => {
    const { category } = req.params;
    const categoryResources = resources.filter(r => r.category === category);
    
    res.json({
        success: true,
        resources: categoryResources,
        category,
        total: categoryResources.length
    });
});

// Get available categories
router.get('/categories/list', (req, res) => {
    const categories = [...new Set(resources.map(r => r.category))];
    
    const categoryStats = categories.map(category => {
        const count = resources.filter(r => r.category === category).length;
        return { category, count };
    });
    
    res.json({
        success: true,
        categories: categoryStats
    });
});

// Get available languages
router.get('/languages/list', (req, res) => {
    const languages = [...new Set(resources.map(r => r.language))];
    
    const languageStats = languages.map(language => {
        const count = resources.filter(r => r.language === language).length;
        return { language, count };
    });
    
    res.json({
        success: true,
        languages: languageStats
    });
});

// Save resource for user
router.post('/save/:resourceId', (req, res) => {
    const { resourceId } = req.params;
    const { userId } = req.body;
    
    const resource = resources.find(r => r.id === parseInt(resourceId));
    
    if (!resource) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found'
        });
    }
    
    if (!userSavedResources.has(userId)) {
        userSavedResources.set(userId, []);
    }
    
    const userSaved = userSavedResources.get(userId);
    
    // Check if already saved
    if (userSaved.includes(parseInt(resourceId))) {
        return res.status(400).json({
            success: false,
            message: 'Resource already saved'
        });
    }
    
    userSaved.push(parseInt(resourceId));
    
    res.json({
        success: true,
        message: 'Resource saved successfully'
    });
});

// Remove saved resource
router.delete('/save/:resourceId', (req, res) => {
    const { resourceId } = req.params;
    const { userId } = req.body;
    
    if (!userSavedResources.has(userId)) {
        return res.status(404).json({
            success: false,
            message: 'No saved resources found'
        });
    }
    
    const userSaved = userSavedResources.get(userId);
    const resourceIndex = userSaved.indexOf(parseInt(resourceId));
    
    if (resourceIndex === -1) {
        return res.status(404).json({
            success: false,
            message: 'Resource not found in saved list'
        });
    }
    
    userSaved.splice(resourceIndex, 1);
    
    res.json({
        success: true,
        message: 'Resource removed from saved list'
    });
});

// Get user's saved resources
router.get('/user/:userId/saved', (req, res) => {
    const { userId } = req.params;
    
    if (!userSavedResources.has(userId)) {
        return res.json({
            success: true,
            resources: [],
            total: 0
        });
    }
    
    const savedResourceIds = userSavedResources.get(userId);
    const savedResources = resources.filter(r => savedResourceIds.includes(r.id));
    
    res.json({
        success: true,
        resources: savedResources,
        total: savedResources.length
    });
});

// Track resource view
router.post('/:resourceId/view', (req, res) => {
    const { resourceId } = req.params;
    const { userId } = req.body;
    
    // In a real app, this would track analytics
    console.log(`User ${userId} viewed resource ${resourceId}`);
    
    res.json({
        success: true,
        message: 'View tracked'
    });
});

// Get popular resources
router.get('/popular/list', (req, res) => {
    // In a real app, this would be based on actual view counts
    const popularResources = resources.slice(0, 5);
    
    res.json({
        success: true,
        resources: popularResources
    });
});

// Get recently added resources
router.get('/recent/list', (req, res) => {
    const recentResources = resources.slice(-5).reverse();
    
    res.json({
        success: true,
        resources: recentResources
    });
});

// Search resources
router.get('/search/query', (req, res) => {
    const { q } = req.query;
    
    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }
    
    const searchLower = q.toLowerCase();
    const searchResults = resources.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower) ||
        r.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
    
    res.json({
        success: true,
        resources: searchResults,
        query: q,
        total: searchResults.length
    });
});

module.exports = router;
