const express = require('express');
const router = express.Router();

// AI Chat session management
let chatSessions = new Map();

// Start a new chat session
router.post('/start', (req, res) => {
    const { userId } = req.body;
    const sessionId = `session_${Date.now()}_${userId}`;
    
    chatSessions.set(sessionId, {
        userId,
        messages: [],
        startTime: new Date(),
        lastActivity: new Date()
    });
    
    res.json({
        success: true,
        sessionId,
        message: 'Chat session started'
    });
});

// Send message to AI companion
router.post('/message', (req, res) => {
    const { sessionId, message, userId } = req.body;
    
    if (!chatSessions.has(sessionId)) {
        return res.status(404).json({
            success: false,
            message: 'Chat session not found'
        });
    }
    
    const session = chatSessions.get(sessionId);
    session.lastActivity = new Date();
    
    // Add user message
    session.messages.push({
        type: 'user',
        content: message,
        timestamp: new Date()
    });
    
    // Generate AI response (simplified for demo)
    const aiResponse = generateAIResponse(message);
    
    // Add AI response
    session.messages.push({
        type: 'ai',
        content: aiResponse,
        timestamp: new Date()
    });
    
    res.json({
        success: true,
        response: aiResponse,
        sessionId
    });
});

// Get chat history
router.get('/history/:sessionId', (req, res) => {
    const { sessionId } = req.params;
    
    if (!chatSessions.has(sessionId)) {
        return res.status(404).json({
            success: false,
            message: 'Chat session not found'
        });
    }
    
    const session = chatSessions.get(sessionId);
    res.json({
        success: true,
        messages: session.messages
    });
});

// End chat session
router.post('/end', (req, res) => {
    const { sessionId } = req.body;
    
    if (chatSessions.has(sessionId)) {
        chatSessions.delete(sessionId);
    }
    
    res.json({
        success: true,
        message: 'Chat session ended'
    });
});

// Emergency detection endpoint
router.post('/emergency-check', (req, res) => {
    const { message } = req.body;
    
    const emergencyKeywords = [
        'suicide', 'kill myself', 'want to die', 'end my life', 'self-harm', 
        'hurt myself', 'no reason to live', 'better off dead', 'give up',
        'can\'t take it anymore', 'tired of living'
    ];
    
    const lowerMessage = message.toLowerCase();
    const isEmergency = emergencyKeywords.some(keyword => lowerMessage.includes(keyword));
    
    res.json({
        success: true,
        isEmergency,
        emergencyLevel: isEmergency ? 'high' : 'low'
    });
});

// Simple AI response generation
function generateAIResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety')) {
        return "I understand that anxiety can be really overwhelming. Let's try a simple breathing exercise together: Take a deep breath in for 4 counts, hold for 4, then breathe out for 4. Repeat this a few times. Would you like to talk more about what's causing your anxiety?";
    }
    
    if (lowerMessage.includes('breathing')) {
        return "Here's a calming breathing technique: 1) Sit comfortably and close your eyes. 2) Breathe in slowly through your nose for 4 seconds. 3) Hold your breath for 4 seconds. 4) Exhale slowly through your mouth for 6 seconds. 5) Repeat 5-10 times. How does that feel?";
    }
    
    if (lowerMessage.includes('sleep') || lowerMessage.includes('insomnia')) {
        return "Sleep issues are really common among students. Try creating a bedtime routine: turn off screens an hour before bed, read a book, and practice relaxation techniques. Would you like some specific tips for better sleep hygiene?";
    }
    
    if (lowerMessage.includes('overwhelmed') || lowerMessage.includes('stress')) {
        return "It sounds like you're dealing with a lot right now. Remember, it's okay to take breaks and ask for help. Let's break this down - what's the most pressing thing you need to address first?";
    }
    
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone')) {
        return "Feeling lonely is really difficult, and it's more common than you might think. Have you considered reaching out to classmates or joining a study group? Sometimes small connections can make a big difference. Would you like to talk about ways to build more social connections?";
    }
    
    if (lowerMessage.includes('relax')) {
        return "Let's try a quick relaxation exercise: Tense all your muscles for 5 seconds, then release them completely. Notice how your body feels when it's relaxed. You can also try progressive muscle relaxation - would you like me to guide you through that?";
    }
    
    // Default responses
    const defaultResponses = [
        "I hear you, and I'm here to listen. Can you tell me more about how you're feeling?",
        "That sounds really challenging. What do you think would be most helpful right now?",
        "I appreciate you sharing that with me. How long have you been feeling this way?",
        "Thank you for opening up. What would you like to focus on today?",
        "I'm here to support you. What's on your mind?"
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
}

module.exports = router;
