import * as React from "react";

export interface TypingState {
    isTyping: boolean;
    lastTypedAt: number;
}

export function useTypingDetector(): {
    typingState: TypingState;
    handleKeyDown: (e: React.KeyboardEvent) => void;
} {
    const [lastTypedAt, setLastTypedAt] = React.useState(0);
    const [isTyping, setIsTyping] = React.useState(false);
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null);

    const isPrintableKey = React.useCallback((e: React.KeyboardEvent): boolean => {
        if (e.metaKey || e.ctrlKey || e.altKey) {
            return false;
        }

        const ignoredKeys = [
            "ArrowUp",
            "ArrowDown",
            "ArrowLeft",
            "ArrowRight",
            "Home",
            "End",
            "PageUp",
            "PageDown",
            "Tab",
            "Escape",
            "Shift",
            "Control",
            "Alt",
            "Meta",
            "CapsLock",
            "Insert",
            "F1",
            "F2",
            "F3",
            "F4",
            "F5",
            "F6",
            "F7",
            "F8",
            "F9",
            "F10",
            "F11",
            "F12",
        ];

        return !ignoredKeys.includes(e.key);
    }, []);

    React.useEffect(() => {
        intervalRef.current = setInterval(() => {
            const timeSinceLastKeyPress = Date.now() - lastTypedAt;
            const shouldBeTyping = lastTypedAt > 0 && timeSinceLastKeyPress < 2000;

            setIsTyping((currentIsTyping) => {
                if (currentIsTyping !== shouldBeTyping) {
                    return shouldBeTyping;
                }
                return currentIsTyping;
            });
        }, 100);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [lastTypedAt]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (isPrintableKey(e)) {
                setLastTypedAt(Date.now());
                setIsTyping(true);
            }
        },
        [isPrintableKey]
    );

    const typingState: TypingState = React.useMemo(
        () => ({
            isTyping,
            lastTypedAt,
        }),
        [isTyping, lastTypedAt]
    );

    return {
        typingState,
        handleKeyDown,
    };
}
