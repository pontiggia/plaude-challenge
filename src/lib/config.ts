export const config = {
    anthropic: {
        api_key: process.env.ANTHROPIC_API_KEY || "",
    },

    slack: {
        client_id: process.env.SLACK_CLIENT_ID || "",
        client_secret: process.env.SLACK_CLIENT_SECRET || "",
        signing_secret: process.env.SLACK_SIGNING_SECRET || "",
    },

    redis: {
        url: process.env.UPSTASH_REDIS_REST_URL || "",
        token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
    },

    app: {
        url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        slack_redirect_url: process.env.SLACK_REDIRECT_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        node_env: (process.env.NODE_ENV || "development") as "development" | "production" | "test",
    },
} as const;
