import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { Interview } from './components/Interview.js'

const username = process.env['USER'] || process.env['LOGNAME'] || process.env['USERNAME'] || ''

export default function App() {

	// This will be used to track whether an interview is active
	const [interviewActive, setInterviewActive] = useState(false)

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green">
			<Text>
				Hello, <Text color="green">{username}</Text>, Welcome to MockingBird!
			</Text>
			<Text>Press 's' to start an interview. Press 'q' to quit.</Text>
			<Interview />
		</Box>
	);
}
