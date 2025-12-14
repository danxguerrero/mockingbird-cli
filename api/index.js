import 'dotenv/config';
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';

const app = express();

// Middleware
app.use(express.json({ limit: '10mb' }));

// Initialize Gemini AI
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
let genAI = null;
let model = null;

// Initialize on startup
if (GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (error) {
        console.error('Failed to initialize Gemini:', error);
    }
}

// API Key Configuration (required via environment variable for security)
const MOCKINGBIRD_API_KEY = process.env.MOCKINGBIRD_API_KEY;

if (!MOCKINGBIRD_API_KEY) {
    console.error('❌ MOCKINGBIRD_API_KEY environment variable is required');
    process.exit(1);
}

// API Key Authentication Middleware
function authenticateAPIKey(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
        return res.status(401).json({
            error: 'API key required',
            message: 'Please provide an API key in the x-api-key header'
        });
    }

    if (!crypto.timingSafeEqual(Buffer.from(apiKey), Buffer.from(MOCKINGBIRD_API_KEY))) {
        return res.status(401).json({
            error: 'Invalid API key',
            message: 'The provided API key is not valid'
        });
    }

    next();
}

// Rate limiting (simple in-memory implementation)
const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 30; // requests per minute per API key

function rateLimit(req, res, next) {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
    if (!apiKey) return next();

    const now = Date.now();
    const key = `rate_${apiKey}_${Math.floor(now / WINDOW_MS)}`;

    const currentCount = requestCounts.get(key) || 0;
    if (currentCount >= MAX_REQUESTS) {
        return res.status(429).json({
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            retryAfter: WINDOW_MS - (now % WINDOW_MS)
        });
    }

    requestCounts.set(key, currentCount + 1);
    next();

    // Clean up old entries (simple cleanup)
    setTimeout(() => requestCounts.delete(key), WINDOW_MS * 2);
}

function formatMessagesForGemini(messages, context = {}) {
    // Validate and sanitize messages array
    const validMessages = (Array.isArray(messages) ? messages : [])
        .filter(msg => msg && typeof msg === 'object' && msg.role != null && msg.content != null)
        .map(msg => ({
            role: String(msg.role),
            content: String(msg.content)
        }));

    const systemPrompt = `You are MockingBird, an AI technical interviewer conducting a coding interview.

Context:
- Interview has been active for ${context.interviewTime || 'some time'}
${context.submittedCode ? `- Candidate submitted code: ${context.submittedCode}` : ''}

Guidelines:
- Ask relevant coding questions and follow-ups
- Be encouraging but thorough
- Focus on algorithms, data structures, and best practices
- Ask for code explanations when appropriate
- Be conversational and engaging

Recent conversation:
${validMessages.map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`).join('\n')}

Respond as the interviewer. Keep your response focused and professional.`;

    return systemPrompt;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint (secured)
app.post('/api/chat', authenticateAPIKey, rateLimit, async (req, res) => {
    try {
        const { messages = [], context = {} } = req.body;

        if (!GEMINI_API_KEY) {
            return res.status(500).json({
                error: 'API key not configured',
                message: 'Gemini API key is missing from environment variables'
            });
        }

        if (!model) {
            return res.status(500).json({
                error: 'AI service not initialized',
                message: 'Gemini model failed to initialize'
            });
        }

        // Format messages for Gemini
        const prompt = formatMessagesForGemini(messages, context);

        // Generate response using official SDK
        const result = await model.generateContent(prompt);
        const aiResponse = result.response.text();

        res.json({
            response: aiResponse.trim(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'An unexpected error occurred while processing your request'
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: 'Something went wrong on our end'
    });
});

// Vercel expects the app to be the default export
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`MockingBird API running on http://localhost:${port}`);
        console.log('Health check: http://localhost:' + port + '/api/health');
        console.log('Chat endpoint: http://localhost:' + port + '/api/chat');
    });
}
