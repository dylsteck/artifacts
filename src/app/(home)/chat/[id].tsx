import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Keyboard,
  Pressable,
  Modal,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useLocalSearchParams } from "expo-router";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChat, type UIMessage } from "@ai-sdk/react";
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

function toUIMessages(
  stored: { id: string; role: string; content: string }[]
): UIMessage[] {
  return stored.map((m) => ({
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  }));
}

function ChatContent({
  id,
  initialMessages,
  initialMessageToSend,
  db,
  model,
}: {
  id: string;
  initialMessages: UIMessage[];
  initialMessageToSend?: string;
  db: ReturnType<typeof useSQLiteContext>;
  model: string;
}) {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const titleSet = useRef(false);
  const initialSent = useRef(false);
  const autoScrollRef = useRef(true);
  const isStreamingRef = useRef(false);
  const COMPOSER_BOTTOM_INSET = 100;

  const apiUrl = generateAPIUrl("/api/chat");

  const { messages, sendMessage, status, error } = useChat({
    id,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: apiUrl,
      fetch: expoFetch as unknown as typeof globalThis.fetch,
      body: { model },
    }),
    onError: (err) => {
      console.error("[LLM] Error:", err);
    },
    onFinish: async ({ message }) => {
      const textParts = message.parts.filter((p) => p.type === "text");
      const reasoningParts = message.parts.filter((p) => p.type === "reasoning");
      const textContent =
        textParts.map((p) => (p as { type: "text"; text: string }).text).join("") ||
        reasoningParts.map((p) => (p as { type: "reasoning"; text: string }).text).join("");
      await saveMessage(db, { chatId: id, role: "assistant", content: textContent });
    },
  });

  useEffect(() => {
    if (initialMessageToSend && !initialSent.current) {
      initialSent.current = true;
      console.log("[Chat] Sending initial message to:", apiUrl, "model:", model);
      saveMessage(db, { chatId: id, role: "user", content: initialMessageToSend });
      sendMessage({ text: initialMessageToSend });
    }
  }, [initialMessageToSend, id, db, sendMessage]);

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
        }
      }
    }
  }, [messages]);

  // Keep isStreamingRef in sync; re-enable auto-scroll when stream finishes
  useEffect(() => {
    isStreamingRef.current = isStreaming;
    if (!isStreaming) {
      autoScrollRef.current = true;
    }
  }, [isStreaming]);

  // Scroll to bottom when a new message is added
  useEffect(() => {
    if (messages.length > 0) {
      autoScrollRef.current = true;
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    }
  }, [messages.length]);

  // During streaming, scroll to end on every content size change
  const handleContentSizeChange = useCallback(() => {
    if (autoScrollRef.current && isStreamingRef.current) {
      listRef.current?.scrollToEnd({ animated: false });
    }
  }, []);

  // Track whether user is near bottom
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - layoutMeasurement.height - contentOffset.y;
      const atBottom = distanceFromBottom < 60;
      setShowScrollButton(!atBottom);
      if (!atBottom) {
        autoScrollRef.current = false;
      }
    },
    []
  );

  const handleScrollBeginDrag = useCallback(() => {
    autoScrollRef.current = false;
    dismissKeyboard();
  }, [dismissKeyboard]);

  const handleScrollToBottom = useCallback(() => {
    autoScrollRef.current = true;
    listRef.current?.scrollToEnd({ animated: true });
    setShowScrollButton(false);
  }, []);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSend = useCallback(
    async (text: string) => {
      await saveMessage(db, { chatId: id, role: "user", content: text });
      sendMessage({ text });
    },
    [db, id, sendMessage]
  );

  const isStreaming = status === "streaming";

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: (typeof messages)[0]; index: number }) => {
      const isLast = index === messages.length - 1;
      const role = item.role as "user" | "assistant";
      const textContent = item.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");
      const reasoningContent = item.parts
        .filter((p) => p.type === "reasoning")
        .map((p) => (p as { type: "reasoning"; text: string }).text)
        .join("");
      return (
        <Pressable onPress={dismissKeyboard}>
          <MessageBubble
            role={role}
            content={textContent}
            reasoning={reasoningContent || undefined}
            isStreaming={isStreaming && isLast && role === "assistant"}
          />
        </Pressable>
      );
    },
    [messages, isStreaming, dismissKeyboard]
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          { paddingTop: insets.top + 56 },
          { paddingBottom: COMPOSER_BOTTOM_INSET + insets.bottom },
        ]}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onContentSizeChange={handleContentSizeChange}
        onScrollBeginDrag={handleScrollBeginDrag}
        ListFooterComponent={
          <View>
            {error ? (
              <View style={styles.errorRow}>
                <Text style={styles.errorText}>
                  {error instanceof Error ? error.message : String(error)}
                </Text>
                <Text style={styles.errorHint}>Check terminal for [LLM] logs</Text>
              </View>
            ) : status === "submitted" ? (
              <View style={styles.thinkingRow}>
                <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
                <Text style={styles.thinkingText}>Thinking...</Text>
              </View>
            ) : null}
          </View>
        }
      />
      {showScrollButton && (
        <Pressable
          style={[
            styles.scrollToBottomBtn,
            { bottom: COMPOSER_BOTTOM_INSET + insets.bottom + 12 },
          ]}
          onPress={handleScrollToBottom}
        >
          <SymbolView name="chevron.down" size={16} tintColor="rgba(255,255,255,0.8)" />
        </Pressable>
      )}
      <KeyboardStickyView
        style={styles.composerSticky}
        offset={{ closed: 0, opened: 20 }}
      >
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming || status === "submitted"}
        />
      </KeyboardStickyView>
      <Modal
        visible={keyboardVisible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismissKeyboard}
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={() => {
            setKeyboardVisible(false);
            dismissKeyboard();
          }}
        />
      </Modal>
    </View>
  );
}

export default function ChatScreen() {
  const { id, initialMessage } = useLocalSearchParams<{
    id: string;
    initialMessage?: string;
  }>();
  const db = useSQLiteContext();
  const { model } = useModel();
  const [ready, setReady] = useState<{
    initialMessages: UIMessage[];
    initialMessageToSend?: string;
  } | null>(null);

  useEffect(() => {
    (async () => {
      const stored = await getChatMessages(db, id);
      if (stored.length > 0) {
        setReady({ initialMessages: toUIMessages(stored) });
      } else if (initialMessage) {
        setReady({ initialMessages: [], initialMessageToSend: initialMessage });
      } else {
        setReady({ initialMessages: [] });
      }
    })();
  }, [id, db, initialMessage]);

  if (!ready) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="rgba(255,255,255,0.5)" />
      </View>
    );
  }

  return (
    <ChatContent
      id={id}
      initialMessages={ready.initialMessages}
      initialMessageToSend={ready.initialMessageToSend}
      db={db}
      model={model}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
  },
  thinkingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  thinkingText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
  },
  errorRow: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
  },
  errorHint: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
  },
  composerSticky: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  scrollToBottomBtn: {
    position: "absolute",
    right: 20,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3A3A3C",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
});
