import { NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { getConversation, createConversation } from "@/lib/db/redis";
import { errorResponse, successResponse } from "@/lib/api/errors";

export async function GET(): Promise<NextResponse> {
    try {
        const sessionId = await getSessionId();
        let conversation = await getConversation(sessionId);
        const isNew = !conversation;

        if (!conversation) {
            conversation = await createConversation(sessionId);
        }

        return successResponse({
            conversation,
            isNew,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
