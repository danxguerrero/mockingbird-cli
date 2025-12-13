import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';

export const CodeInput = ({ onSubmit, focus = false }) => {
    const [code, setCode] = useState('');

    const handleSubmit = () => {
        if (code.trim() && onSubmit) {
            onSubmit(code);
        }
    };

    return (
        <Box flexDirection="column">
            <TextInput
                value={code}
                onChange={setCode}
                onSubmit={handleSubmit}
                placeholder="Enter your code here..."
                showCursor={focus}
                focus={focus}
            />
            <Text color="gray">Press Enter to submit, Ctrl+C to cancel</Text>
        </Box>
    );
};
