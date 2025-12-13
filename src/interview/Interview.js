import { Box, Text, useInput } from 'ink';
import { useState } from 'react';
import { CodeInput } from './components/CodeInput.js';
import { Chat } from './components/Chat.js';

export const Interview = () => {
    const [submittedCode, setSubmittedCode] = useState('');
    const [messages, setMessages] = useState([]);
    const [navigationMode, setNavigationMode] = useState(false);
    const [focusArea, setFocusArea] = useState('code'); // 'code', 'chat', or 'scroll'

    // Handle Ctrl+W to toggle navigation mode and arrow keys to switch focus
    useInput((input, key) => {
        if (key.ctrl && (input === 'w' || input === 'W')) {
            setNavigationMode(prev => !prev);
            return;
        }

        // In navigation mode, use arrow keys to switch focus
        if (navigationMode) {
            if (key.upArrow) {
                // Cycle: scroll -> chat -> code -> scroll
                if (focusArea === 'code') {
                    setFocusArea('scroll');
                } else if (focusArea === 'chat') {
                    setFocusArea('code');
                } else if (focusArea === 'scroll') {
                    setFocusArea('chat');
                }
                return;
            }

            if (key.downArrow) {
                // Cycle: code -> chat -> scroll -> code
                if (focusArea === 'code') {
                    setFocusArea('chat');
                } else if (focusArea === 'chat') {
                    setFocusArea('scroll');
                } else if (focusArea === 'scroll') {
                    setFocusArea('code');
                }
                return;
            }
        }
    }, { isActive: true });

    const handleCodeSubmit = (code) => {
        setSubmittedCode(code);
    };

    const handleChatMessage = (message) => {
        // Add user message to chat
        setMessages(prev => [...prev, {
            role: 'user',
            content: message
        }]);
        
        // TODO: Send message to AI and get response
        // For now, just echo back
        setTimeout(() => {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'This is a placeholder response. AI integration coming soon!'
            }]);
        }, 500);
    };

    return (
        <Box flexDirection="column" height="100%">
            <Box flexDirection="row" flexGrow={1}>
                <Box width="25%" borderStyle="round" borderColor="green">
                    <Text>Question here</Text>
                    {navigationMode && (
                        <Text color="yellow">
                            Nav: {focusArea} | Press Ctrl+W to exit
                        </Text>
                    )}
                </Box>
                <Box
                    width="75%"
                    borderStyle="round"
                    borderColor={focusArea === 'code' && !navigationMode ? 'yellow' : 'green'}
                >
                    <CodeInput
                        onSubmit={handleCodeSubmit}
                        focus={focusArea === 'code' && !navigationMode}
                    />
                </Box>
            </Box>
            <Box
                width="100%"
                borderStyle="round"
                borderColor={focusArea === 'chat' && !navigationMode ? 'yellow' : 'green'}
                marginTop={1}
                height={15}
            >
                <Chat 
                    onSubmit={handleChatMessage} 
                    messages={messages}
                    focusArea={focusArea}
                    navigationMode={navigationMode}
                />
            </Box>
        </Box>
    );
}
