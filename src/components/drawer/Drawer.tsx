import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSQLiteContext } from "expo-sqlite";
import { useDrawer, DRAWER_WIDTH } from "./DrawerContext";
import { getRecentChats, deleteChat } from "@/lib/db";

type Chat = { id: string; title: string; model: string; updated_at: number };

export function Drawer() {
  const { isOpen, close, animProgress } = useDrawer();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const db = useSQLiteContext();
  const [recentChats, setRecentChats] = useState<Chat[]>([]);

  // Load recent chats whenever drawer opens
  useEffect(() => {
    if (isOpen) {
      getRecentChats(db).then(setRecentChats);
    }

    if (isOpen) {
      animProgress.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else {
      animProgress.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
  }, [isOpen]);

  async function handleDeleteChat(chatId: string) {
    Alert.alert("Delete Chat", "Remove this chat from history?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteChat(db, chatId);
          setRecentChats((prev) => prev.filter((c) => c.id !== chatId));
        },
      },
    ]);
  }

  // Drawer panel slides from -DRAWER_WIDTH (hidden) to 0 (visible)
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (animProgress.value - 1) * DRAWER_WIDTH }],
  }));

  return (
    <View
      style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
      pointerEvents="box-none"
    >
      <Animated.View
        style={[
          styles.sidebar,
          { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 16) },
          drawerStyle,
        ]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>Artifacts</Text>
        </View>

        {/* Nav items */}
        <View style={styles.navSection}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => { router.push("/"); close(); }}
          >
            <SymbolView name="bubble.left.fill" size={20} tintColor="rgba(255,255,255,0.85)" />
            <Text style={styles.navLabel}>Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => { router.push("/artifacts"); close(); }}
          >
            <SymbolView name="square.grid.2x2.fill" size={20} tintColor="rgba(255,255,255,0.85)" />
            <Text style={styles.navLabel}>Artifacts</Text>
          </TouchableOpacity>
        </View>

        {/* Recents */}
        <View style={styles.recentsSection}>
          <Text style={styles.recentsLabel}>RECENTS</Text>
        </View>

        <ScrollView style={styles.recentsList} showsVerticalScrollIndicator={false}>
          {recentChats.length === 0 && (
            <Text style={styles.emptyText}>No recent chats</Text>
          )}
          {recentChats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={styles.chatItem}
              onPress={() => {
                router.push({ pathname: "/chat/[id]", params: { id: chat.id } });
                close();
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.chatTitle} numberOfLines={1}>
                {chat.title}
              </Text>
              <TouchableOpacity
                onPress={() => handleDeleteChat(chat.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.deleteButton}
              >
                <SymbolView
                  name="trash"
                  size={14}
                  tintColor="rgba(255,255,255,0.3)"
                />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom: profile + new chat */}
        <View style={styles.bottomRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>D</Text>
          </View>
          <Text style={styles.profileName}>Dylan Steck</Text>
          <TouchableOpacity
            style={styles.newChatButton}
            onPress={() => { router.push("/"); close(); }}
          >
            <SymbolView name="square.and.pencil" size={18} tintColor="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: "#1C1C1E",
    shadowColor: "#000",
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  brandTitle: {
    fontSize: 30,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  navSection: {
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 2,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
  },
  navLabel: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 16,
    fontWeight: "500",
  },
  recentsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 8,
  },
  recentsLabel: {
    color: "rgba(255,255,255,0.35)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
  },
  recentsList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyText: {
    color: "rgba(255,255,255,0.25)",
    fontSize: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 8,
  },
  chatTitle: {
    flex: 1,
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "400",
  },
  deleteButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#636366",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2C2C2E",
    alignItems: "center",
    justifyContent: "center",
  },
});
