import { Box, Text } from 'ink';
import { useState } from 'react';
import { CodeInput } from './components/CodeInput.js';

export const Interview = () => {
    const [submittedCode, setSubmittedCode] = useState('');

    const handleCodeSubmit = (code) => {
        setSubmittedCode(code);
        // You can also add the code to chat history here
    };

    return (
        <Box flexDirection="column">
            <Box flexDirection="row">
                <Box width="25%" borderStyle="round" borderColor="green">
                    <Text>Question here</Text>
                </Box>
                <Box width="75%" borderStyle="round" borderColor="green">
                    <CodeInput onSubmit={handleCodeSubmit} />
                </Box>
            </Box>
            <Box width="100%" borderStyle="round" borderColor="green">
                <Text>Chat history here</Text>
                {submittedCode && (
                    <Box marginTop={1}>
                        <Text color="green">Submitted code:</Text>
                        <Text>{submittedCode}</Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
