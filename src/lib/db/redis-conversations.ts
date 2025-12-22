import { redis, getJSON, setJSON } from "./redis-client";
import { z } from "zod";
import type { Conversation, Message, ConversationState } from "@/lib/types";
import { CONVERSATION_TTL_SECONDS, MAX_MESSAGES_PER_CONVERSATION, PENDING_ACTION_TTL_SECONDS } from "@/lib/constants";

const MessageSchema = z.object({
    id: z.string(),
    role: z.enum(["user", "assistant"]),
    content: z.string(),
    createdAt: z.coerce.date(),
    toolInvocation: z
        .object({
            name: z.string(),
            status: z.enum(["pending", "complete"]),
        })
        .optional(),
});

const PendingActionSchema = z.object({
    type: z.enum(["refund", "escalation", "cancellation"]),
    details: z.record(z.string(), z.unknown()),
    confirmationPrompt: z.string(),
    createdAt: z.number(),
    expiresAt: z.number(),
});

const ConversationSchema = z.object({
    sessionId: z.string(),
    messages: z.array(MessageSchema),
    state: z.enum(["IDLE", "PROCESSING", "WAITING_FOR_RESPONSE", "WAITING_FOR_CONFIRMATION"]),
    pendingAction: PendingActionSchema.nullable(),
    collectedData: z.record(z.string(), z.unknown()),
    createdAt: z.number(),
    lastActivityAt: z.number(),
});

function getConversationKey(sessionId: string): string {
    return `conversation:${sessionId}`;
}

export async function getConversation(sessionId: string): Promise<Conversation | null> {
    const key = getConversationKey(sessionId);
    const conversation = await getJSON(key, ConversationSchema);

    if (!conversation) return null;

    if (conversation.pendingAction && conversation.pendingAction.expiresAt < Date.now()) {
        conversation.pendingAction = null;
        conversation.state = "IDLE";
        await saveConversation(conversation);
    }

    await redis.expire(key, CONVERSATION_TTL_SECONDS);

    return conversation;
}

export async function saveConversation(conversation: Conversation): Promise<void> {
    const key = getConversationKey(conversation.sessionId);

    if (conversation.messages.length > MAX_MESSAGES_PER_CONVERSATION) {
        conversation.messages = conversation.messages.slice(-MAX_MESSAGES_PER_CONVERSATION);
    }

    conversation.lastActivityAt = Date.now();

    await setJSON(key, conversation, { ex: CONVERSATION_TTL_SECONDS });
}

export async function createConversation(sessionId: string): Promise<Conversation> {
    const now = Date.now();
    const conversation: Conversation = {
        sessionId,
        messages: [],
        state: "IDLE",
        pendingAction: null,
        collectedData: {},
        createdAt: now,
        lastActivityAt: now,
    };

    await saveConversation(conversation);
    return conversation;
}

export async function getOrCreateConversation(sessionId: string): Promise<Conversation> {
    const existing = await getConversation(sessionId);
    if (existing) return existing;
    return createConversation(sessionId);
}

export async function addMessagesToConversation(sessionId: string, messages: Message[]): Promise<Conversation> {
    const conversation = await getOrCreateConversation(sessionId);
    conversation.messages.push(...messages);
    await saveConversation(conversation);
    return conversation;
}

export async function setConversationState(sessionId: string, state: ConversationState): Promise<void> {
    const conversation = await getOrCreateConversation(sessionId);
    conversation.state = state;
    await saveConversation(conversation);
}

export async function setPendingAction(
    sessionId: string,
    action: Omit<NonNullable<Conversation["pendingAction"]>, "createdAt" | "expiresAt">
): Promise<void> {
    const conversation = await getOrCreateConversation(sessionId);
    const now = Date.now();
    conversation.pendingAction = {
        ...action,
        createdAt: now,
        expiresAt: now + PENDING_ACTION_TTL_SECONDS * 1000,
    };
    conversation.state = "WAITING_FOR_CONFIRMATION";
    await saveConversation(conversation);
}

export async function clearPendingAction(sessionId: string): Promise<void> {
    const conversation = await getOrCreateConversation(sessionId);
    conversation.pendingAction = null;
    conversation.state = "IDLE";
    await saveConversation(conversation);
}

export async function updateCollectedData(sessionId: string, data: Record<string, unknown>): Promise<void> {
    const conversation = await getOrCreateConversation(sessionId);
    conversation.collectedData = { ...conversation.collectedData, ...data };
    await saveConversation(conversation);
}

export async function deleteConversation(sessionId: string): Promise<void> {
    await redis.del(getConversationKey(sessionId));
}
