"use client";

import { useEffect, useRef } from "react";
import { MessageItem } from "./message-item";
import { LoadingBubble } from "./loading-bubble";
import type { Message } from "@/lib/types";
import { EmptyState } from "@/components/ui/empty-state";
import { SuggestionChip } from "@/components/ui/suggestion-chip";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
                {messages.length === 0 && (
                    <EmptyState
                        title="How can I help you today?"
                        description="Ask for a refund, help with high-value orders, or any other support requests. Actions requiring approval will be sent to your Slack workspace."
                    >
                        <div className="flex flex-wrap gap-2 justify-center">
                            <SuggestionChip>Request a refund</SuggestionChip>
                            <SuggestionChip>High-value order help</SuggestionChip>
                            <SuggestionChip>General inquiry</SuggestionChip>
                        </div>
                    </EmptyState>
                )}

                {messages.map((message) => (
                    <MessageItem key={message.id} message={message} />
                ))}

                {isLoading && <LoadingBubble />}

                <div ref={bottomRef} />
            </div>
        </div>
    );
}
