import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { anthropic } from "@ai-sdk/anthropic";
import type { ModelMessage, UIMessageChunk } from "ai";
import { createAgentTools } from "./tools";
import { AGENT_INSTRUCTIONS } from "./instructions";

export async function agentWorkflow(messages: ModelMessage[], sessionId: string) {
    "use workflow";

    const writable = getWritable<UIMessageChunk>();

    const tools = createAgentTools(sessionId);

    const agent = new DurableAgent({
        model: async () => {
            "use step";
            return anthropic("claude-sonnet-4-5-20250929");
        },
        system: AGENT_INSTRUCTIONS,
        tools,
    });

    await agent.stream({
        messages,
        writable,
    });
}
