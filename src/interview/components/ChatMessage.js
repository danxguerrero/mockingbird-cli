import React from 'react';
import {Box, Text} from 'ink';

export const ChatMessage = ({message, role}) => {
	const isUser = role === 'user';

	return (
		<Box
			flexDirection="row"
			justifyContent={isUser ? 'flex-end' : 'flex-start'}
			width="100%"
			marginBottom={1}
			paddingX={1}
			minWidth={0}
			flexShrink={0}
		>
			<Box width="50%" minWidth={0} flexDirection="column">
				<Box flexDirection="row" marginBottom={0}>
					<Text color={isUser ? 'cyan' : 'magenta'} bold>
						{isUser ? '👤 You' : '🤖 AI'}:
					</Text>
				</Box>
				<Box paddingLeft={2} minWidth={0} width="100%">
					<Text wrap="wrap" color={isUser ? 'white' : 'gray'}>
						{message.content}
					</Text>
				</Box>
			</Box>
		</Box>
	);
};
