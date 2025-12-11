"use client";

import { cn } from "@/lib/utils";

interface MessageBubbleProps {
    content: string;
    isUser: boolean;
    children?: React.ReactNode;
}

export function MessageBubble({ content, isUser, children }: MessageBubbleProps) {
    return (
        <div
            className={cn(
                "max-w-[80%] rounded-2xl px-4 py-3",
                isUser
                    ? "bg-primary text-primary-foreground rounded-tr-md"
                    : "bg-muted text-foreground rounded-tl-md"
            )}
        >
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
            {children}
        </div>
    );
}
