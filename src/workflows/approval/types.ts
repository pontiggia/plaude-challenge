export interface ApprovalRequest {
    type: "refund" | "high_value" | "escalation";
    title: string;
    details: Record<string, string>;
    urgency: "normal" | "high";
    requiresResponse?: boolean;
}

export interface ApprovalResult {
    approved: boolean;
    approvedBy: string;
    comment?: string;
    timestamp: Date;
}
