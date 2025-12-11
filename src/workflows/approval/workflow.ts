import { createHook } from "workflow";
import { WebClient } from "@slack/web-api";
import { buildApprovalBlocks } from "@/lib/slack/blocks";
import { getInstallation, savePendingApproval } from "@/lib/db/redis";
import type { ApprovalRequest, ApprovalResult } from "./types";

export async function requestApproval(request: ApprovalRequest, sessionId: string): Promise<ApprovalResult> {
    "use step";

    const installation = await getInstallation(sessionId);
    if (!installation || !installation.defaultChannelId) {
        throw new Error("Slack not connected or no channel selected");
    }

    const hookToken = `approval:${Date.now()}:${Math.random().toString(36).slice(2)}`;

    const hook = createHook<ApprovalResult>({
        token: hookToken,
    });

    await savePendingApproval(hookToken, {
        sessionId,
        channelId: installation.defaultChannelId,
    });

    const client = new WebClient(installation.botToken);
    const blocks = buildApprovalBlocks(request, hookToken);

    await client.chat.postMessage({
        channel: installation.defaultChannelId,
        text: `New ${request.type} request: ${request.title}`,
        blocks,
    });

    const result = await hook;

    return result;
}
