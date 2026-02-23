import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Keyboard, Platform, KeyboardAvoidingView } from "react-native";
import { useRouter } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModel } from "@/lib/model-context";
import { createChat } from "@/lib/db";

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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />
        <Pressable style={styles.welcomeArea} onPress={Keyboard.dismiss}>
          <Text style={styles.welcomeText}>How can I help you today?</Text>
        </Pressable>
        <View style={styles.spacer} />
      </ScrollView>
      <View style={styles.inputWrapper}>
        <ChatInput onSend={handleSend} />
      </View>
    </KeyboardAvoidingView>
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
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  welcomeArea: {
    alignItems: "center",
    justifyContent: "center",
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
  inputWrapper: {
    backgroundColor: "#1C1C1E",
    paddingTop: 8,
  },
});
