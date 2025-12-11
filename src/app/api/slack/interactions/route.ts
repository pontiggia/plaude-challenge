import { NextRequest, NextResponse } from "next/server";
import { resumeHook } from "workflow/api";
import { WebClient } from "@slack/web-api";
import { verifySlackRequest } from "@/lib/slack/verify";
import { buildApprovalResponseBlocks } from "@/lib/slack/blocks";
import { getInstallation, getPendingApproval, deletePendingApproval, getSessionByTeamId } from "@/lib/db/redis";
import { config } from "@/lib/config";
import type { ApprovalResult } from "@/workflows/approval/types";

export async function POST(request: NextRequest) {
    const body = await request.text();
    const signature = request.headers.get("x-slack-signature") || "";
    const timestamp = request.headers.get("x-slack-request-timestamp") || "";

    if (!verifySlackRequest(config.slack.signing_secret, signature, timestamp, body)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(new URLSearchParams(body).get("payload") || "{}");

    if (payload.type === "block_actions") {
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
                throw new Error("Approval not found or expired");
            }

            const installation = await getInstallation(pendingApproval.sessionId);
            if (!installation) {
                throw new Error("Installation not found");
            }

            await resumeHook(hookToken, result);

            await deletePendingApproval(hookToken);

            const client = new WebClient(installation.botToken);
            const originalMessage = payload.message;
            const originalTitle = originalMessage.blocks[1]?.text?.text || "Request";

            await client.chat.update({
                channel: payload.channel.id,
                ts: originalMessage.ts,
                blocks: buildApprovalResponseBlocks(originalTitle, result.approved, user.id, comment),
                text: `${result.approved ? "Approved" : "Denied"} by ${user.username}`,
            });

            return NextResponse.json({ ok: true });
        } catch (error) {
            console.error("Failed to process approval:", error);

            try {
                const sessionId = await getSessionByTeamId(teamId);
                if (sessionId) {
                    const installation = await getInstallation(sessionId);
                    if (installation) {
                        const client = new WebClient(installation.botToken);
                        await client.chat.postEphemeral({
                            channel: payload.channel.id,
                            user: user.id,
                            text: "⚠️ Failed to process this approval. The request may have expired or already been handled.",
                        });
                    }
                }
            } catch (e) {
                // Ignore notification errors
            }

            return NextResponse.json({ error: "Failed to process" }, { status: 500 });
        }
    }

    return NextResponse.json({ ok: true });
}
