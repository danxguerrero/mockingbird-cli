import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Interview } from './components/Interview.js'

const username = process.env['USER'] || process.env['LOGNAME'] || process.env['USERNAME'] || ''

export default function App() {

	// This will be used to track whether an interview is active
	const [interviewActive, setInterviewActive] = useState(false)

	useInput((input, key) => {
		if (input === 's' && !interviewActive) {
			setInterviewActive(true)
		} else if (input === 'q' && !interviewActive) {
			process.exit(0)
		} 
 	})

	return (
		<Box flexDirection="column" borderStyle="round" borderColor="green">
			<Text>
				Hello, <Text color="green">{username}</Text>, Welcome to MockingBird!
			</Text>
			
			{interviewActive ? <Interview /> : <Text>Press <Text color="green">'s'</Text> to start an interview. Press <Text color="green">'q'</Text> to quit.</Text>}
		</Box>
	);
}
