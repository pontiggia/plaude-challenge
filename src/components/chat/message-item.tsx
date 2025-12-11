"use client";

import type { Message } from "@/lib/types";
import { MessageAvatar } from "./message-avatar";
import { MessageBubble } from "./message-bubble";
import { ToolInvocationBadge } from "./tool-invocation-badge";

interface MessageItemProps {
    message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            <MessageAvatar isUser={isUser} />
            <MessageBubble content={message.content} isUser={isUser}>
                {message.toolInvocation && (
                    <ToolInvocationBadge
                        name={message.toolInvocation.name}
                        status={message.toolInvocation.status}
                    />
                )}
            </MessageBubble>
        </div>
    );
}
