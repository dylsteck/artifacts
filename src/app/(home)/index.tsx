import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Keyboard, Platform } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSQLiteContext } from "expo-sqlite";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModel } from "@/lib/model-context";
import { createChat } from "@/lib/db";

const COMPOSER_BOTTOM_INSET = 100;


export default function HomeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { model } = useModel();
  async function handleSend(text: string) {
    const chatId = await createChat(db, { model });
    router.replace({
      pathname: "/chat/[id]",
      params: { id: chatId, initialMessage: text },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS !== "ios" && { paddingBottom: COMPOSER_BOTTOM_INSET },
        ]}
        contentInset={Platform.OS === "ios" ? { bottom: COMPOSER_BOTTOM_INSET } : undefined}
        scrollIndicatorInsets={Platform.OS === "ios" ? { bottom: COMPOSER_BOTTOM_INSET } : undefined}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />
        <Pressable style={styles.welcomeArea} onPress={Keyboard.dismiss}>
          <Text style={styles.welcomeText}>How can I help you today?</Text>
        </Pressable>
        <View style={styles.spacer} />
      </ScrollView>
      <KeyboardStickyView
        style={styles.composerSticky}
        offset={{ closed: 0, opened: 20 }}
      >
        <ChatInput onSend={handleSend} />
      </KeyboardStickyView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  composerSticky: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  welcomeArea: {
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 32,
  },
  welcomeText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 28,
    fontWeight: "300",
    textAlign: "center",
    lineHeight: 36,
    letterSpacing: -0.3,
  },
});
