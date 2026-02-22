import { streamText, convertToModelMessages, type UIMessage } from "ai";

function toGatewayModel(id: string): string {
  return `anthropic/${id.replace(/-(\d)-(\d)(?=-|$)/g, ".$1.$2")}`;
}

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await req.json();

  const result = streamText({
    model: toGatewayModel(model),
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
}
