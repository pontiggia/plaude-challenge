import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getConversation, createConversation } from "@/lib/db/redis";

export async function GET() {
    try {
        const sessionId = await getSessionId();
        let conversation = await getConversation(sessionId);
        const isNew = !conversation;

        if (!conversation) {
            conversation = await createConversation(sessionId);
        }

        return NextResponse.json({
            conversation,
            isNew,
        });
    } catch (error) {
        console.error("Error fetching conversation:", error);
        return NextResponse.json({ error: "Failed to fetch conversation" }, { status: 500 });
    }
}
