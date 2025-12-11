import { createHook } from "workflow";
import { WebClient } from "@slack/web-api";
import { buildApprovalBlocks } from "@/lib/slack/blocks";
import { getInstallation, savePendingApproval } from "@/lib/db/redis";
import { isSlackAPIError } from "@/lib/slack/types";
import type { ApprovalRequest, ApprovalResult } from "./types";

async function getSlackInstallation(sessionId: string) {
    "use step";
    return await getInstallation(sessionId);
}

async function saveApprovalHook(hookToken: string, sessionId: string, channelId: string) {
    "use step";
    await savePendingApproval(hookToken, {
        sessionId,
        channelId,
    });
}

async function sendSlackApprovalMessage(botToken: string, channelId: string, request: ApprovalRequest, hookToken: string) {
    "use step";

    const client = new WebClient(botToken);
    const blocks = buildApprovalBlocks(request, hookToken);

    try {
        await client.chat.postMessage({
            channel: channelId,
            text: `New ${request.type} request: ${request.title}`,
            blocks,
        });
    } catch (error: unknown) {
        if (isSlackAPIError(error) && error.data?.error === "not_in_channel") {
            try {
                await client.conversations.join({ channel: channelId });

                await client.chat.postMessage({
                    channel: channelId,
                    text: `New ${request.type} request: ${request.title}`,
                    blocks,
                });
            } catch (joinError: unknown) {
                console.error("Failed to join channel or post message:", joinError);
                const errorMessage = joinError instanceof Error ? joinError.message : "Unknown error";
                throw new Error(
                    `Unable to send message to channel. The bot may need to be manually invited to the channel. Error: ${errorMessage}`
                );
            }
        } else {
            throw error;
        }
    }
}

export async function requestApproval(request: ApprovalRequest, sessionId: string): Promise<ApprovalResult> {
    "use workflow";

    const installation = await getSlackInstallation(sessionId);
    if (!installation || !installation.defaultChannelId) {
        throw new Error("Slack not connected or no channel selected");
    }

    const hook = createHook<ApprovalResult>();
    const hookToken = hook.token;

    await saveApprovalHook(hookToken, sessionId, installation.defaultChannelId);

    await sendSlackApprovalMessage(installation.botToken, installation.defaultChannelId, request, hookToken);

    const result = await hook;

    return result;
}
