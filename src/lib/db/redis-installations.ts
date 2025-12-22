import { redis, getJSON, setJSON } from "./redis-client";
import { z } from "zod";

export interface SlackInstallation {
    teamId: string;
    teamName: string;
    botToken: string;
    botUserId: string;
    installedAt: string;
    installedBy: string;
    defaultChannelId?: string;
}

const SlackInstallationSchema = z.object({
    teamId: z.string(),
    teamName: z.string(),
    botToken: z.string(),
    botUserId: z.string(),
    installedAt: z.string(),
    installedBy: z.string(),
    defaultChannelId: z.string().optional(),
});

export async function saveInstallation(sessionId: string, installation: SlackInstallation): Promise<void> {
    await setJSON(`slack:installation:${sessionId}`, installation);
    await redis.set(`slack:team:${installation.teamId}`, sessionId);
}

export async function getInstallation(sessionId: string): Promise<SlackInstallation | null> {
    return getJSON(`slack:installation:${sessionId}`, SlackInstallationSchema);
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
