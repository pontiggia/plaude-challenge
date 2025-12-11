import { ChannelSelector } from "@/components/slack/channel-selector";
import { getSessionId } from "@/lib/session";
import { getInstallation } from "@/lib/db/redis";
import { redirect } from "next/navigation";
import { PageContainer, ContentWrapper } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { FormCard, FormCardIcon, FormCardHeader } from "@/components/ui/form-card";

export const metadata = {
    title: "Setup - Plaude Agent",
    description: "Select a Slack channel for approval notifications",
};

export default async function SetupPage() {
    const sessionId = await getSessionId();
    const installation = await getInstallation(sessionId);

    if (!installation) {
        redirect("/");
    }

    if (installation.defaultChannelId) {
        redirect("/chat");
    }

    return (
        <PageContainer>
            <PageHeader />

            <ContentWrapper>
                <FormCard>
                    <FormCardIcon>
                        <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                    </FormCardIcon>

                    <FormCardHeader
                        title="Select a channel"
                        description="Choose where approval requests will be sent in your Slack workspace."
                    />

                    <ChannelSelector />
                </FormCard>
            </ContentWrapper>
        </PageContainer>
    );
}
