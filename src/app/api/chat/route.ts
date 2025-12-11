import { NextRequest } from "next/server";
import { convertToModelMessages, createUIMessageStreamResponse } from "ai";
import type { UIMessage } from "ai";
import { start } from "workflow/api";
import { agentWorkflow } from "@/workflows/agent/workflow";
import { getSessionId } from "@/lib/session";
import { getInstallation } from "@/lib/db/redis";

export async function POST(request: NextRequest) {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation || !installation.defaultChannelId) {
        return new Response("Slack not connected", { status: 401 });
    }

    const { messages }: { messages: UIMessage[] } = await request.json();

    const modelMessages = convertToModelMessages(messages);

    // Pass sessionId to workflow so it can access the right Slack installation
    const run = await start(agentWorkflow, [modelMessages, sessionId]);

    return createUIMessageStreamResponse({
        stream: run.readable,
    });
}
