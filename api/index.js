import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();

// Middleware
app.use(cors());
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

Respond as the interviewer. Keep your response focused and professional and as concise as possible. It should be about 3 lines long and not contain empty lines.`;

    return systemPrompt;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
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

// Feedback endpoint
app.post('/api/feedback', async (req, res) => {
    try {
        const { historyString } = req.body;

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

        const feedbackPrompt = `You are reviewing a mock technical interview that the user just had. Based on the provided chat History, write feedback on the users performance.

        The feedback should focus on the following areas:
        1. Communication - Does the candidate make clarifications, communicate their approach and explain while coding?
        2. Problem Solving - Does the candidate show they understand the problem and are able to come up with a sound approach, conduct trade-offs analysis and optimize their approach?
        3. Technical Competency - How fast and accurate is the implementation? Were there syntax errors?
        4. Testing - Was the code tested for common and corner cases? Did they self-correct bugs?

        Provide a score of 1-4 for every dimension and then sum them up into an overall score. The scoring bands should be:

        Strong hire
        Hire
        No hire
        Strong no hire

        For higher scores, give feeback on what made them great and encourage them to continue doing this or tips for improving even more.
        For lower scores, provide very brief examples of what needs improvement and how to help them improve. The overall focus is to help the user eventuall get a strong hire score.

        Chat History:
        ${historyString}`;

        // Generate feedback using official SDK
        const result = await model.generateContent(feedbackPrompt);
        const feedback = result.response.text();

        res.json({
            feedback: feedback.trim(),
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Feedback generation error:', error);
        res.status(500).json({
            error: 'Server error',
            message: 'An unexpected error occurred while generating feedback'
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
