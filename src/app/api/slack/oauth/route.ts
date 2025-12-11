import { NextRequest, NextResponse } from "next/server";
import { getSessionId, setSessionCookie } from "@/lib/session";
import { config } from "@/lib/config";

export async function GET(_request: NextRequest) {
    const sessionId = await getSessionId();

    await setSessionCookie(sessionId);

    const scopes = ["chat:write", "channels:read", "groups:read", "users:read"];

    const params = new URLSearchParams({
        client_id: config.slack.client_id,
        scope: scopes.join(","),
        redirect_uri: `${config.app.slack_redirect_url}/api/slack/callback`,
        state: sessionId,
    });

    const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?${params}`;

    return NextResponse.redirect(slackOAuthUrl);
}
