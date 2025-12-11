import { Redis } from "@upstash/redis";
import { config } from "@/lib/config";

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

// Store installation by session ID
export async function saveInstallation(sessionId: string, installation: SlackInstallation): Promise<void> {
    await redis.set(`slack:installation:${sessionId}`, JSON.stringify(installation));
    // Also index by team ID for webhook lookups
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

// Store pending approval hook tokens
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
