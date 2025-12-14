# MockingBird CLI

> AI-powered coding interview simulator in your terminal

MockingBird is a CLI-based coding interview simulator that connects you with an AI interviewer powered by Google's Gemini API. Practice technical interviews with real-time feedback, code editing in the terminal, and comprehensive performance evaluation.

## Features

- 🤖 **AI Interviewer**: Chat with a conversational AI interviewer
- ⌨️ **Terminal Code Editor**: Write and submit code directly in your terminal
- ⏱️ **Timed Sessions**: 45 minute interviews with automatic completion
- 📊 **AI Feedback**: Comprehensive evaluation across four key areas:
  - Communication skills
  - Problem-solving approach
  - Technical competency
  - Code testing practices
- 🎯 **Navigation**: Easy switching between chat and code areas (Ctrl+W)
- 📝 **Question Bank**: Random coding questions of varying difficulty

## Quick Start

### Clone and Setup

```bash
git clone https://github.com/danxguerrero/mockingbird-cli.git
cd mockingbird-cli
npm install
npm run build
```

### Using with Deployed API

```bash
# Run the CLI (connects to deployed API: https://mockingbird-cli.vercel.app)
node dist/cli.js
```

## Local Development Setup

To run both the CLI and API locally with your own Gemini API key:

### Prerequisites

- Node.js 18+
- Google Gemini API key

### 1. Install Dependencies

```bash
# Install CLI dependencies
npm install

# Install API dependencies
cd api
npm install
cd ..
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Your Google Gemini API key
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Start the API Server

```bash
cd api
npm run dev
# API will run on http://localhost:3000
```

### 4. Build and Run the CLI Locally

In a new terminal:

```bash
# Build the CLI
npm run build

# Run locally (connects to localhost:3000)
node dist/cli.js
```

## Usage

### Starting an Interview

```bash
node dist/cli.js
```

### Controls

- **s** - Start interview
- **q** - Quit application
- **Ctrl+W** - Enter navigation mode to switch focus
- **Arrow keys** (in navigation mode) - Switch between chat/code/scroll areas with UP and DOWN

### Interview Flow

1. Press **s** to begin
2. The AI interviewer will greet you and present a coding question
3. Use the chat interface to discuss your approach
4. Code your solution in the terminal code editor
5. Submit code when ready
6. After 45 minutes, the interview automatically ends
7. Receive AI-generated feedback on your performance

## API Configuration

### Connecting CLI to Custom API

Set the `MOCKINGBIRD_API_URL` environment variable:

```bash
# Use local API
export MOCKINGBIRD_API_URL=http://localhost:3000

# Use custom deployment
export MOCKINGBIRD_API_URL=https://mockingbird-cli.vercel.app/
```

### API Endpoints

The API provides these endpoints:

- `GET /api/health` - Health check
- `POST /api/chat` - Chat with AI interviewer
- `POST /api/feedback` - Generate interview feedback

## Development

### Building

```bash
npm run build
```

### Development Mode

```bash
npm run dev
```

## Requirements

- Node.js ≥16
- For API: Node.js ≥18
- Google Gemini API key (for local development)

## License

MIT
