import { NextResponse } from "next/server";
import { getSlackClient } from "@/lib/slack/client";
import { errorResponse, successResponse } from "@/lib/api/errors";
import { AuthenticationError, SlackError } from "@/lib/errors/custom-errors";
import { logger } from "@/lib/logger";

export async function GET(): Promise<NextResponse> {
    try {
        const client = await getSlackClient();

        if (!client) {
            throw new AuthenticationError("Not connected to Slack");
        }

        const publicChannels = await client.conversations.list({
            types: "public_channel",
            exclude_archived: true,
            limit: 100,
        });

        const privateChannels = await client.conversations.list({
            types: "private_channel",
            exclude_archived: true,
            limit: 100,
        });

        const channels = [...(publicChannels.channels || []), ...(privateChannels.channels || [])].map((ch) => ({
            id: ch.id,
            name: ch.name,
            isPrivate: ch.is_private,
        }));

        return successResponse({ channels });
    } catch (error) {
        logger.error("Failed to fetch channels", { error });
        if (error instanceof AuthenticationError) {
            return errorResponse(error);
        }
        return errorResponse(new SlackError("Failed to fetch channels"));
    }
}
