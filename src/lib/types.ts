export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    createdAt: Date;
    toolInvocation?: {
        name: string;
        status: "pending" | "complete";
    };
}
