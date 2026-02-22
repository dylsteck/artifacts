import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Path, Circle } from "react-native-svg";
import { useSQLiteContext } from "expo-sqlite";
import { ChatInput } from "@/components/chat/ChatInput";
import { useModel } from "@/lib/model-context";
import { createChat } from "@/lib/db";

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

  async function handleSend(text: string) {
    const chatId = await createChat(db, { model });
    router.push({
      pathname: "/chat/[id]",
      params: { id: chatId, initialMessage: text },
    });
  }

  return (
    <View style={styles.container}>
      {/* Centered welcome content */}
      <View style={styles.welcomeArea}>
        <SparkLogo size={52} />
        <Text style={styles.welcomeText}>How can I help you today?</Text>
      </View>

      {/* Chat input pinned to bottom */}
      <ChatInput onSend={handleSend} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1C1C1E",
  },
  welcomeArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingHorizontal: 32,
    paddingBottom: 60,
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
