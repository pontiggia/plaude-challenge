export interface SlackTextObject {
    type: "plain_text" | "mrkdwn";
    text: string;
    emoji?: boolean;
}

export interface SlackHeaderBlock {
    type: "header";
    text: SlackTextObject;
}

export interface SlackSectionBlock {
    type: "section";
    text?: SlackTextObject;
    fields?: SlackTextObject[];
}

export interface SlackDividerBlock {
    type: "divider";
}

export interface SlackButtonElement {
    type: "button";
    text: SlackTextObject;
    style?: "primary" | "danger";
    action_id: string;
    value: string;
}

export interface SlackActionsBlock {
    type: "actions";
    elements: SlackButtonElement[];
}

export interface SlackPlainTextInputElement {
    type: "plain_text_input";
    action_id: string;
    placeholder?: SlackTextObject;
    multiline?: boolean;
}

export interface SlackInputBlock {
    type: "input";
    block_id: string;
    optional?: boolean;
    element: SlackPlainTextInputElement;
    label: SlackTextObject;
}

export interface SlackContextBlock {
    type: "context";
    elements: SlackTextObject[];
}

export type SlackBlock = SlackHeaderBlock | SlackSectionBlock | SlackDividerBlock | SlackActionsBlock | SlackInputBlock | SlackContextBlock;

// Slack API Error type
export interface SlackAPIError extends Error {
    code?: string;
    data?: {
        error?: string;
        ok?: boolean;
        response_metadata?: {
            messages?: string[];
        };
    };
}

// Type guard for Slack API errors
export function isSlackAPIError(error: unknown): error is SlackAPIError {
    return error instanceof Error && typeof (error as SlackAPIError).data === "object" && (error as SlackAPIError).data !== null;
}

// Slack Interaction Payload Types
export interface SlackUser {
    id: string;
    username: string;
    name: string;
    team_id: string;
}

export interface SlackTeam {
    id: string;
    domain: string;
}

export interface SlackChannel {
    id: string;
    name: string;
}

export interface SlackAction {
    action_id: string;
    block_id: string;
    value: string;
    type: string;
}

export interface SlackMessage {
    type: string;
    ts: string;
    blocks: SlackBlock[];
}

export interface SlackInteractionState {
    values: {
        [blockId: string]: {
            [actionId: string]: {
                type: string;
                value?: string;
            };
        };
    };
}

export interface SlackBlockActionsPayload {
    type: "block_actions";
    user: SlackUser;
    team: SlackTeam;
    channel: SlackChannel;
    message: SlackMessage;
    actions: SlackAction[];
    state?: SlackInteractionState;
}

export interface SlackInteractionPayload {
    type: string;
    user?: SlackUser;
    team?: SlackTeam;
    channel?: SlackChannel;
    message?: SlackMessage;
    actions?: SlackAction[];
    state?: SlackInteractionState;
}

// Type guard for block_actions payload
export function isBlockActionsPayload(payload: SlackInteractionPayload): payload is SlackBlockActionsPayload {
    return payload.type === "block_actions" && payload.actions !== undefined && payload.actions.length > 0;
}
