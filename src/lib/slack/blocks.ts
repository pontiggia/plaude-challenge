export interface ApprovalRequest {
    type: "refund" | "high_value" | "escalation";
    title: string;
    details: Record<string, string>;
    urgency: "normal" | "high";
    requiresResponse?: boolean;
}

export function buildApprovalBlocks(request: ApprovalRequest, hookToken: string) {
    const urgencyEmoji = request.urgency === "high" ? "🔴" : "🟡";
    const typeLabels = {
        refund: "💰 Refund Request",
        high_value: "💎 High-Value Operation",
        escalation: "🤔 Escalation",
    };

    const blocks: any[] = [
        {
            type: "header",
            text: {
                type: "plain_text",
                text: `${urgencyEmoji} ${typeLabels[request.type]}`,
                emoji: true,
            },
        },
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `*${request.title}*`,
            },
        },
        {
            type: "divider",
        },
    ];

    const fields = Object.entries(request.details).map(([key, value]) => ({
        type: "mrkdwn",
        text: `*${key}:*\n${value}`,
    }));

    for (let i = 0; i < fields.length; i += 2) {
        blocks.push({
            type: "section",
            fields: fields.slice(i, i + 2),
        });
    }

    blocks.push({
        type: "divider",
    });

    blocks.push({
        type: "actions",
        elements: [
            {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "✅ Approve",
                    emoji: true,
                },
                style: "primary",
                action_id: "approve",
                value: hookToken,
            },
            {
                type: "button",
                text: {
                    type: "plain_text",
                    text: "❌ Deny",
                    emoji: true,
                },
                style: "danger",
                action_id: "deny",
                value: hookToken,
            },
        ],
    });

    blocks.push({
        type: "input",
        block_id: "comment_block",
        optional: !request.requiresResponse,
        element: {
            type: "plain_text_input",
            action_id: "comment_input",
            placeholder: {
                type: "plain_text",
                text: request.requiresResponse ? "Please provide guidance for the AI..." : "Optional: Add a comment...",
            },
            multiline: true,
        },
        label: {
            type: "plain_text",
            text: request.requiresResponse ? "Response (Required)" : "Comment",
        },
    });

    return blocks;
}

export function buildApprovalResponseBlocks(originalTitle: string, approved: boolean, approverName: string, comment?: string) {
    const statusEmoji = approved ? "✅" : "❌";
    const statusText = approved ? "Approved" : "Denied";

    return [
        {
            type: "section",
            text: {
                type: "mrkdwn",
                text: `${statusEmoji} *${originalTitle}* - ${statusText} by <@${approverName}>`,
            },
        },
        ...(comment
            ? [
                  {
                      type: "context",
                      elements: [
                          {
                              type: "mrkdwn",
                              text: `💬 "${comment}"`,
                          },
                      ],
                  },
              ]
            : []),
    ];
}
