import React, { useCallback } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Renderer } from "@json-render/react-native";
import { ThinkingDropdown } from "./ThinkingDropdown";
import { ToolDropdown } from "./ToolDropdown";
import { MarkdownContent } from "./MarkdownContent";
import { registry, JsonRenderProviders } from "@/lib/json-render-registry";
import type { Spec } from "@json-render/core";

type ToolPartInfo = {
  key: string;
  toolName: string;
  state?: "input-streaming" | "input-available" | "output-available" | "output-error";
  input?: unknown;
  output?: unknown;
  errorText?: string;
};

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  toolParts?: ToolPartInfo[];
  isStreaming?: boolean;
  spec?: Spec | null;
  hasSpec?: boolean;
  onPress?: () => void;
  showCopyMenu?: boolean;
  onLongPressRequestCopy?: () => void;
  onCopyPress?: () => void;
};

export function MessageBubble({
  role,
  content,
  reasoning,
  toolParts = [],
  isStreaming = false,
  spec = null,
  hasSpec = false,
  onPress,
  showCopyMenu = false,
  onLongPressRequestCopy,
  onCopyPress,
}: MessageBubbleProps) {
  const isUser = role === "user";

  const handleLongPress = useCallback(() => {
    if (!content?.trim()) return;
    onLongPressRequestCopy?.();
  }, [content, onLongPressRequestCopy]);

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {isUser ? (
        <View style={styles.userBubbleWrapper}>
          <Pressable
            onPress={onPress}
            onLongPress={handleLongPress}
            delayLongPress={400}
          >
            <View style={styles.userBubble}>
              <Text style={styles.userText}>{content}</Text>
            </View>
          </Pressable>
          {showCopyMenu && onCopyPress ? (
            <Pressable
              style={styles.copyPill}
              onPress={onCopyPress}
              hitSlop={8}
            >
              <Text style={styles.copyPillText}>Copy</Text>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.assistantBubble}>
          {reasoning ? (
            <ThinkingDropdown reasoning={reasoning} isStreaming={isStreaming} />
          ) : null}
          {toolParts.map((tp) => (
            <ToolDropdown
              key={tp.key}
              toolName={tp.toolName}
              state={tp.state}
              input={tp.input}
              output={tp.output}
              errorText={tp.errorText}
              isStreaming={
                isStreaming &&
                (tp.state === "input-streaming" || tp.state === "input-available")
              }
            />
          ))}
          {content ? (
            <MarkdownContent content={content} isStreaming={isStreaming} />
          ) : null}
          {hasSpec && spec ? (
            <JsonRenderProviders initialState={spec.state ?? {}}>
              <Renderer
                spec={spec}
                registry={registry}
                loading={isStreaming}
                includeStandard={false}
              />
            </JsonRenderProviders>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  rowUser: {
    alignItems: "flex-end",
  },
  userBubbleWrapper: {
    alignItems: "flex-end",
    gap: 6,
  },
  copyPill: {
    backgroundColor: "#3A3A3C",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  copyPillText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    fontWeight: "500",
  },
  rowAssistant: {
    alignItems: "flex-start",
  },
  userBubble: {
    backgroundColor: "#2C2C2E",
    borderRadius: 18,
    borderBottomRightRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: "80%",
  },
  userText: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
  },
  assistantBubble: {
    maxWidth: "92%",
    paddingVertical: 4,
    gap: 14,
  },
});
