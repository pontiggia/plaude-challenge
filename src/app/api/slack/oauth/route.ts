import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { config } from "@/lib/config";

const SESSION_COOKIE_NAME = "plaude_session";

export async function GET(_request: NextRequest) {
    const sessionId = await getSessionId();

    const scopes = ["chat:write", "channels:read", "groups:read", "users:read", "channels:join"];

    const redirectUri = `${config.app.slack_redirect_url}/api/slack/callback`;

    const params = new URLSearchParams({
        client_id: config.slack.client_id,
        scope: scopes.join(","),
        redirect_uri: redirectUri,
        state: sessionId,
    });

    const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?${params}`;

    const response = NextResponse.redirect(slackOAuthUrl);

    const cookieOptions = {
        httpOnly: true,
        secure: config.app.node_env === "production",
        sameSite: "lax" as const,
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
    };

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, cookieOptions);

    return response;
}
