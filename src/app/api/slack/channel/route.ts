import { NextRequest, NextResponse } from "next/server";
import { getInstallation, saveInstallation } from "@/lib/db/redis";
import { getSessionId } from "@/lib/session";

export async function POST(request: NextRequest) {
    const { channelId } = await request.json();
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation) {
        return NextResponse.json({ error: "Not connected to Slack" }, { status: 401 });
    }

    await saveInstallation(sessionId, {
        ...installation,
        defaultChannelId: channelId,
    });

    return NextResponse.json({ success: true });
}

export async function GET() {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation) {
        return NextResponse.json({ error: "Not connected" }, { status: 401 });
    }

    return NextResponse.json({
        channelId: installation.defaultChannelId,
        teamName: installation.teamName,
    });
}
