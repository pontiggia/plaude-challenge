"use client";

import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

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
            <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                <Markdown>{content}</Markdown>
            </div>
            {children}
        </div>
    );
}
