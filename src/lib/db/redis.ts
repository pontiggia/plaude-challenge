import { Redis } from "@upstash/redis";
import { config } from "@/lib/config";
import type { Conversation, ConversationState, PendingAction, Message } from "@/lib/types";

export const redis = new Redis({
    url: config.redis.url,
    token: config.redis.token,
});

export interface SlackInstallation {
    teamId: string;
    teamName: string;
    botToken: string;
    botUserId: string;
    installedAt: string;
    installedBy: string;
    defaultChannelId?: string;
}

export async function saveInstallation(sessionId: string, installation: SlackInstallation): Promise<void> {
    await redis.set(`slack:installation:${sessionId}`, JSON.stringify(installation));
    await redis.set(`slack:team:${installation.teamId}`, sessionId);
}

export async function getInstallation(sessionId: string): Promise<SlackInstallation | null> {
    const data = await redis.get(`slack:installation:${sessionId}`);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : (data as SlackInstallation);
}

export async function getSessionByTeamId(teamId: string): Promise<string | null> {
    return await redis.get(`slack:team:${teamId}`);
}

export async function deleteInstallation(sessionId: string): Promise<void> {
    const installation = await getInstallation(sessionId);
    if (installation) {
        await redis.del(`slack:team:${installation.teamId}`);
    }
    await redis.del(`slack:installation:${sessionId}`);
}

export async function savePendingApproval(
    hookToken: string,
    data: {
        sessionId: string;
        channelId: string;
        messageTs?: string;
    }
): Promise<void> {
    const key = `approval:${hookToken}`;
    await redis.set(key, JSON.stringify(data), { ex: 86400 }); // Expire in 24h
}

export async function getPendingApproval(hookToken: string): Promise<{
    sessionId: string;
    channelId: string;
    messageTs?: string;
} | null> {
    const key = `approval:${hookToken}`;
    const data = await redis.get(key);
    if (!data) return null;
    return typeof data === "string" ? JSON.parse(data) : (data as { sessionId: string; channelId: string; messageTs?: string });
}

export async function deletePendingApproval(hookToken: string): Promise<void> {
    await redis.del(`approval:${hookToken}`);
}

const CONVERSATION_TTL_SECONDS = 1800; // 30 minutes
const MAX_MESSAGES_PER_CONVERSATION = 100;
const PENDING_ACTION_TTL_SECONDS = 300; // 5 minutes

function getConversationKey(sessionId: string): string {
    return `conversation:${sessionId}`;
}

export async function getConversation(sessionId: string): Promise<Conversation | null> {
    const key = getConversationKey(sessionId);
    const data = await redis.get(key);
    if (!data) return null;

    const conversation = typeof data === "string" ? JSON.parse(data) : (data as Conversation);

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

    await redis.set(key, JSON.stringify(conversation), { ex: CONVERSATION_TTL_SECONDS });
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

export async function setPendingAction(sessionId: string, action: Omit<PendingAction, "createdAt" | "expiresAt">): Promise<void> {
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
