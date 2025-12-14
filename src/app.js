import React, { useState, useCallback, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { Interview } from './interview/Interview.js';
import { Timer } from './interview/components/timer.js';
import { Feedback } from './interview/components/Feedback.js';

const API_BASE_URL = process.env.MOCKINGBIRD_API_URL || 'http://localhost:3000';

const username = process.env['USER'] || process.env['LOGNAME'] || process.env['USERNAME'] || '';

export default function App() {
	// This will be used to track interview state
	const [interviewActive, setInterviewActive] = useState(false);
	const [interviewEnded, setInterviewEnded] = useState(false);
	const [feedback, setFeedback] = useState(null);
	const [generatingFeedback, setGeneratingFeedback] = useState(false);
	const interviewRef = useRef();

	const handleTimerComplete = useCallback(async () => {
		// Immediately mark interview as ended
		setInterviewEnded(true);

		if (interviewRef.current) {
			setGeneratingFeedback(true);

			try {
				// Get chat history from the Interview component
				const historyString = interviewRef.current.generateFeedbackHistoryString();

				// Call feedback API
				const response = await fetch(`${API_BASE_URL}/api/feedback`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						historyString: historyString
					}),
				});

				if (!response.ok) {
					throw new Error(`API request failed: ${response.status}`);
				}

				const data = await response.json();
				setFeedback(data.feedback);
			} catch (error) {
				console.error('Feedback generation error:', error);
				setFeedback('Sorry, I was unable to generate feedback. Please check your connection and try again.');
			} finally {
				setGeneratingFeedback(false);
				// End the interview completely once feedback is ready
				setInterviewActive(false);
			}
		} else {
			// Fallback if no interview ref
			setInterviewActive(false);
		}
	}, []);

	const handleFeedbackClose = useCallback(() => {
		setFeedback(null);
	}, []);

	const startNewInterview = useCallback(() => {
		setInterviewActive(false);
		setInterviewEnded(false);
		setFeedback(null);
		setGeneratingFeedback(false);
	}, []);

	const handleStartInterview = useCallback(() => {
		setInterviewActive(true);
		setInterviewEnded(false);
		setFeedback(null);
		setGeneratingFeedback(false);
	}, []);

	useInput((input, key) => {
		if (input === 's' && !interviewActive) {
			handleStartInterview();
		} else if (input === 'q' && !interviewActive) {
			process.exit(0);
		}
	});

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green">
			<Box flexDirection="row" justifyContent="space-between">
				<Text>
					Hello, <Text color="green">{username}</Text>, Welcome to MockingBird!
				</Text>
				<Box>
					<Timer isActive={interviewActive} onTimerComplete={handleTimerComplete} />
				</Box>
			</Box>

			{interviewActive && !interviewEnded ? (
				<Interview ref={interviewRef} />
			) : interviewActive && interviewEnded ? (
				generatingFeedback ? (
					<Box flexDirection="column" alignItems="center" justifyContent="center" paddingY={4}>
						<Text color="blue" bold>
							⏰ Time's Up! Interview Complete
						</Text>
						<Text color="yellow" marginTop={1}>
							🎯 Generating AI feedback...
						</Text>
					</Box>
				) : feedback ? (
					<Feedback feedback={feedback} onClose={startNewInterview} />
				) : (
					<Box flexDirection="column" alignItems="center" justifyContent="center" paddingY={4}>
						<Text color="red">Something went wrong with feedback generation.</Text>
						<Text color="gray" marginTop={1}>Press <Text color="green">'q'</Text> to quit.</Text>
					</Box>
				)
			) : feedback ? (
				<Feedback feedback={feedback} onClose={startNewInterview} />
			) : (
				<Text>Press <Text color="green">'s'</Text> to start an interview. Press <Text color="green">'q'</Text> to quit.</Text>
			)}
		</Box>
	);
}
