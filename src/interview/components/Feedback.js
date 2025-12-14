import React from 'react';
import { Box, Text, useInput } from 'ink';

export const Feedback = ({ feedback, onClose }) => {
	// Handle key press to close feedback
	useInput((input, key) => {
		if (input === 'q' || key.return) {
			onClose();
		}
	});

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green" padding={1}>
			<Box marginBottom={1}>
				<Text color="blue" bold>
					🎯 Interview Feedback
				</Text>
			</Box>
			<Box flexDirection="column" maxHeight={20} overflow="hidden">
				{feedback.split('\n').map((line, index) => (
					<Text key={index} wrap="wrap">
						{line}
					</Text>
				))}
			</Box>
			<Box marginTop={1} justifyContent="center">
				<Text color="gray">
					Press <Text color="green">'q'</Text> or <Text color="green">'Enter'</Text> to return to start
				</Text>
			</Box>
		</Box>
	);
};
