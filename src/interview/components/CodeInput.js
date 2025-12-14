import React from 'react';
import { Box, Text } from 'ink';
import { CodeEditorInput } from './CodeEditorInput.js';

export const CodeInput = ({ onSubmit, focus = false }) => {
    return (
        <Box flexDirection="column">
            <CodeEditorInput
                onSubmit={onSubmit}
                focus={focus}
                maxHeight={6}
            />
            <Text color="gray">Press Ctrl+W to enter Navigation Mode</Text>
        </Box>
    );
};
