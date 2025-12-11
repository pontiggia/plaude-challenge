import { WebClient } from "@slack/web-api";
import { getInstallation } from "@/lib/db/redis";
import { getSessionId } from "@/lib/session";

export async function getSlackClient(): Promise<WebClient | null> {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation) {
        return null;
    }

    return new WebClient(installation.botToken);
}

export async function getSlackClientByToken(token: string): Promise<WebClient> {
    return new WebClient(token);
}
