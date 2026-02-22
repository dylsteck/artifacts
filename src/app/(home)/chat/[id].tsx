import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Platform,
  Keyboard,
  Pressable,
  KeyboardAvoidingView,
  Modal,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { useHeaderHeight } from "@react-navigation/elements";
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
  const headerHeight = useHeaderHeight();
  const listRef = useRef<FlatList>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
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

  // Track keyboard visibility for tap-to-dismiss overlay
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
      const content = item.parts
        .filter((p) => p.type === "text")
        .map((p) => (p as { type: "text"; text: string }).text)
        .join("");

      return (
        <Pressable onPress={dismissKeyboard}>
          <MessageBubble
            role={role}
            content={content}
            isStreaming={isStreaming && isLast && role === "assistant"}
          />
        </Pressable>
      );
    },
    [messages, isStreaming, dismissKeyboard]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={headerHeight}
    >
      <View style={styles.container}>
        {/* Messages area: overlay sits inside so it covers FlatList but not ChatInput */}
        <View style={styles.listWrapper}>
          <FlatList
            ref={listRef}
            data={messages}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={
              Platform.OS === "ios" ? "interactive" : "on-drag"
            }
            onScrollBeginDrag={dismissKeyboard}
            ListFooterComponent={
              <View>
                {status === "submitted" ? (
                  <View style={styles.thinkingRow}>
                    <ActivityIndicator size="small" color="rgba(255,255,255,0.4)" />
                  </View>
                ) : null}
                <Pressable
                  style={styles.dismissArea}
                  onPress={dismissKeyboard}
                />
              </View>
            }
          />
        </View>
        <ChatInput
          onSend={handleSend}
          disabled={isStreaming || status === "submitted"}
        />
      </View>
      {/* Modal overlay: renders on top of everything, tap anywhere to dismiss keyboard */}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  listContent: {
    flexGrow: 1,
    paddingTop: 16,
    paddingBottom: 8,
  },
  thinkingRow: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  dismissArea: {
    minHeight: 200,
    flexGrow: 1,
  },
  listWrapper: {
    flex: 1,
  },
});
