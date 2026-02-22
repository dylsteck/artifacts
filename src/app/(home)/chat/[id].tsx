import React, { useEffect, useRef, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { fetch as expoFetch } from "expo/fetch";
import { useSQLiteContext } from "expo-sqlite";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModel } from "@/lib/model-context";
import { generateAPIUrl } from "@/lib/generate-api-url";
import {
  getChatMessages,
  saveMessage,
  updateChatTitle,
} from "@/lib/db";

export default function ChatScreen() {
  const { id, initialMessage } = useLocalSearchParams<{
    id: string;
    initialMessage?: string;
  }>();
  const db = useSQLiteContext();
  const { model } = useModel();
  const navigation = useNavigation();
  const listRef = useRef<FlatList>(null);
  const titleSet = useRef(false);
  const initialSent = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: generateAPIUrl("/api/chat"),
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      body: { model },
    }),
    onFinish: async ({ message }) => {
      // Extract text from parts array
      const textContent = message.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");

      await saveMessage(db, {
        chatId: id,
        role: "assistant",
        content: textContent,
      });
    },
  });

  // Load existing messages from SQLite on mount
  useEffect(() => {
    (async () => {
      const stored = await getChatMessages(db, id);
      if (stored.length === 0 && initialMessage && !initialSent.current) {
        initialSent.current = true;
        handleSend(initialMessage);
      }
    })();
  }, [id]);

  // Auto-set title from first user message
  useEffect(() => {
    if (!titleSet.current && messages.length > 0) {
      const firstUser = messages.find((m) => m.role === "user");
      if (firstUser) {
        const textPart = firstUser.parts.find((p) => p.type === "text") as
          | { type: "text"; text: string }
          | undefined;
        const title = textPart?.text?.slice(0, 50).trim();
        if (title) {
          titleSet.current = true;
          updateChatTitle(db, id, title);
          navigation.setOptions({ title });
        }
      }
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  const handleSend = useCallback(
    async (text: string) => {
      await saveMessage(db, { chatId: id, role: "user", content: text });
      sendMessage({ text });
    },
    [db, id, sendMessage]
  );

  const isStreaming = status === "streaming";

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof messages)[0]; index: number }) => {
      const isLast = index === messages.length - 1;
      const role = item.role as "user" | "assistant";
      const content = item.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");

      return (
        <MessageBubble
          role={role}
          content={content}
          isStreaming={isStreaming && isLast && role === "assistant"}
        />
      );
    },
    [messages, isStreaming]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          status === "submitted" ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
            </View>
          ) : null
        }
      />
      <ChatInput
        onSend={handleSend}
        disabled={isStreaming || status === "submitted"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  listContent: {
    paddingTop: 16,
    paddingBottom: 8,
  },
  thinkingRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
