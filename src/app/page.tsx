import { SlackConnectButton } from "@/components/slack/connect-button";
import { getSessionId } from "@/lib/session";
import { getInstallation } from "@/lib/db/redis";
import { redirect } from "next/navigation";
import { PageContainer, ContentWrapper } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";

export default async function Home() {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (installation?.defaultChannelId) {
        redirect("/chat");
    }

    if (installation && !installation.defaultChannelId) {
        redirect("/setup");
    }

    return (
        <PageContainer>
            <PageHeader />

            <ContentWrapper maxWidth="lg">
                <div className="text-center">
                    <div className="mb-8 flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-foreground rounded-full" />
                            <div className="absolute -top-4 -right-8 w-16 h-16 bg-foreground rounded-full opacity-80" />
                            <div className="absolute -bottom-2 -left-6 w-12 h-12 bg-foreground rounded-full opacity-60" />
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4 text-balance">AI Agent</h1>
                    <p className="text-lg md:text-xl text-muted-foreground mb-8">Human-in-the-loop approvals for enterprise workflows</p>

                    <SlackConnectButton />

                    <p className="text-xs text-muted-foreground mt-8">
                        Your Slack workspace will be connected to enable approval workflows.
                        <br />
                        No messages are stored permanently.
                    </p>
                </div>
            </ContentWrapper>
        </PageContainer>
    );
}
