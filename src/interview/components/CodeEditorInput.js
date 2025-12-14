import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';

export const CodeEditorInput = ({ onSubmit, focus = false, maxHeight = 8 }) => {
    const [lines, setLines] = useState(['']);
    const [cursorY, setCursorY] = useState(0);
    const [cursorX, setCursorX] = useState(0);
    const [scrollOffset, setScrollOffset] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimeoutRef = useRef(null);

    // Clear scroll timeout
    const clearScrollTimeout = () => {
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = null;
        }
    };

    // Auto-scroll to keep cursor visible
    const ensureCursorVisible = useCallback(() => {
        let newOffset = scrollOffset;

        // Cursor is above visible area
        if (cursorY < scrollOffset) {
            newOffset = cursorY;
        }
        // Cursor is below visible area
        else if (cursorY >= scrollOffset + maxHeight) {
            newOffset = cursorY - maxHeight + 1;
        }

        // Ensure offset doesn't exceed bounds
        newOffset = Math.max(0, Math.min(newOffset, Math.max(0, lines.length - maxHeight)));

        if (newOffset !== scrollOffset) {
            setScrollOffset(newOffset);
            setIsScrolling(true);
            clearScrollTimeout();
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
        }
    }, [scrollOffset, maxHeight, lines.length]);

    // Ensure cursor is visible when it changes
    useEffect(() => {
        ensureCursorVisible();
    }, [cursorY, ensureCursorVisible]);

    // Clean up timeout on unmount
    useEffect(() => {
        return () => clearScrollTimeout();
    }, []);

    useInput((input, key) => {
        // Only handle input when focused
        if (!focus) {
            return;
        }

        // Ctrl+Enter to submit
        if (key.ctrl && key.return) {
            const code = lines.join('\n').trim();
            if (code && onSubmit) {
                onSubmit(code);
                // Reset editor
                setLines(['']);
                setCursorY(0);
                setCursorX(0);
                setScrollOffset(0);
            }
            return;
        }

        // Enter key - create new line
        if (key.return) {
            const newLines = [...lines];
            const currentLine = newLines[cursorY];
            const remainingText = currentLine.slice(cursorX);
            newLines[cursorY] = currentLine.slice(0, cursorX);
            newLines.splice(cursorY + 1, 0, remainingText);
            setLines(newLines);
            setCursorY(cursorY + 1);
            setCursorX(0);
            return;
        }

        // Tab key - insert 4 spaces
        if (key.tab && !key.shift) {
            const newLines = [...lines];
            const currentLine = newLines[cursorY];
            newLines[cursorY] = currentLine.slice(0, cursorX) + '    ' + currentLine.slice(cursorX);
            setLines(newLines);
            setCursorX(cursorX + 4);
            return;
        }

        // Shift+Tab - remove 4 spaces if at beginning of line
        if (key.tab && key.shift) {
            const newLines = [...lines];
            const currentLine = newLines[cursorY];
            const leadingSpaces = currentLine.match(/^ */)[0];

            if (leadingSpaces.length >= 4) {
                newLines[cursorY] = ' '.repeat(leadingSpaces.length - 4) + currentLine.slice(leadingSpaces.length);
                setLines(newLines);
                const removed = 4;
                setCursorX(Math.max(0, cursorX - removed));
            } else if (leadingSpaces.length > 0) {
                newLines[cursorY] = currentLine.slice(leadingSpaces.length);
                setLines(newLines);
                const removed = leadingSpaces.length;
                setCursorX(Math.max(0, cursorX - removed));
            }
            return;
        }

        // Page Up/Down for scrolling
        if (key.pageUp) {
            setScrollOffset(prev => Math.max(0, prev - maxHeight));
            setIsScrolling(true);
            clearScrollTimeout();
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
            return;
        }

        if (key.pageDown) {
            setScrollOffset(prev => Math.min(Math.max(0, lines.length - maxHeight), prev + maxHeight));
            setIsScrolling(true);
            clearScrollTimeout();
            scrollTimeoutRef.current = setTimeout(() => {
                setIsScrolling(false);
            }, 1000);
            return;
        }

        // Arrow navigation
        if (key.upArrow && cursorY > 0) {
            setCursorY(cursorY - 1);
            setCursorX(Math.min(cursorX, lines[cursorY - 1].length));
            return;
        }

        if (key.downArrow && cursorY < lines.length - 1) {
            setCursorY(cursorY + 1);
            setCursorX(Math.min(cursorX, lines[cursorY + 1].length));
            return;
        }

        if (key.leftArrow && cursorX > 0) {
            setCursorX(cursorX - 1);
            return;
        }

        if (key.rightArrow && cursorX < lines[cursorY].length) {
            setCursorX(cursorX + 1);
            return;
        }

        // Backspace
        if (key.backspace) {
            const currentLine = lines[cursorY];
            if (cursorX > 0) {
                // Delete character before cursor
                const newLine = currentLine.slice(0, cursorX - 1) + currentLine.slice(cursorX);
                const newLines = [...lines];
                newLines[cursorY] = newLine;
                setLines(newLines);
                setCursorX(cursorX - 1);
            } else if (cursorY > 0) {
                // Merge with previous line
                const newLines = [...lines];
                const prevLineLength = newLines[cursorY - 1].length;
                newLines[cursorY - 1] += newLines[cursorY];
                newLines.splice(cursorY, 1);
                setLines(newLines);
                setCursorY(cursorY - 1);
                setCursorX(prevLineLength);
            }
            return;
        }

        // Regular character input
        if (input && !key.ctrl && !key.meta && !key.tab) {
            const currentLine = lines[cursorY];
            const newLine = currentLine.slice(0, cursorX) + input + currentLine.slice(cursorX);
            const newLines = [...lines];
            newLines[cursorY] = newLine;
            setLines(newLines);
            setCursorX(cursorX + 1);
        }
    }, { isActive: focus });

    // Calculate visible lines based on scroll offset
    const visibleLines = lines.slice(scrollOffset, scrollOffset + maxHeight);
    const showScrollIndicator = lines.length > maxHeight;

    return (
        <Box flexDirection="column" minHeight={maxHeight}>
            {/* Scroll indicator at top */}
            {showScrollIndicator && scrollOffset > 0 && (
                <Box paddingX={1}>
                    <Text color="gray" dimColor>
                        ↑ Scroll up ({scrollOffset} lines above)
                    </Text>
                </Box>
            )}

            {/* Code lines */}
            <Box flexDirection="column" minHeight={Math.min(maxHeight, lines.length)}>
                {visibleLines.map((line, visibleIndex) => {
                    const actualIndex = scrollOffset + visibleIndex;
                    return (
                        <Box key={actualIndex} flexDirection="row">
                            <Text>
                                {actualIndex === cursorY && focus ? (
                                    <>
                                        {line.slice(0, cursorX)}
                                        <Text inverse> </Text>
                                        {line.slice(cursorX)}
                                    </>
                                ) : (
                                    line || ' '
                                )}
                            </Text>
                        </Box>
                    );
                })}
                {/* Fill empty space if fewer lines than maxHeight */}
                {visibleLines.length < maxHeight && (
                    Array.from({ length: maxHeight - visibleLines.length }, (_, i) => (
                        <Box key={`empty-${i}`} flexDirection="row">
                            <Text> </Text>
                        </Box>
                    ))
                )}
            </Box>

            {/* Scroll indicator at bottom */}
            {showScrollIndicator && scrollOffset < lines.length - maxHeight && (
                <Box paddingX={1}>
                    <Text color="gray" dimColor>
                        ↓ Scroll down ({lines.length - scrollOffset - maxHeight} lines below)
                    </Text>
                </Box>
            )}

            {/* Status */}
            <Box paddingX={1} paddingY={0}>
                <Text color="gray" dimColor>
                    Tab: indent • Shift+Tab: unindent • Ctrl+Enter: submit
                </Text>
            </Box>
        </Box>
    );
};
