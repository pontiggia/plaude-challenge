import * as React from "react";
import type { Message, Conversation, ConversationState } from "@/lib/types";

interface PersistedChatState {
    messages: Message[];
    isLoading: boolean;
    isStreaming: boolean;
    error: Error | null;
    conversationState: ConversationState;
}

interface StreamingMessage {
    id: string;
    role: "assistant";
    content: string;
    createdAt: Date;
}

export function usePersistedChat(sessionId: string): {
    state: PersistedChatState;
    sendMessages: (messages: string[]) => Promise<void>;
    reload: () => Promise<void>;
} {
    const [state, setState] = React.useState<PersistedChatState>({
        messages: [],
        isLoading: true,
        isStreaming: false,
        error: null,
        conversationState: "IDLE",
    });

    const [streamingMessage, setStreamingMessage] = React.useState<StreamingMessage | null>(null);

    // Load existing conversation on mount
    const loadConversation = React.useCallback(async () => {
        try {
            setState((prev) => ({ ...prev, isLoading: true, error: null }));
            const response = await fetch("/api/chat/session");
            if (!response.ok) {
                throw new Error("Failed to load conversation");
            }
            const data: { conversation: Conversation; isNew: boolean } = await response.json();
            setState((prev) => ({
                ...prev,
                messages: data.conversation.messages,
                conversationState: data.conversation.state,
                isLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: error instanceof Error ? error : new Error("Unknown error"),
                isLoading: false,
            }));
        }
    }, []);

    React.useEffect(() => {
        loadConversation();
    }, [loadConversation]);

    const sendMessages = React.useCallback(
        async (batchedMessages: string[]) => {
            // Create user messages from batched input
            const newUserMessages: Message[] = batchedMessages.map((content) => ({
                id: crypto.randomUUID(),
                role: "user" as const,
                content,
                createdAt: new Date(),
                isBatched: batchedMessages.length > 1,
                batchId: batchedMessages.length > 1 ? crypto.randomUUID() : undefined,
            }));

            // Add user messages to state immediately
            setState((prev) => ({
                ...prev,
                messages: [...prev.messages, ...newUserMessages],
                isStreaming: true,
                conversationState: "PROCESSING",
            }));

            // Prepare all messages for API (combine existing + new)
            const allMessages = [...state.messages, ...newUserMessages].map((m) => ({
                id: m.id,
                role: m.role,
                content: m.content,
            }));

            try {
                const response = await fetch("/api/chat", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ messages: allMessages }),
                });

                if (!response.ok) {
                    throw new Error("Failed to send message");
                }

                // Handle streaming response
                const reader = response.body?.getReader();
                if (!reader) {
                    throw new Error("No response stream");
                }

                const streamingId = crypto.randomUUID();
                let fullContent = "";

                setStreamingMessage({
                    id: streamingId,
                    role: "assistant",
                    content: "",
                    createdAt: new Date(),
                });

                const decoder = new TextDecoder();

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    const text = decoder.decode(value);
                    // Parse streaming format - extract text content
                    const matches = text.match(/0:"([^"]*)"/g);
                    if (matches) {
                        for (const match of matches) {
                            const content = match.slice(3, -1).replace(/\\n/g, "\n").replace(/\\"/g, '"');
                            fullContent += content;
                            setStreamingMessage((prev) => (prev ? { ...prev, content: fullContent } : null));
                        }
                    }
                }

                // Finalize the assistant message
                const finalMessage: Message = {
                    id: streamingId,
                    role: "assistant",
                    content: fullContent,
                    createdAt: new Date(),
                };

                setState((prev) => ({
                    ...prev,
                    messages: [...prev.messages, finalMessage],
                    isStreaming: false,
                    conversationState: "IDLE",
                }));
                setStreamingMessage(null);
            } catch (error) {
                setState((prev) => ({
                    ...prev,
                    error: error instanceof Error ? error : new Error("Unknown error"),
                    isStreaming: false,
                    conversationState: "IDLE",
                }));
                setStreamingMessage(null);
            }
        },
        [state.messages]
    );

    // Combine regular messages with streaming message for display
    const displayMessages = React.useMemo(() => {
        if (streamingMessage) {
            return [...state.messages, streamingMessage];
        }
        return state.messages;
    }, [state.messages, streamingMessage]);

    return {
        state: {
            ...state,
            messages: displayMessages,
        },
        sendMessages,
        reload: loadConversation,
    };
}
