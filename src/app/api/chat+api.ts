import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export async function POST(req: Request) {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await req.json();

  const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const result = streamText({
    model: anthropic(model),
    messages: await convertToModelMessages(messages),
    maxOutputTokens: 4096,
  });

  return result.toUIMessageStreamResponse({
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Encoding": "none",
    },
  });
}
