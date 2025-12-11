"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { MessageList } from "./message-list";
import { InputForm } from "./input-form";
import { ChatHeader } from "./chat-header";
import type { Message } from "@/lib/types";

interface ChatContainerProps {
    teamName: string;
    sessionId: string;
}

export function ChatContainer({ teamName }: ChatContainerProps) {
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { messages, sendMessage } = useChat();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const messageText = input.trim();
        setInput("");
        setIsLoading(true);

        try {
            await sendMessage({ text: messageText });
        } finally {
            setIsLoading(false);
        }
    };

    const formattedMessages: Message[] = messages.flatMap((msg) => {
        const textContent = msg.parts
            .filter((part) => part.type === "text")
            .map((part) => ("text" in part ? part.text : ""))
            .join("");

        const toolPart = msg.parts.find((part) => part.type === "tool-call");

        if (msg.role === "assistant" && textContent.includes("---MESSAGE_BREAK---")) {
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
                                  status: "pending" as const,
                              }
                            : undefined,
                }));
        }

        return {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: textContent,
            createdAt: new Date(),
            toolInvocation: toolPart
                ? {
                      name: "toolName" in toolPart ? (toolPart.toolName as string) : "unknown",
                      status: "pending",
                  }
                : undefined,
        };
    });

    return (
        <div className="flex flex-col h-screen">
            <ChatHeader teamName={teamName} />
            <MessageList messages={formattedMessages} isLoading={isLoading} />
            <InputForm input={input} onInputChange={setInput} onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
}
