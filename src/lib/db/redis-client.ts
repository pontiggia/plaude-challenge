import { Redis } from "@upstash/redis";
import { config } from "@/lib/config";
import { z } from "zod";
import { logger } from "@/lib/logger";

export const redis = new Redis({
    url: config.redis.url,
    token: config.redis.token,
});

export async function getJSON<T>(key: string, schema: z.ZodType<T>): Promise<T | null> {
    const data = await redis.get(key);
    if (!data) return null;

    const parsed = typeof data === "string" ? JSON.parse(data) : data;

    const result = schema.safeParse(parsed);

    if (!result.success) {
        logger.error("Redis data validation failed", {
            key,
            errors: result.error.issues,
        });
        return null;
    }

    return result.data;
}

export async function setJSON<T>(key: string, value: T, options?: { ex?: number }): Promise<void> {
    if (options?.ex) {
        await redis.set(key, JSON.stringify(value), { ex: options.ex });
    } else {
        await redis.set(key, JSON.stringify(value));
    }
}
