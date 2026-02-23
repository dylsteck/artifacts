import { useMemo } from "react";
import {
  createSpecStreamCompiler,
  SPEC_DATA_PART_TYPE,
  type Spec,
} from "@json-render/core";

type MessagePart = { type: string; text?: string; data?: unknown };

/**
 * Extract spec and text from AI SDK message parts (chat mode with pipeJsonRender).
 * When the AI embeds JSONL patches in responses, data-spec parts are compiled into a spec.
 */
export function useJsonRenderMessage(parts: MessagePart[]): {
  spec: Spec | null;
  text: string;
  hasSpec: boolean;
} {
  return useMemo(() => {
    let text = "";
    const compiler = createSpecStreamCompiler<Spec>();

    for (const part of parts) {
      if (part.type === "text" && typeof part.text === "string") {
        text += part.text;
      } else if (part.type === SPEC_DATA_PART_TYPE && part.data) {
        const data = part.data as { type?: string; patch?: unknown };
        if (data.type === "patch" && data.patch) {
          try {
            compiler.push(JSON.stringify(data.patch) + "\n");
          } catch {
            // Ignore invalid patches
          }
        }
      }
    }

    const spec = compiler.getResult();
    const hasSpec =
      spec &&
      typeof spec === "object" &&
      "root" in spec &&
      "elements" in spec &&
      Object.keys((spec as { elements?: object }).elements ?? {}).length > 0;

    return {
      spec: hasSpec ? spec : null,
      text: text.trim(),
      hasSpec: !!hasSpec,
    };
  }, [parts]);
}
