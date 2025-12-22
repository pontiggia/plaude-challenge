import { NextRequest, NextResponse } from "next/server";
import { saveInstallation } from "@/lib/db/redis";
import { getAuthenticatedContext } from "@/lib/api/auth";
import { errorResponse, successResponse } from "@/lib/api/errors";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { channelId } = await request.json();
        const { sessionId, installation } = await getAuthenticatedContext();

        await saveInstallation(sessionId, {
            ...installation,
            defaultChannelId: channelId,
        });

        return successResponse({ success: true });
    } catch (error) {
        return errorResponse(error);
    }
}

export async function GET(): Promise<NextResponse> {
    try {
        const { installation } = await getAuthenticatedContext();

        return successResponse({
            channelId: installation.defaultChannelId,
            teamName: installation.teamName,
        });
    } catch (error) {
        return errorResponse(error);
    }
}
