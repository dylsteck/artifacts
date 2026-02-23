import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThinkingDropdown } from "./ThinkingDropdown";
import { MarkdownContent } from "./MarkdownContent";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  reasoning?: string;
  isStreaming?: boolean;
};

export function MessageBubble({
  role,
  content,
  reasoning,
  isStreaming = false,
}: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <View style={[styles.row, isUser ? styles.rowUser : styles.rowAssistant]}>
      {isUser ? (
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{content}</Text>
        </View>
      ) : (
        <View style={styles.assistantBubble}>
          {reasoning ? (
            <ThinkingDropdown reasoning={reasoning} isStreaming={isStreaming} />
          ) : null}
          {content ? (
            <MarkdownContent content={content} isStreaming={isStreaming} />
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
