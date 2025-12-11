import { ChatContainer } from "@/components/chat/chat-container";
import { getSessionId } from "@/lib/session";
import { getInstallation } from "@/lib/db/redis";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Chat - Plaude Agent",
    description: "AI-powered support agent with human-in-the-loop approvals",
};

export default async function ChatPage() {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation) {
        redirect("/");
    }

    if (!installation.defaultChannelId) {
        redirect("/setup");
    }

    return (
        <main className="min-h-screen bg-background">
            <ChatContainer teamName={installation.teamName} sessionId={sessionId} />
        </main>
    );
}
