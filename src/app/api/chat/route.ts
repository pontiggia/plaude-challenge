import { NextRequest } from "next/server";
import { convertToModelMessages, createUIMessageStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { start } from "workflow/api";
import { agentWorkflow } from "@/workflows/agent/workflow";
import { getSessionId } from "@/lib/session";
import { getInstallation, getOrCreateConversation, saveConversation, setConversationState } from "@/lib/db/redis";
import type { Message } from "@/lib/types";

export async function POST(request: NextRequest) {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation || !installation.defaultChannelId) {
        return new Response("Slack not connected", { status: 401 });
    }

    const { messages }: { messages: UIMessage[] } = await request.json();

    // Load existing conversation for context
    const conversation = await getOrCreateConversation(sessionId);

    // Update state to processing
    await setConversationState(sessionId, "PROCESSING");

    // Find new messages that aren't already in the conversation
    const existingIds = new Set(conversation.messages.map((m) => m.id));
    const newMessages = messages.filter((m) => !existingIds.has(m.id));

    // Add new user messages to conversation
    if (newMessages.length > 0) {
        const messagesToAdd: Message[] = newMessages.map((m) => {
            const textContent = m.parts
                .filter((part): part is { type: "text"; text: string } => part.type === "text")
                .map((part) => part.text)
                .join("");

            return {
                id: m.id,
                role: m.role as "user" | "assistant",
                content: textContent,
                createdAt: new Date(),
            };
        });
        conversation.messages.push(...messagesToAdd);
        await saveConversation(conversation);
    }

    const modelMessages = convertToModelMessages(messages);

    // Pass sessionId to workflow so it can access the right Slack installation
    const run = await start(agentWorkflow, [modelMessages, sessionId]);

    // Split the stream - one for the response, one for state tracking
    const [responseStream, trackingStream] = run.readable.tee();

    // Reset state after response completes (fire and forget)
    trackingStream
        .pipeTo(new WritableStream())
        .finally(async () => {
            await setConversationState(sessionId, "IDLE");
        })
        .catch(() => {
            // Ignore errors from the background tracking
        });

    return createUIMessageStreamResponse({
        stream: responseStream,
    });
}
