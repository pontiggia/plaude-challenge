import { redis, getJSON, setJSON } from "./redis-client";
import { z } from "zod";
import { APPROVAL_TTL_SECONDS } from "@/lib/constants";

export interface ApprovalData {
    sessionId: string;
    channelId: string;
    messageTs?: string;
}

const ApprovalDataSchema = z.object({
    sessionId: z.string(),
    channelId: z.string(),
    messageTs: z.string().optional(),
});

export async function savePendingApproval(hookToken: string, data: ApprovalData): Promise<void> {
    const key = `approval:${hookToken}`;
    await setJSON(key, data, { ex: APPROVAL_TTL_SECONDS });
}

export async function getPendingApproval(hookToken: string): Promise<ApprovalData | null> {
    const key = `approval:${hookToken}`;
    return getJSON(key, ApprovalDataSchema);
}

export async function deletePendingApproval(hookToken: string): Promise<void> {
    await redis.del(`approval:${hookToken}`);
}
