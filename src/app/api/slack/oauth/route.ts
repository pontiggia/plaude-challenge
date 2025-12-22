import { NextRequest, NextResponse } from "next/server";
import { getSessionId } from "@/lib/session";
import { config } from "@/lib/config";
import { SESSION_COOKIE_NAME, COOKIE_OPTIONS, SLACK_OAUTH_SCOPES } from "@/lib/constants";

export async function GET(_request: NextRequest): Promise<NextResponse> {
    const sessionId = await getSessionId();

    const redirectUri = `${config.app.slack_redirect_url}/api/slack/callback`;

    const params = new URLSearchParams({
        client_id: config.slack.client_id,
        scope: SLACK_OAUTH_SCOPES.join(","),
        redirect_uri: redirectUri,
        state: sessionId,
    });

    const slackOAuthUrl = `https://slack.com/oauth/v2/authorize?${params}`;

    const response = NextResponse.redirect(slackOAuthUrl);
    response.cookies.set(SESSION_COOKIE_NAME, sessionId, COOKIE_OPTIONS);

    return response;
}
