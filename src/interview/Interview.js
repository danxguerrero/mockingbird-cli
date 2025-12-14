import {Box, Text, useInput} from 'ink';
import {useState, useEffect} from 'react';
import {CodeInput} from './components/CodeInput.js';
import {Chat} from './components/Chat.js';

// Embedded API key for CLI authentication (distributed with published package)
const API_KEY = 'REMOVED_FOR_SECURITY';

const API_BASE_URL = 'https://mockingbird-cli.vercel.app';

export const Interview = () => {
	const [submittedCode, setSubmittedCode] = useState('');
	const [messages, setMessages] = useState([
		{
			role: 'assistant',
			content:
				'Hello! I am MockingBird, your AI interviewer. If you need any additional information about the coding question, please let me know. Otherwise you may begin coding and talk me through your thought process.',
		},
	]);
	const [navigationMode, setNavigationMode] = useState(false);
	const [focusArea, setFocusArea] = useState('chat'); // 'code', 'chat', or 'scroll'
	const [aiResponseCount, setAiResponseCount] = useState(0);
	const [isLoading, setIsLoading] = useState(false);

	// Function to call the API
	async function callChatAPI(userMessages) {
		try {
			setIsLoading(true);

			const response = await fetch(`${API_BASE_URL}/api/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key': API_KEY
				},
				body: JSON.stringify({
					messages: userMessages,
					context: {
						submittedCode: submittedCode,
						interviewTime: '15 minutes' // Could be calculated from timer
					}
				})
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
			}

			const data = await response.json();
			return data.response;
		} catch (error) {
			console.error('API call failed:', error);
			return `Sorry, I encountered an error: ${error.message}. Please try again.`;
		} finally {
			setIsLoading(false);
		}
	}

	// Handle AI responses
	useEffect(() => {
		if (aiResponseCount > 0) {
			const fetchResponse = async () => {
				const aiResponse = await callChatAPI(messages);
				setMessages(prev => [
					...prev,
					{
						role: 'assistant',
						content: aiResponse,
					},
				]);
				setAiResponseCount(prev => prev - 1);
			};

			fetchResponse();
		}
	}, [aiResponseCount]);

	// Handle Ctrl+W to toggle navigation mode and arrow keys to switch focus
	useInput(
		(input, key) => {
			if (key.ctrl && (input === 'w' || input === 'W')) {
				const newNavMode = !navigationMode;
				setNavigationMode(newNavMode);
				return;
			}

			// In navigation mode, use arrow keys to switch focus
			if (navigationMode) {
				if (key.upArrow) {
					// Cycle: scroll -> chat -> code -> scroll
					if (focusArea === 'code') {
						setFocusArea('scroll');
					} else if (focusArea === 'chat') {
						setFocusArea('code');
					} else if (focusArea === 'scroll') {
						setFocusArea('chat');
					}
					return;
				}

				if (key.downArrow) {
					// Cycle: code -> chat -> scroll -> code
					if (focusArea === 'code') {
						setFocusArea('chat');
					} else if (focusArea === 'chat') {
						setFocusArea('scroll');
					} else if (focusArea === 'scroll') {
						setFocusArea('code');
					}
					return;
				}
			}
		},
		{isActive: true},
	);

	const handleCodeSubmit = code => {
		setSubmittedCode(code);
	};

	const handleChatMessage = message => {
		// Add user message to chat
		setMessages(prev => [
			...prev,
			{
				role: 'user',
				content: message,
			},
		]);

		// Increment response counter to trigger AI response after a delay
		setAiResponseCount(prev => prev + 1);
	};

	return (
		<Box flexDirection="column" height="100%">
			<Box flexDirection="row" flexGrow={1}>
				<Box
					width="25%"
					borderStyle="round"
					borderColor="green"
					flexDirection="column"
				>
					<Text>Question here</Text>
					{navigationMode && (
						<Text color="yellow">Nav: {focusArea} | Press Ctrl+W to exit</Text>
					)}
				</Box>
				<Box
					width="75%"
					borderStyle="round"
					borderColor={
						focusArea === 'code' && !navigationMode ? 'yellow' : 'green'
					}
				>
					<CodeInput
						onSubmit={handleCodeSubmit}
						focus={focusArea === 'code' && !navigationMode}
					/>
				</Box>
			</Box>
			<Box
				width="100%"
				borderStyle="round"
				borderColor={
					focusArea === 'chat' && !navigationMode ? 'yellow' : 'green'
				}
				marginTop={1}
				height={30}
			>
				<Chat
					onSubmit={handleChatMessage}
					messages={messages}
					focusArea={focusArea}
					navigationMode={navigationMode}
				/>
			</Box>
		</Box>
	);
};
