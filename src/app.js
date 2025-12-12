import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Interview } from './interview/Interview.js';
import { Timer } from './interview/components/timer.js';

const username = process.env['USER'] || process.env['LOGNAME'] || process.env['USERNAME'] || '';

export default function App() {
	// This will be used to track whether an interview is active
	const [interviewActive, setInterviewActive] = useState(false);

	useInput((input, key) => {
		if (input === 's' && !interviewActive) {
			setInterviewActive(true);
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
					<Timer isActive={interviewActive} onTimerComplete={() => setInterviewActive(false)} />
				</Box>
			</Box>

			{interviewActive ? <Interview /> : <Text>Press <Text color="green">'s'</Text> to start an interview. Press <Text color="green">'q'</Text> to quit.</Text>}
		</Box>
	);
}
