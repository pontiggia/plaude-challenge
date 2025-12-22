"use client";

import { useState, useCallback, useRef } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageList } from "./message-list";
import { InputForm } from "./input-form";
import { ChatHeader } from "./chat-header";
import { useTypingDetector } from "@/hooks/use-typing-detector";
import { useMessageBatcher } from "@/hooks/use-message-batcher";
import type { Message } from "@/lib/types";

interface UserMessageWithBatch extends Message {
    batchIndex: number;
}

interface ChatContainerProps {
    teamName: string;
    sessionId: string;
}

export function ChatContainer({ teamName }: ChatContainerProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    // All user messages (shown individually, never combined)
    const [userMessages, setUserMessages] = useState<UserMessageWithBatch[]>([]);
    // Current batch index - increments after each AI response
    const batchIndexRef = useRef(0);
    const { messages, sendMessage } = useChat();

    const { typingState, handleKeyDown } = useTypingDetector();

    const handleBatchReady = useCallback(
        async (batchedMessages: string[]) => {
            if (batchedMessages.length === 0) return;

            // Capture current batch index before incrementing
            const currentBatch = batchIndexRef.current;

            setIsLoading(true);
            try {
                // Combine batched messages for the AI to process together
                const combinedMessage = batchedMessages.join("\n");
                await sendMessage({ text: combinedMessage });
                // Increment batch index for next group of messages
                batchIndexRef.current = currentBatch + 1;
            } finally {
                setIsLoading(false);
            }
        },
        [sendMessage]
    );

    // Batch messages silently - no UI indication
    const { addMessage } = useMessageBatcher(typingState, handleBatchReady);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const messageText = input.trim();
        setInput("");

        // Show message immediately in UI with current batch index
        const userMessage: UserMessageWithBatch = {
            id: crypto.randomUUID(),
            role: "user",
            content: messageText,
            createdAt: new Date(),
            batchIndex: batchIndexRef.current,
        };
        setUserMessages((prev) => [...prev, userMessage]);

        // Add to batcher for AI request (batches multiple rapid messages)
        addMessage(messageText);
    };

    // Get assistant responses grouped by their original message (before MESSAGE_BREAK split)
    // Each assistant message from useChat = one response to one batch of user messages
    const assistantResponseGroups: Message[][] = messages
        .filter((msg) => msg.role === "assistant")
        .map((msg) => {
            const textContent = msg.parts
                .filter((part) => part.type === "text")
                .map((part) => ("text" in part ? part.text : ""))
                .join("");

            const toolPart = msg.parts.find((part) => part.type === "tool-call");

            // Handle MESSAGE_BREAK for tool responses - split into multiple display messages
            if (textContent.includes("---MESSAGE_BREAK---")) {
                const parts = textContent.split("---MESSAGE_BREAK---");
                return parts
                    .map((part) => part.trim())
                    .filter((part) => part.length > 0)
                    .map((part, index) => ({
                        id: `${msg.id}-${index}`,
                        role: "assistant" as const,
                        content: part,
                        createdAt: new Date(),
                        toolInvocation:
                            index === 0 && toolPart
                                ? {
                                      name: "toolName" in toolPart ? (toolPart.toolName as string) : "unknown",
                                      status: "complete" as const,
                                  }
                                : undefined,
                    }));
            }

            // Single message response
            return [{
                id: msg.id,
                role: "assistant" as const,
                content: textContent,
                createdAt: new Date(),
                toolInvocation: toolPart
                    ? {
                          name: "toolName" in toolPart ? (toolPart.toolName as string) : "unknown",
                          status: "pending",
                      }
                    : undefined,
            }];
        });

    // Build display messages: interleave user messages with assistant responses
    const displayMessages: Message[] = [];

    // Group user messages by batch
    const userMessagesByBatch: UserMessageWithBatch[][] = [];
    for (const msg of userMessages) {
        if (!userMessagesByBatch[msg.batchIndex]) {
            userMessagesByBatch[msg.batchIndex] = [];
        }
        userMessagesByBatch[msg.batchIndex].push(msg);
    }

    // Interleave: batch 0 user msgs -> assistant response 0 (all parts) -> batch 1 user msgs -> ...
    const maxIndex = Math.max(userMessagesByBatch.length - 1, assistantResponseGroups.length - 1, -1);
    for (let i = 0; i <= maxIndex; i++) {
        // Add user messages for this batch
        if (userMessagesByBatch[i]) {
            displayMessages.push(...userMessagesByBatch[i]);
        }
        // Add all parts of assistant response for this batch
        if (assistantResponseGroups[i]) {
            displayMessages.push(...assistantResponseGroups[i]);
        }
    }

    // Show loading only when we have pending user messages without a response yet
    const pendingBatchIndex = batchIndexRef.current;
    const hasPendingMessages = userMessagesByBatch[pendingBatchIndex]?.length > 0;
    const hasResponseForPending = assistantResponseGroups.length > pendingBatchIndex;
    const showLoadingBubble = isLoading && hasPendingMessages && !hasResponseForPending;

    return (
        <div className="flex flex-col h-screen">
            <ChatHeader teamName={teamName} />
            <MessageList messages={displayMessages} isLoading={showLoadingBubble} />
            <InputForm
                input={input}
                onInputChange={setInput}
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                isLoading={isLoading}
            />
        </div>
    );
}
