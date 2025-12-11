import { NextResponse } from "next/server";
import { getSlackClient } from "@/lib/slack/client";

export async function GET() {
    const client = await getSlackClient();

    if (!client) {
        return NextResponse.json({ error: "Not connected to Slack" }, { status: 401 });
    }

    try {
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

        return NextResponse.json({ channels });
    } catch (error) {
        console.error("Failed to fetch channels:", error);
        return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
    }
}
