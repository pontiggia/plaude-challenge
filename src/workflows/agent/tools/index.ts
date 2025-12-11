import { z } from "zod";
import { requestRefund } from "./refund";
import { highValueOperation } from "./high-value-op";
import { escalateToHuman } from "./escalate";

export function createAgentTools(sessionId: string) {
    return {
        request_refund: {
            description: "Request a refund for a customer. ALWAYS requires human approval.",
            inputSchema: z.object({
                orderId: z.string().describe("The order ID to refund"),
                amount: z.number().describe("The refund amount in dollars"),
                reason: z.string().describe("Reason for the refund"),
                customerContext: z.string().describe("Brief context about the customer's situation"),
            }),
            execute: async (params: { orderId: string; amount: number; reason: string; customerContext: string }) =>
                requestRefund({ ...params, sessionId }),
        },

        high_value_operation: {
            description: "Process a high-value operation (>$500). ALWAYS requires human approval.",
            inputSchema: z.object({
                operationType: z.enum(["order_modification", "account_credit", "bulk_purchase", "other"]),
                amount: z.number().describe("The dollar amount involved"),
                description: z.string().describe("Description of the operation"),
                customerContext: z.string().describe("Brief context about the request"),
            }),
            execute: async (params: {
                operationType: "order_modification" | "account_credit" | "bulk_purchase" | "other";
                amount: number;
                description: string;
                customerContext: string;
            }) => highValueOperation({ ...params, sessionId }),
        },

        escalate_to_human: {
            description: "Escalate to a human agent when the request is ambiguous, unclear, or you're unsure how to proceed.",
            inputSchema: z.object({
                reason: z.string().describe("Why this needs human review"),
                customerMessage: z.string().describe("The customer's original message"),
                suggestedAction: z.string().optional().describe("Your suggested course of action, if any"),
            }),
            execute: async (params: { reason: string; customerMessage: string; suggestedAction?: string }) =>
                escalateToHuman({ ...params, sessionId }),
        },
    };
}
