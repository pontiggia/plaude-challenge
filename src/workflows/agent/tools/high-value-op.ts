import { requestApproval } from "@/workflows/approval/workflow";

export interface HighValueParams {
    operationType: string;
    amount: number;
    description: string;
    customerContext: string;
    sessionId: string;
}

export async function highValueOperation(params: HighValueParams) {
    "use step";

    const { operationType, amount, description, customerContext, sessionId } = params;

    const approval = await requestApproval(
        {
            type: "high_value",
            title: `High-Value Operation: $${amount}`,
            details: {
                "Operation Type": operationType,
                Amount: `$${amount.toFixed(2)}`,
                Description: description,
                "Customer Context": customerContext,
            },
            urgency: amount > 1000 ? "high" : "normal",
        },
        sessionId
    );

    if (approval.approved) {
        return {
            success: true,
            message: `Operation approved by ${approval.approvedBy}. Proceeding with ${operationType}.`,
            transactionId: `TXN-${Date.now()}`,
            approverComment: approval.comment,
        };
    } else {
        return {
            success: false,
            message: `Operation was not approved.`,
            reason: approval.comment || "No reason provided",
            declinedBy: approval.approvedBy,
        };
    }
}
