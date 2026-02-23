import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { gateway } from "@ai-sdk/gateway";

// Maps internal model IDs to Vercel AI Gateway model IDs
const GATEWAY_MODELS: Record<string, string> = {
  // Anthropic
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  "claude-opus-4-6": "anthropic/claude-opus-4.6",
  "claude-haiku-4-5-20251001": "anthropic/claude-haiku-4.5",
  // xAI
  "grok-3": "xai/grok-3",
  "grok-3-mini": "xai/grok-3-mini",
};

function toGatewayModelId(id: string): string {
  return GATEWAY_MODELS[id] ?? id;
}

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await req.json();

  const gatewayModelId = toGatewayModelId(model);
  console.log("[API] POST /api/chat model:", model, "→ gateway:", gatewayModelId);
  console.log("[API] messages:", messages.length);

  try {
    const result = streamText({
      model: gateway(gatewayModelId),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 4096,
      onChunk({ chunk }) {
        if (chunk.type === "text") console.log("[LLM] chunk:", chunk.text);
        if (chunk.type === "reasoning") console.log("[LLM] reasoning:", chunk.text);
      },
    });

    return result.toUIMessageStreamResponse({
      sendReasoning: true,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Encoding": "none",
      },
    });
  } catch (err) {
    console.error("[API] streamText error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
}
