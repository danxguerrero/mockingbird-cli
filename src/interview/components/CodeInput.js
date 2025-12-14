import React from 'react';
import { Box, Text } from 'ink';
import { CodeEditorInput } from './CodeEditorInput.js';

export const CodeInput = ({ onSubmit, focus = false, currentCode = '', onCodeChange = () => {} }) => {
    return (
        <Box flexDirection="column">
            <CodeEditorInput
                onSubmit={onSubmit}
                focus={focus}
                maxHeight={6}
                currentCode={currentCode}
                onCodeChange={onCodeChange}
            />
            <Text color="gray">Press Ctrl+W to enter Navigation Mode</Text>
        </Box>
    );
};
