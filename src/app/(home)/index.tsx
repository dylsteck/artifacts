import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path, Circle } from "react-native-svg";
import { useSQLiteContext } from "expo-sqlite";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModel } from "@/lib/model-context";
import { createChat } from "@/lib/db";

const COMPOSER_BOTTOM_INSET = 100;

// Anthropic spark/diamond logo
function SparkLogo({ size = 48 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Anthropic "A" spark shape — stylized diamond/spark */}
      <Path
        d="M24 4 L30 18 L44 18 L33 28 L37 42 L24 34 L11 42 L15 28 L4 18 L18 18 Z"
        fill="#E0745A"
        opacity={0.95}
      />
      <Circle cx="24" cy="24" r="5" fill="#1C1C1E" />
    </Svg>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { model } = useModel();
  const insets = useSafeAreaInsets();

  async function handleSend(text: string) {
    const chatId = await createChat(db, { model });
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId, initialMessage: text },
    });
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        contentInset={{ bottom: COMPOSER_BOTTOM_INSET }}
        scrollIndicatorInsets={{ bottom: COMPOSER_BOTTOM_INSET }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.spacer} />
        <Pressable style={styles.welcomeArea} onPress={Keyboard.dismiss}>
          <SparkLogo size={52} />
          <Text style={styles.welcomeText}>How can I help you today?</Text>
        </Pressable>
        <View style={styles.spacer} />
      </ScrollView>
      <KeyboardStickyView
        style={styles.composerSticky}
        offset={{ closed: -insets.bottom, opened: 8 }}
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
