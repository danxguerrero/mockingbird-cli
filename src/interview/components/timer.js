import React, { useState, useEffect } from 'react';
import { Text } from 'ink';

export const Timer = ({ isActive, onTimerComplete }) => {
    const [timeRemaining, setTimeRemaining] = useState(2700); // 10 seconds for testing

    useEffect(() => {
        if (isActive) {
            // Reset timer to 10 seconds when interview starts
            setTimeRemaining(2700);

            // Set up interval for countdown
            const timerInterval = setInterval(() => {
                setTimeRemaining(prevTime => {
                    if (prevTime <= 1) {
                        // Timer completed
                        clearInterval(timerInterval);
                        // Use setTimeout to defer callback execution until after render cycle
                        if (onTimerComplete) {
                            setTimeout(() => {
                                onTimerComplete();
                            }, 0);
                        }
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);

            // Clean up interval on component unmount or when isActive changes
            return () => clearInterval(timerInterval);
        }
    }, [isActive, onTimerComplete]);

    // Format time as MM:SS
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return <Text>Time: {formatTime(timeRemaining)}</Text>;
};
