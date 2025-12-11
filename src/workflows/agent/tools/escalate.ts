import { requestApproval } from "@/workflows/approval/workflow";

export interface EscalateParams {
    reason: string;
    customerMessage: string;
    suggestedAction?: string;
    sessionId: string;
}

export async function escalateToHuman(params: EscalateParams) {
    "use workflow";

    const { reason, customerMessage, suggestedAction, sessionId } = params;

    const approval = await requestApproval(
        {
            type: "escalation",
            title: "Request Escalation",
            details: {
                "Reason for Escalation": reason,
                "Customer Message": customerMessage,
                ...(suggestedAction && { "AI Suggested Action": suggestedAction }),
            },
            urgency: "normal",
            requiresResponse: true,
        },
        sessionId
    );

    return {
        humanResponse: approval.comment || "Please proceed as you see fit.",
        respondedBy: approval.approvedBy,
        approved: approval.approved,
    };
}
