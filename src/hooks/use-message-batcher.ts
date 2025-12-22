import * as React from "react";
import type { TypingState } from "./use-typing-detector";

interface BatcherConfig {
    rapidFireWindowMs: number;
    typingWaitMs: number;
    maxBatchSize: number;
}

const DEFAULT_CONFIG: BatcherConfig = {
    rapidFireWindowMs: 500,
    typingWaitMs: 2000,
    maxBatchSize: 10,
};

export function useMessageBatcher(
    typingState: TypingState,
    onBatchReady: (messages: string[]) => void,
    config?: Partial<BatcherConfig>
): {
    addMessage: (message: string) => void;
    pendingCount: number;
    isWaiting: boolean;
} {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const pendingMessagesRef = React.useRef<string[]>([]);
    const flushTimerRef = React.useRef<NodeJS.Timeout | null>(null);
    const typingStateRef = React.useRef(typingState);
    const [pendingCount, setPendingCount] = React.useState(0);
    const [isWaiting, setIsWaiting] = React.useState(false);

    React.useEffect(() => {
        typingStateRef.current = typingState;
    }, [typingState]);

    const flushBatch = React.useCallback(() => {
        if (pendingMessagesRef.current.length > 0) {
            const messages = [...pendingMessagesRef.current];
            pendingMessagesRef.current = [];
            setPendingCount(0);
            setIsWaiting(false);
            onBatchReady(messages);
        }
    }, [onBatchReady]);

    const scheduleFlush = React.useCallback(() => {
        if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
        }

        const checkAndFlush = () => {
            // Check current typing state via ref
            if (!typingStateRef.current.isTyping) {
                flushBatch();
            } else {
                // User is still typing, reschedule with typing wait time
                flushTimerRef.current = setTimeout(checkAndFlush, finalConfig.typingWaitMs);
            }
        };

        // Calculate initial delay based on typing state
        const delay = typingStateRef.current.isTyping ? finalConfig.typingWaitMs : finalConfig.rapidFireWindowMs;

        flushTimerRef.current = setTimeout(checkAndFlush, delay);
    }, [finalConfig.typingWaitMs, finalConfig.rapidFireWindowMs, flushBatch]);

    const addMessage = React.useCallback(
        (message: string) => {
            pendingMessagesRef.current.push(message);
            setPendingCount(pendingMessagesRef.current.length);
            setIsWaiting(true);

            // Force flush if we've reached max batch size
            if (pendingMessagesRef.current.length >= finalConfig.maxBatchSize) {
                flushBatch();
                return;
            }

            scheduleFlush();
        },
        [finalConfig.maxBatchSize, flushBatch, scheduleFlush]
    );

    // Effect to watch typing state changes
    React.useEffect(() => {
        if (!typingState.isTyping && pendingMessagesRef.current.length > 0) {
            // User stopped typing, schedule flush with rapid-fire window
            scheduleFlush();
        }
    }, [typingState.isTyping, scheduleFlush]);

    // Cleanup on unmount
    React.useEffect(() => {
        return () => {
            if (flushTimerRef.current) {
                clearTimeout(flushTimerRef.current);
            }
        };
    }, []);

    return {
        addMessage,
        pendingCount,
        isWaiting,
    };
}
