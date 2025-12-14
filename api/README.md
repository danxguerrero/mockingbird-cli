# MockingBird API

Serverless API service for MockingBird CLI that provides Gemini AI-powered interview responses.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment variables:**

   ```bash
   cp .env.example .env
   # Edit .env with your Gemini API key
   ```

3. **For local development:**
   ```bash
   npm run dev
   # API will run on http://localhost:3000
   ```

## Endpoints

### POST `/api/chat`

Generates AI responses for coding interviews.

**Request body:**

```json
{
	"messages": [
		{"role": "user", "content": "Hello, let's start the interview"},
		{"role": "assistant", "content": "Welcome! Let's begin..."}
	],
	"context": {
		"submittedCode": "// user's code here",
		"interviewTime": "5 minutes"
	}
}
```

**Response:**

```json
{
	"response": "AI-generated interview response...",
	"timestamp": "2025-12-13T20:42:00.000Z"
}
```

### GET `/api/health`

Health check endpoint.

## Deployment

### Vercel (Recommended)

```bash
npm i -g vercel
vercel --prod
# Set GEMINI_API_KEY in Vercel dashboard or CLI
```

## Environment Variables

- `GEMINI_API_KEY`: Your Google Gemini API key (required)
- `NODE_ENV`: Set to 'production' for Vercel deployment
