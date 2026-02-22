import React from "react";
import { View, Text, StyleSheet } from "react-native";

type MessageBubbleProps = {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
};

export function MessageBubble({
  role,
  content,
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
          <Text style={styles.assistantText}>
            {content}
            {isStreaming && <Text style={styles.cursor}>▋</Text>}
          </Text>
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
  },
  assistantText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    lineHeight: 24,
  },
  cursor: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 16,
  },
});
