import { NextRequest, NextResponse } from "next/server";
import { resumeHook } from "workflow/api";
import { WebClient } from "@slack/web-api";
import { verifySlackRequest } from "@/lib/slack/verify";
import { buildApprovalResponseBlocks } from "@/lib/slack/blocks";
import { getInstallation, getPendingApproval, deletePendingApproval, getSessionByTeamId } from "@/lib/db/redis";
import { config } from "@/lib/config";
import { isBlockActionsPayload, type SlackInteractionPayload } from "@/lib/slack/types";
import type { ApprovalResult } from "@/workflows/approval/types";
import { logger } from "@/lib/logger";
import { errorResponse } from "@/lib/api/errors";
import { AuthenticationError } from "@/lib/errors/custom-errors";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = await request.text();
    const signature = request.headers.get("x-slack-signature") || "";
    const timestamp = request.headers.get("x-slack-request-timestamp") || "";

    if (!verifySlackRequest(config.slack.signing_secret, signature, timestamp, body)) {
        logger.warn("Invalid Slack signature in interactions endpoint");
        return errorResponse(new AuthenticationError("Invalid signature"));
    }

    const payload: SlackInteractionPayload = JSON.parse(new URLSearchParams(body).get("payload") || "{}");

    if (isBlockActionsPayload(payload)) {
        const action = payload.actions[0];
        const hookToken = action.value;
        const actionId = action.action_id;
        const user = payload.user;
        const teamId = payload.team.id;

        const commentBlock = payload.state?.values?.comment_block?.comment_input;
        const comment = commentBlock?.value || undefined;

        const result: ApprovalResult = {
            approved: actionId === "approve",
            approvedBy: user.username,
            comment,
            timestamp: new Date(),
        };

        try {
            const pendingApproval = await getPendingApproval(hookToken);
            if (!pendingApproval) {
                return NextResponse.json({ ok: true });
            }

            const installation = await getInstallation(pendingApproval.sessionId);
            if (!installation) {
                throw new Error("Installation not found");
            }

            await deletePendingApproval(hookToken);

            await resumeHook(hookToken, result);

            const client = new WebClient(installation.botToken);
            const originalMessage = payload.message;
            const originalBlocks = originalMessage.blocks;

            await client.chat.update({
                channel: payload.channel.id,
                ts: originalMessage.ts,
                blocks: buildApprovalResponseBlocks(originalBlocks, result.approved, user.id, comment),
                text: `${result.approved ? "Approved" : "Denied"} by ${user.username}`,
            });

            return NextResponse.json({ ok: true });
        } catch (error: unknown) {
            logger.error("Failed to process approval", { error, teamId, hookToken });

            try {
                const sessionId = await getSessionByTeamId(teamId);
                if (sessionId) {
                    const installation = await getInstallation(sessionId);
                    if (installation) {
                        const client = new WebClient(installation.botToken);
                        await client.chat.postEphemeral({
                            channel: payload.channel.id,
                            user: user.id,
                            text: "⚠️ Failed to process this approval. Please try again or contact support.",
                        });
                    }
                }
            } catch (notificationError) {
                logger.warn("Failed to send error notification to user", { notificationError });
            }

            return errorResponse(error);
        }
    }

    return NextResponse.json({ ok: true });
}
