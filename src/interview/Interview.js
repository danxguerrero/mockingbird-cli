
import {Box, Text, useInput} from 'ink';
import {useState, useEffect} from 'react';
import {CodeInput} from './components/CodeInput.js';
import {Chat} from './components/Chat.js';
import {questionData} from '../data/questions.js';

const API_BASE_URL = process.env.MOCKINGBIRD_API_URL || 'http://localhost:3000';

export const Interview = () => {
	const [submittedCode, setSubmittedCode] = useState('');
	const [currentCode, setCurrentCode] = useState('');
	const [isLoadingAI, setIsLoadingAI] = useState(false);
	const [messages, setMessages] = useState([
		{
			role: 'assistant',
			content:
				'Hello! I am MockingBird, your AI interviewer. If you need any additional information about the coding question, please let me know. Otherwise you may begin coding and talk me through your thought process.',
		},
	]);
	const [navigationMode, setNavigationMode] = useState(false);
	const [focusArea, setFocusArea] = useState('chat'); // 'code', 'chat', or 'scroll'
	const [currentQuestion, setCurrentQuestion] = useState(null);

	// Load and set a random question when component mounts
	useEffect(() => {
		if (questionData && questionData.length > 0) {
			const randomIndex = Math.floor(Math.random() * questionData.length);
			setCurrentQuestion(questionData[randomIndex]);
		}
	}, []);



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

	const handleChatMessage = async message => {
		// Add user message to chat
		const updatedMessages = [
			...messages,
			{
				role: 'user',
				content: message,
			},
		];
		setMessages(updatedMessages);

		// Set loading state
		setIsLoadingAI(true);

		try {
			// Prepare context
			const context = {
				submittedCode: currentCode.trim() || submittedCode,
				question: currentQuestion ? currentQuestion.description : '',
				interviewTime: 'ongoing'
			};

			const response = await fetch(`${API_BASE_URL}/api/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					messages: updatedMessages,
					context: context
				}),
			});

			if (!response.ok) {
				throw new Error(`API request failed: ${response.status}`);
			}

			const data = await response.json();

			// Add AI response to chat
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: data.response,
				},
			]);
		} catch (error) {
			console.error('Chat API error:', error);

			// Add error message to chat
			setMessages(prev => [
				...prev,
				{
					role: 'assistant',
					content: `Sorry, I'm having trouble connecting right now. Please try again later. (Error: ${error.message})`,
				},
			]);
		} finally {
			setIsLoadingAI(false);
		}
	};

	return (
		<Box flexDirection="column" height={50}>
			<Box flexDirection="row" height="50%">
			<Box
				width="25%"
				borderStyle="round"
				borderColor="green"
				flexDirection="column"
			>
				{currentQuestion ? (
					<>
						<Text wrap="wrap">
							{currentQuestion.description}
						</Text>
						<Text color="cyan" marginTop={1}>
							Difficulty: {currentQuestion.difficulty}
						</Text>
					</>
				) : (
					<Text>Loading question...</Text>
				)}
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
					currentCode={currentCode}
					onCodeChange={setCurrentCode}
				/>
			</Box>
		</Box>
		<Box
			width="100%"
			borderStyle="round"
			borderColor={
				focusArea === 'chat' && !navigationMode ? 'yellow' : 'green'
			}
			height="50%"
		>
			<Chat
				onSubmit={handleChatMessage}
				messages={messages}
				focusArea={focusArea}
				navigationMode={navigationMode}
				isLoadingAI={isLoadingAI}
			/>
		</Box>
	</Box>
	);
};
