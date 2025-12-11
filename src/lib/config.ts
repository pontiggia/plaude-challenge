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

// Log configuration on startup (once)
if (typeof window === "undefined") {
    console.log("\n=== Configuration Loaded ===");
    console.log("Environment:", config.app.node_env);
    console.log("App URL:", config.app.url);
    console.log("Slack Redirect URL:", config.app.slack_redirect_url);
    console.log("Slack Client ID:", config.slack.client_id ? "SET" : "MISSING");
    console.log("Slack Client Secret:", config.slack.client_secret ? "SET" : "MISSING");
    console.log("Slack Signing Secret:", config.slack.signing_secret ? "SET" : "MISSING");
    console.log("Redis URL:", config.redis.url ? "SET" : "MISSING");
    console.log("Anthropic API Key:", config.anthropic.api_key ? "SET" : "MISSING");
    console.log("=== End Configuration ===\n");
}

export function validate_config() {
    const required = {
        ANTHROPIC_API_KEY: config.anthropic.api_key,
        SLACK_CLIENT_ID: config.slack.client_id,
        SLACK_CLIENT_SECRET: config.slack.client_secret,
        SLACK_SIGNING_SECRET: config.slack.signing_secret,
        UPSTASH_REDIS_REST_URL: config.redis.url,
        UPSTASH_REDIS_REST_TOKEN: config.redis.token,
    };

    const missing = Object.entries(required)
        .filter(([_, value]) => !value)
        .map(([key]) => key);

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
}
