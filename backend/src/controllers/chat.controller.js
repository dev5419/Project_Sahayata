const { ChatSession, ChatMessage } = require('../models/chat.model');

// Start a new chat session
exports.startSession = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user has an active session
        const activeSession = await ChatSession.findOne({
            userId: userId,
            status: 'active'
        });

        if (activeSession) {
            return res.status(200).json({
                success: true,
                message: 'Active session found',
                data: {
                    sessionId: activeSession._id,
                    sessionIdString: activeSession.sessionId,
                    startTime: activeSession.startTime
                }
            });
        }

        // Create new session
        const newSession = await ChatSession.create({
            userId: userId,
            status: 'active'
        });

        // Send welcome message
        const welcomeMessage = await ChatMessage.create({
            sessionId: newSession._id,
            sender: 'ai',
            message: 'Hello! I\'m here to support you. How are you feeling today? You can talk to me about anything that\'s on your mind.',
            messageType: 'text'
        });

        res.status(201).json({
            success: true,
            message: 'Chat session started successfully!',
            data: {
                sessionId: newSession._id,
                sessionIdString: newSession.sessionId,
                startTime: newSession.startTime,
                welcomeMessage: {
                    id: welcomeMessage._id,
                    message: welcomeMessage.message,
                    timestamp: welcomeMessage.timestamp
                }
            }
        });

    } catch (error) {
        console.error('Start chat session error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while starting chat session.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Send a message in chat session
exports.sendMessage = async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.id;

        let chatSession;

        if (sessionId) {
            // Use existing session
            chatSession = await ChatSession.findOne({
                _id: sessionId,
                userId: userId,
                status: 'active'
            });
        } else {
            // Find or create active session
            chatSession = await ChatSession.findOne({
                userId: userId,
                status: 'active'
            });

            if (!chatSession) {
                // Create new session if none exists
                chatSession = await ChatSession.create({
                    userId: userId,
                    status: 'active'
                });
            }
        }

        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found!'
            });
        }

        // Save user message
        const userMessage = await ChatMessage.create({
            sessionId: chatSession._id,
            sender: 'user',
            message: message,
            messageType: 'text'
        });

        // Check for emergency keywords
        const emergencyKeywords = process.env.EMERGENCY_KEYWORDS?.split(',') || [
            'suicide', 'self-harm', 'kill myself', 'end my life', 'die', 'death', 'hopeless', 'worthless'
        ];

        const messageLower = message.toLowerCase();
        const triggeredKeywords = emergencyKeywords.filter(keyword => 
            messageLower.includes(keyword.toLowerCase())
        );

        let aiResponse = '';
        let messageType = 'text';

        if (triggeredKeywords.length > 0) {
            // Emergency response
            await chatSession.triggerEmergency(triggeredKeywords);
            messageType = 'emergency';
            aiResponse = `I'm concerned about what you're sharing. Please know that you're not alone and help is available. 

If you're in immediate danger, please call emergency services (911) or go to the nearest emergency room.

You can also contact:
- National Suicide Prevention Lifeline: 1-800-273-8255
- Crisis Text Line: Text HOME to 741741

Would you like to talk to a human counsellor right now? I can help you connect with professional support.`;
        } else {
            // Normal AI response (simplified for demo)
            const responses = [
                "I understand how you're feeling. Can you tell me more about what's been going on?",
                "That sounds really challenging. How long have you been feeling this way?",
                "I'm here to listen. What would be most helpful for you right now?",
                "Thank you for sharing that with me. How can I best support you today?",
                "I hear you, and your feelings are valid. What do you think might help you feel better?",
                "That's a lot to be dealing with. Have you talked to anyone else about this?",
                "I appreciate you opening up to me. What's been the hardest part of this situation?",
                "You're showing real strength by reaching out. What would you like to focus on today?"
            ];
            
            aiResponse = responses[Math.floor(Math.random() * responses.length)];
        }

        // Save AI response
        const aiMessage = await ChatMessage.create({
            sessionId: chatSession._id,
            sender: 'ai',
            message: aiResponse,
            messageType: messageType
        });

        res.status(200).json({
            success: true,
            message: 'Message sent successfully!',
            data: {
                sessionId: chatSession._id,
                userMessage: {
                    id: userMessage._id,
                    message: userMessage.message,
                    timestamp: userMessage.timestamp
                },
                aiResponse: {
                    id: aiMessage._id,
                    message: aiMessage.message,
                    messageType: aiMessage.messageType,
                    timestamp: aiMessage.timestamp
                },
                emergencyTriggered: triggeredKeywords.length > 0,
                triggeredKeywords: triggeredKeywords
            }
        });

    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while sending message.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's chat sessions
exports.getUserSessions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, status } = req.query;

        const query = { userId: userId };
        if (status) query.status = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const sessions = await ChatSession.find(query)
            .sort({ startTime: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const total = await ChatSession.countDocuments(query);

        res.status(200).json({
            success: true,
            data: {
                sessions: sessions.map(session => ({
                    id: session._id,
                    sessionId: session.sessionId,
                    status: session.status,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    duration: session.duration,
                    emergencyTriggered: session.emergencyTriggered,
                    emergencyTriggeredAt: session.emergencyTriggeredAt,
                    emergencyKeywords: session.emergencyKeywords
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
        console.error('Get user sessions error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching chat sessions.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get messages for a specific session
exports.getSessionMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        // Verify session belongs to user
        const session = await ChatSession.findOne({
            _id: sessionId,
            userId: userId
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Chat session not found!'
            });
        }

        const messages = await ChatMessage.find({ sessionId: sessionId })
            .sort({ timestamp: 1 })
            .lean();

        res.status(200).json({
            success: true,
            data: {
                session: {
                    id: session._id,
                    sessionId: session.sessionId,
                    status: session.status,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    duration: session.duration,
                    emergencyTriggered: session.emergencyTriggered,
                    emergencyTriggeredAt: session.emergencyTriggeredAt,
                    emergencyKeywords: session.emergencyKeywords
                },
                messages: messages.map(message => ({
                    id: message._id,
                    sender: message.sender,
                    message: message.message,
                    messageType: message.messageType,
                    timestamp: message.timestamp,
                    metadata: message.metadata
                }))
            }
        });

    } catch (error) {
        console.error('Get session messages error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while fetching session messages.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// End a chat session
exports.endSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user.id;

        const session = await ChatSession.findOne({
            _id: sessionId,
            userId: userId,
            status: 'active'
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Active chat session not found!'
            });
        }

        await session.endSession();

        res.status(200).json({
            success: true,
            message: 'Chat session ended successfully!',
            data: {
                sessionId: session._id,
                endTime: session.endTime,
                duration: session.duration
            }
        });

    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while ending chat session.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
