export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
    toolInvocation?: {
        name: string;
        status: "pending" | "complete";
    };
    batchId?: string;
    isBatched?: boolean;
}

export type ConversationState = "IDLE" | "PROCESSING" | "WAITING_FOR_RESPONSE" | "WAITING_FOR_CONFIRMATION";

export interface PendingAction {
    type: "refund" | "escalation" | "cancellation";
    details: Record<string, unknown>;
    confirmationPrompt: string;
    createdAt: number;
    expiresAt: number;
}

export interface Conversation {
    sessionId: string;
    messages: Message[];
    state: ConversationState;
    pendingAction: PendingAction | null;
    collectedData: Record<string, unknown>;
    createdAt: number;
    lastActivityAt: number;
}
