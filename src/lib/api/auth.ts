import { getSessionId } from "@/lib/session";
import { getInstallation, type SlackInstallation } from "@/lib/db/redis";
import { AuthenticationError, NotConnectedError } from "@/lib/errors/custom-errors";

export interface AuthenticatedContext {
    sessionId: string;
    installation: SlackInstallation;
}

export async function getAuthenticatedContext(): Promise<AuthenticatedContext> {
    const sessionId = await getSessionId();

    if (!sessionId) {
        throw new AuthenticationError("No session found");
    }

    const installation = await getInstallation(sessionId);

    if (!installation) {
        throw new NotConnectedError("Slack workspace not connected");
    }

    return { sessionId, installation };
}
