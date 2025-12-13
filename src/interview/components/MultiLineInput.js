import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

export const MultiLineInput = ({ onSubmit, placeholder = '', maxHeight = 3, focus = false }) => {
    const [lines, setLines] = useState(['']);
    const [cursorY, setCursorY] = useState(0);
    const [cursorX, setCursorX] = useState(0);

    useInput((input, key) => {
        // Only handle input when focused
        if (!focus) {
            return;
        }
        // Ctrl+Enter to submit
        if (key.ctrl && key.return) {
            const message = lines.join('\n').trim();
            if (message && onSubmit) {
                onSubmit(message);
                setLines(['']);
                setCursorY(0);
                setCursorX(0);
            }
            return;
        }

        if (key.return) {
            // Enter key - submit if on last line and line is empty, otherwise create new line
            if (cursorY === lines.length - 1 && lines[cursorY].trim() === '') {
                const message = lines.join('\n').trim();
                if (message && onSubmit) {
                    onSubmit(message);
                    setLines(['']);
                    setCursorY(0);
                    setCursorX(0);
                }
            } else {
                // Create new line
                const newLines = [...lines];
                const currentLine = newLines[cursorY];
                const remainingText = currentLine.slice(cursorX);
                newLines[cursorY] = currentLine.slice(0, cursorX);
                newLines.splice(cursorY + 1, 0, remainingText);
                setLines(newLines);
                setCursorY(cursorY + 1);
                setCursorX(0);
            }
            return;
        }

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

        if (key.backspace || key.delete) {
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
        if (input && !key.ctrl && !key.meta) {
            const currentLine = lines[cursorY];
            const newLine = currentLine.slice(0, cursorX) + input + currentLine.slice(cursorX);
            const newLines = [...lines];
            newLines[cursorY] = newLine;
            setLines(newLines);
            setCursorX(cursorX + 1);
        }
    }, { isActive: focus });

    // Limit visible lines
    const visibleLines = lines.slice(0, maxHeight);
    const displayLines = visibleLines.length < lines.length 
        ? [...visibleLines, `... (${lines.length - maxHeight} more lines)`]
        : visibleLines;

    return (
        <Box flexDirection="column" minHeight={maxHeight}>
            {displayLines.map((line, index) => (
                <Box key={index} flexDirection="row">
                    <Text>
                        {index === cursorY && index < maxHeight && focus ? (
                            <>
                                {line.slice(0, cursorX)}
                                <Text inverse> </Text>
                                {line.slice(cursorX)}
                            </>
                        ) : (
                            line || (index === 0 && !focus && <Text dimColor>{placeholder}</Text>)
                        )}
                    </Text>
                </Box>
            ))}
        </Box>
    );
};

