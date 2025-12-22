export const SESSION_COOKIE_NAME = "plaude_session_id";

export const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
    path: "/",
} as const;

export const SLACK_OAUTH_SCOPES = ["chat:write", "channels:read", "groups:read", "users:read", "channels:join"] as const;

export const CONVERSATION_TTL_SECONDS = 1800;

export const PENDING_ACTION_TTL_SECONDS = 300;

export const APPROVAL_TTL_SECONDS = 86400;

export const MAX_MESSAGES_PER_CONVERSATION = 100;

export const RAPID_FIRE_WINDOW_MS = 500;

export const TYPING_WAIT_MS = 2000;

export const TYPING_CHECK_INTERVAL_MS = 100;

export const TOAST_REMOVE_DELAY = 1000000;

export const MESSAGE_BREAK_SEPARATOR = "---MESSAGE_BREAK---";

export const TOOL_NAMES = {
    REQUEST_REFUND: "request_refund",
    HIGH_VALUE_OPERATION: "high_value_operation",
    ESCALATE_TO_HUMAN: "escalate_to_human",
} as const;

export type ToolName = (typeof TOOL_NAMES)[keyof typeof TOOL_NAMES];
