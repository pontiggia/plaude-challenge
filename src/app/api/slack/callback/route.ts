import { NextRequest, NextResponse } from "next/server";
import { WebClient } from "@slack/web-api";
import { saveInstallation } from "@/lib/db/redis";
import { getSessionId, setSessionCookie } from "@/lib/session";
import { config } from "@/lib/config";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
        console.error("OAuth error from Slack:", error);
        return NextResponse.redirect(`${config.app.url}?error=${error}`);
    }

    if (!code) {
        console.error("No code parameter received from Slack");
        return NextResponse.redirect(`${config.app.url}?error=no_code`);
    }

    const sessionId = await getSessionId();

    if (state !== sessionId) {
        return NextResponse.redirect(`${config.app.url}?error=invalid_state`);
    }

    try {
        const client = new WebClient();
        const redirectUri = `${config.app.slack_redirect_url}/api/slack/callback`;

        const result = await client.oauth.v2.access({
            client_id: config.slack.client_id,
            client_secret: config.slack.client_secret,
            code,
            redirect_uri: redirectUri,
        });

        if (!result.ok || !result.access_token) {
            throw new Error("Failed to get access token");
        }

        const installation = {
            teamId: result.team?.id || "",
            teamName: result.team?.name || "",
            botToken: result.access_token,
            botUserId: result.bot_user_id || "",
            installedAt: new Date().toISOString(),
            installedBy: result.authed_user?.id || "",
        };

        await saveInstallation(sessionId, installation);

        await setSessionCookie(sessionId);

        return NextResponse.redirect(`${config.app.url}/setup`);
    } catch (error) {
        console.error("=== OAuth Token Exchange Error ===");
        console.error("Error details:", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        console.error("=== End OAuth Error ===\n");
        return NextResponse.redirect(`${config.app.url}?error=oauth_failed`);
    }
}
