const express = require('express');
const router = express.Router();

// Sample forum data
let discussions = [
    {
        id: 1,
        title: "Tips for managing group project stress",
        content: "I'm really struggling with my group project. My teammates have different work styles and I feel like I'm doing most of the work. Has anyone else been through this? Looking for advice on how to communicate better and manage the workload.",
        author: "Anonymous",
        authorId: "user_001",
        category: "academic",
        tags: ["group work", "stress", "communication"],
        replies: [
            {
                id: 1,
                content: "I've been there! Try setting up a group meeting to discuss everyone's strengths and divide work more evenly. Sometimes people don't realize they're not contributing enough.",
                author: "Anonymous",
                authorId: "user_002",
                timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                likes: 3
            },
            {
                id: 2,
                content: "Document everything you do and share it with your professor if the situation doesn't improve. Your mental health comes first!",
                author: "Anonymous",
                authorId: "user_003",
                timestamp: new Date(Date.now() - 1800000), // 30 min ago
                likes: 5
            }
        ],
        views: 45,
        likes: 8,
        timestamp: new Date(Date.now() - 7200000), // 2 hours ago
        isSticky: false,
        isLocked: false
    },
    {
        id: 2,
        title: "Feeling overwhelmed with online classes",
        content: "Since we moved to online classes, I'm finding it really hard to stay motivated and focused. My productivity has dropped significantly and I'm falling behind. Anyone have tips for staying on track?",
        author: "Anonymous",
        authorId: "user_004",
        category: "academic",
        tags: ["online learning", "motivation", "productivity"],
        replies: [
            {
                id: 3,
                content: "Create a dedicated study space and stick to a routine! I found that getting dressed as if I'm going to campus helps me get into the right mindset.",
                author: "Anonymous",
                authorId: "user_005",
                timestamp: new Date(Date.now() - 5400000), // 1.5 hours ago
                likes: 7
            }
        ],
        views: 32,
        likes: 6,
        timestamp: new Date(Date.now() - 9000000), // 2.5 hours ago
        isSticky: false,
        isLocked: false
    },
    {
        id: 3,
        title: "Dealing with homesickness",
        content: "This is my first semester living away from home and I'm really struggling with homesickness. I miss my family and friends so much. How do you cope with being away from home?",
        author: "Anonymous",
        authorId: "user_006",
        category: "wellness",
        tags: ["homesickness", "family", "adjustment"],
        replies: [
            {
                id: 4,
                content: "It gets easier with time! Try to stay busy with activities and make new friends. Video calls with family help too. You're not alone in feeling this way.",
                author: "Anonymous",
                authorId: "user_007",
                timestamp: new Date(Date.now() - 2700000), // 45 min ago
                likes: 4
            },
            {
                id: 5,
                content: "I felt the same way my first year. Join some clubs or groups to meet people with similar interests. It really helps!",
                author: "Anonymous",
                authorId: "user_008",
                timestamp: new Date(Date.now() - 900000), // 15 min ago
                likes: 2
            }
        ],
        views: 28,
        likes: 9,
        timestamp: new Date(Date.now() - 10800000), // 3 hours ago
        isSticky: false,
        isLocked: false
    },
    {
        id: 4,
        title: "Sleep schedule tips for night owls",
        content: "I'm naturally a night owl but my classes start early. I'm constantly tired and it's affecting my grades. Any advice for adjusting my sleep schedule?",
        author: "Anonymous",
        authorId: "user_009",
        category: "wellness",
        tags: ["sleep", "schedule", "health"],
        replies: [
            {
                id: 6,
                content: "Try gradually shifting your bedtime by 15 minutes earlier each night. Avoid screens an hour before bed and create a relaxing routine.",
                author: "Anonymous",
                authorId: "user_010",
                timestamp: new Date(Date.now() - 3600000), // 1 hour ago
                likes: 6
            }
        ],
        views: 19,
        likes: 3,
        timestamp: new Date(Date.now() - 14400000), // 4 hours ago
        isSticky: false,
        isLocked: false
    }
];

// User likes tracking (in a real app, this would be in a database)
let userLikes = new Map();

// Get all discussions with optional filtering
router.get('/', (req, res) => {
    const { category, sort, page = 1, limit = 10 } = req.query;
    
    let filteredDiscussions = [...discussions];
    
    // Filter by category
    if (category && category !== 'all') {
        filteredDiscussions = filteredDiscussions.filter(d => d.category === category);
    }
    
    // Sort discussions
    switch (sort) {
        case 'recent':
            filteredDiscussions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            break;
        case 'popular':
            filteredDiscussions.sort((a, b) => b.views - a.views);
            break;
        case 'replies':
            filteredDiscussions.sort((a, b) => b.replies.length - a.replies.length);
            break;
        default:
            // Default: sticky posts first, then by recent activity
            filteredDiscussions.sort((a, b) => {
                if (a.isSticky && !b.isSticky) return -1;
                if (!a.isSticky && b.isSticky) return 1;
                return new Date(b.timestamp) - new Date(a.timestamp);
            });
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDiscussions = filteredDiscussions.slice(startIndex, endIndex);
    
    res.json({
        success: true,
        discussions: paginatedDiscussions,
        total: filteredDiscussions.length,
        page: parseInt(page),
        totalPages: Math.ceil(filteredDiscussions.length / limit)
    });
});

// Get discussion by ID
router.get('/discussion/:id', (req, res) => {
    const { id } = req.params;
    const discussion = discussions.find(d => d.id === parseInt(id));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    // Increment view count
    discussion.views += 1;
    
    res.json({
        success: true,
        discussion
    });
});

// Create new discussion
router.post('/discussion', (req, res) => {
    const { title, content, category, tags, authorId } = req.body;
    
    // Validation
    if (!title || !content || !category || !authorId) {
        return res.status(400).json({
            success: false,
            message: 'Title, content, category, and authorId are required'
        });
    }
    
    if (title.length < 5 || title.length > 200) {
        return res.status(400).json({
            success: false,
            message: 'Title must be between 5 and 200 characters'
        });
    }
    
    if (content.length < 10 || content.length > 5000) {
        return res.status(400).json({
            success: false,
            message: 'Content must be between 10 and 5000 characters'
        });
    }
    
    const newDiscussion = {
        id: discussions.length + 1,
        title: title.trim(),
        content: content.trim(),
        author: "Anonymous",
        authorId,
        category,
        tags: tags || [],
        replies: [],
        views: 0,
        likes: 0,
        timestamp: new Date(),
        isSticky: false,
        isLocked: false
    };
    
    discussions.unshift(newDiscussion);
    
    res.json({
        success: true,
        discussion: newDiscussion,
        message: 'Discussion created successfully'
    });
});

// Add reply to discussion
router.post('/discussion/:id/reply', (req, res) => {
    const { id } = req.params;
    const { content, authorId } = req.body;
    
    const discussion = discussions.find(d => d.id === parseInt(id));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    if (discussion.isLocked) {
        return res.status(400).json({
            success: false,
            message: 'This discussion is locked'
        });
    }
    
    if (!content || content.length < 5 || content.length > 2000) {
        return res.status(400).json({
            success: false,
            message: 'Reply content must be between 5 and 2000 characters'
        });
    }
    
    const newReply = {
        id: discussion.replies.length + 1,
        content: content.trim(),
        author: "Anonymous",
        authorId,
        timestamp: new Date(),
        likes: 0
    };
    
    discussion.replies.push(newReply);
    
    res.json({
        success: true,
        reply: newReply,
        message: 'Reply added successfully'
    });
});

// Like/unlike discussion
router.post('/discussion/:id/like', (req, res) => {
    const { id } = req.params;
    const { userId } = req.body;
    
    const discussion = discussions.find(d => d.id === parseInt(id));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    if (!userLikes.has(userId)) {
        userLikes.set(userId, new Set());
    }
    
    const userLikedDiscussions = userLikes.get(userId);
    const discussionId = parseInt(id);
    
    if (userLikedDiscussions.has(discussionId)) {
        // Unlike
        userLikedDiscussions.delete(discussionId);
        discussion.likes = Math.max(0, discussion.likes - 1);
        
        res.json({
            success: true,
            liked: false,
            likes: discussion.likes,
            message: 'Discussion unliked'
        });
    } else {
        // Like
        userLikedDiscussions.add(discussionId);
        discussion.likes += 1;
        
        res.json({
            success: true,
            liked: true,
            likes: discussion.likes,
            message: 'Discussion liked'
        });
    }
});

// Like/unlike reply
router.post('/reply/:discussionId/:replyId/like', (req, res) => {
    const { discussionId, replyId } = req.params;
    const { userId } = req.body;
    
    const discussion = discussions.find(d => d.id === parseInt(discussionId));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    const reply = discussion.replies.find(r => r.id === parseInt(replyId));
    
    if (!reply) {
        return res.status(404).json({
            success: false,
            message: 'Reply not found'
        });
    }
    
    if (!userLikes.has(userId)) {
        userLikes.set(userId, new Set());
    }
    
    const userLikedReplies = userLikes.get(userId);
    const replyKey = `${discussionId}_${replyId}`;
    
    if (userLikedReplies.has(replyKey)) {
        // Unlike
        userLikedReplies.delete(replyKey);
        reply.likes = Math.max(0, reply.likes - 1);
        
        res.json({
            success: true,
            liked: false,
            likes: reply.likes,
            message: 'Reply unliked'
        });
    } else {
        // Like
        userLikedReplies.add(replyKey);
        reply.likes += 1;
        
        res.json({
            success: true,
            liked: true,
            likes: reply.likes,
            message: 'Reply liked'
        });
    }
});

// Get forum statistics
router.get('/stats', (req, res) => {
    const totalDiscussions = discussions.length;
    const totalReplies = discussions.reduce((sum, d) => sum + d.replies.length, 0);
    const totalViews = discussions.reduce((sum, d) => sum + d.views, 0);
    const totalLikes = discussions.reduce((sum, d) => sum + d.likes, 0);
    
    // Category breakdown
    const categoryStats = {};
    discussions.forEach(d => {
        categoryStats[d.category] = (categoryStats[d.category] || 0) + 1;
    });
    
    // Recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentDiscussions = discussions.filter(d => new Date(d.timestamp) > oneDayAgo).length;
    const recentReplies = discussions.reduce((sum, d) => 
        sum + d.replies.filter(r => new Date(r.timestamp) > oneDayAgo).length, 0
    );
    
    res.json({
        success: true,
        stats: {
            totalDiscussions,
            totalReplies,
            totalViews,
            totalLikes,
            categoryStats,
            recentActivity: {
                discussions: recentDiscussions,
                replies: recentReplies
            }
        }
    });
});

// Search discussions
router.get('/search', (req, res) => {
    const { q, category } = req.query;
    
    if (!q) {
        return res.status(400).json({
            success: false,
            message: 'Search query is required'
        });
    }
    
    let searchResults = discussions.filter(d => 
        d.title.toLowerCase().includes(q.toLowerCase()) ||
        d.content.toLowerCase().includes(q.toLowerCase()) ||
        d.tags.some(tag => tag.toLowerCase().includes(q.toLowerCase()))
    );
    
    if (category && category !== 'all') {
        searchResults = searchResults.filter(d => d.category === category);
    }
    
    // Sort by relevance (simple implementation)
    searchResults.sort((a, b) => {
        const aScore = (a.title.toLowerCase().includes(q.toLowerCase()) ? 2 : 0) + 
                      (a.content.toLowerCase().includes(q.toLowerCase()) ? 1 : 0);
        const bScore = (b.title.toLowerCase().includes(q.toLowerCase()) ? 2 : 0) + 
                      (b.content.toLowerCase().includes(q.toLowerCase()) ? 1 : 0);
        return bScore - aScore;
    });
    
    res.json({
        success: true,
        discussions: searchResults,
        query: q,
        total: searchResults.length
    });
});

// Get user's discussions
router.get('/user/:userId/discussions', (req, res) => {
    const { userId } = req.params;
    
    const userDiscussions = discussions.filter(d => d.authorId === userId);
    
    res.json({
        success: true,
        discussions: userDiscussions,
        total: userDiscussions.length
    });
});

// Report discussion (for moderation)
router.post('/discussion/:id/report', (req, res) => {
    const { id } = req.params;
    const { reason, reporterId } = req.body;
    
    const discussion = discussions.find(d => d.id === parseInt(id));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    // In a real app, this would be stored in a reports table
    console.log(`Discussion ${id} reported by ${reporterId} for: ${reason}`);
    
    res.json({
        success: true,
        message: 'Report submitted successfully'
    });
});

// Report reply (for moderation)
router.post('/reply/:discussionId/:replyId/report', (req, res) => {
    const { discussionId, replyId } = req.params;
    const { reason, reporterId } = req.body;
    
    const discussion = discussions.find(d => d.id === parseInt(discussionId));
    
    if (!discussion) {
        return res.status(404).json({
            success: false,
            message: 'Discussion not found'
        });
    }
    
    const reply = discussion.replies.find(r => r.id === parseInt(replyId));
    
    if (!reply) {
        return res.status(404).json({
            success: false,
            message: 'Reply not found'
        });
    }
    
    // In a real app, this would be stored in a reports table
    console.log(`Reply ${replyId} in discussion ${discussionId} reported by ${reporterId} for: ${reason}`);
    
    res.json({
        success: true,
        message: 'Report submitted successfully'
    });
});

module.exports = router;
