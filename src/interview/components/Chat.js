import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useInput } from 'ink';
import { MultiLineInput } from './MultiLineInput.js';
import { ChatMessage } from './ChatMessage.js';

export const Chat = ({ onSubmit, messages = [], focusArea = 'chat', navigationMode = false }) => {
    const [scrollOffset, setScrollOffset] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const maxVisibleMessages = 4; // Number of messages visible at once (adjusted for actual terminal space)
    const scrollTimeoutRef = useRef(null);
    const isChatFocused = focusArea === 'chat' && !navigationMode;
    const isScrollFocused = focusArea === 'scroll';

    // Auto-scroll to bottom when new messages arrive (only if not manually scrolling or actively scrolling)
    useEffect(() => {
        setScrollOffset(prev => {
            const maxOffset = Math.max(0, messages.length - maxVisibleMessages);
            if (messages.length <= maxVisibleMessages) return 0;
            const clampedPrev = Math.min(Math.max(0, prev), maxOffset);
            if (!isScrolling && !isScrollFocused) return maxOffset;
            return clampedPrev;
        });
    }, [messages.length, isScrolling, isScrollFocused]);

    // Handle keyboard scrolling when scroll area is focused
    useInput((input, key) => {
        // Only handle scroll keys when scroll area is focused
        if (!isScrollFocused) {
            return;
        }

        // Don't handle scroll keys in navigation mode to avoid conflicts
        if (navigationMode) {
            return;
        }

        if (key.upArrow) {
            if (scrollOffset > 0) {
                setScrollOffset(prev => Math.max(0, prev - 1));
                setIsScrolling(true);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                }, 1000);
            }
            return;
        }

        if (key.downArrow) {
            const maxOffset = Math.max(0, messages.length - maxVisibleMessages);
            if (scrollOffset < maxOffset) {
                setScrollOffset(prev => Math.min(maxOffset, prev + 1));
                setIsScrolling(true);
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                }, 1000);
            }
            return;
        }

        // Page up/down for faster scrolling
        if (key.pageUp) {
            setScrollOffset(prev => Math.max(0, prev - maxVisibleMessages));
            setIsScrolling(true);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
            return;
        }

        if (key.pageDown) {
            const maxOffset = Math.max(0, messages.length - maxVisibleMessages);
            setScrollOffset(prev => Math.min(maxOffset, prev + maxVisibleMessages));
            setIsScrolling(true);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
            return;
        }
    }, { isActive: isScrollFocused });

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    // Get visible messages based on scroll offset
    const visibleMessages = messages.slice(scrollOffset, scrollOffset + maxVisibleMessages);

    return (
        <Box flexDirection="column" height="100%" width="100%">
            {/* Chat History - Scrollable Area */}
            <Box 
                flexDirection="column" 
                flexGrow={1}
                minHeight={0}
                overflow="hidden"
                paddingY={1}
                width="100%"
            >
                {visibleMessages.length === 0 ? (
                    <Box flexGrow={1} justifyContent="center" alignItems="center">
                        <Text color="gray" dimColor>
                            No messages yet. Start a conversation!
                        </Text>
                    </Box>
                ) : (
                    <>
                        {visibleMessages.map((msg, index) => (
                            <ChatMessage
                                key={`${scrollOffset}-${index}-${msg.role}`}
                                message={msg}
                                role={msg.role}
                            />
                        ))}
                        {messages.length > maxVisibleMessages && (
                            <Box paddingX={1} paddingY={0}>
                                <Text color={isScrollFocused ? 'yellow' : 'gray'} dimColor={!isScrollFocused}>
                                    {isScrollFocused && '[SCROLL MODE] '}
                                    {scrollOffset > 0 && `↑ Scroll up (${scrollOffset} messages above)`}
                                    {scrollOffset > 0 && scrollOffset < messages.length - maxVisibleMessages && ' | '}
                                    {scrollOffset < messages.length - maxVisibleMessages && `↓ Scroll down (${messages.length - scrollOffset - maxVisibleMessages} messages below)`}
                                </Text>
                            </Box>
                        )}
                    </>
                )}
            </Box>

            {/* Message Input */}
            <Box 
                borderTop={true} 
                borderStyle="single"
                borderColor="gray"
                paddingX={1}
                paddingY={1}
                flexDirection="column"
                flexShrink={0}
                width="100%"
            >
                <Box flexDirection="row" alignItems="flex-start" width="100%">
                    <Text color="green">💬 </Text>
                    <Box flexGrow={1} minWidth={0}>
                        <MultiLineInput
                            onSubmit={onSubmit}
                            placeholder="Type a message... (Enter for new line, Ctrl+Enter or Enter on empty line to send)"
                            maxHeight={3}
                            focus={isChatFocused}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};
