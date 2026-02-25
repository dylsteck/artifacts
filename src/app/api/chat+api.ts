import {
  streamText,
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { pipeJsonRender } from "@json-render/core";
import { gateway } from "@ai-sdk/gateway";
import { catalog } from "@/lib/json-render-catalog";

// Maps internal model IDs to Vercel AI Gateway model IDs
// Verified against https://vercel.com/ai-gateway/models
const GATEWAY_MODELS: Record<string, string> = {
  // Anthropic
  "claude-sonnet-4-6": "anthropic/claude-sonnet-4.6",
  "claude-opus-4-6": "anthropic/claude-opus-4.6",
  "claude-haiku-4-5-20251001": "anthropic/claude-haiku-4.5",
  // xAI Grok 4.1 Fast (reasoning / non-reasoning)
  "grok-3": "xai/grok-4.1-fast-reasoning",
  "grok-3-latest": "xai/grok-4.1-fast-reasoning",
  "grok-3-mini": "xai/grok-4.1-fast-non-reasoning",
};

const XAI_MODELS = ["grok-3", "grok-3-latest", "grok-3-mini"] as const;

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
      system: catalog.prompt({ mode: "chat" }),
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 4096,
      ...(XAI_MODELS.includes(model as (typeof XAI_MODELS)[number]) && {
        providerOptions: {
          xai: {
            searchParameters: {
              mode: "on",
              returnCitations: true,
              sources: [{ type: "web" }, { type: "x" }],
            },
          },
        },
      }),
    });

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        writer.merge(
          pipeJsonRender(
            result.toUIMessageStream({ sendReasoning: true }) as ReadableStream
          )
        );
      },
    });

    return createUIMessageStreamResponse({
      stream,
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
