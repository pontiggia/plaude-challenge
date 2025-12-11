import { requestApproval } from "@/workflows/approval/workflow";

export interface RefundParams {
    orderId: string;
    amount: number;
    reason: string;
    customerContext: string;
    sessionId: string;
}

export async function requestRefund(params: RefundParams) {
    "use step";

    const { orderId, amount, reason, customerContext, sessionId } = params;

    const approval = await requestApproval(
        {
            type: "refund",
            title: `Refund Request: $${amount}`,
            details: {
                "Order ID": orderId,
                Amount: `$${amount.toFixed(2)}`,
                Reason: reason,
                "Customer Context": customerContext,
            },
            urgency: amount > 200 ? "high" : "normal",
        },
        sessionId
    );

    if (approval.approved) {
        return {
            success: true,
            message: `Refund of $${amount} approved by ${approval.approvedBy}. Processing now.`,
            refundId: `REF-${Date.now()}`,
            approverComment: approval.comment,
        };
    } else {
        return {
            success: false,
            message: `Refund request was declined.`,
            reason: approval.comment || "No reason provided",
            declinedBy: approval.approvedBy,
        };
    }
}
