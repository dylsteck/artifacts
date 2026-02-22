import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useRouter } from "expo-router";
import Animated, {
  useAnimatedStyle,
  withTiming,
  runOnJS,
  useSharedValue,
  Easing,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawer, DRAWER_WIDTH } from "./DrawerContext";

const EDGE_HIT_SLOP = 30;

export function Drawer() {
  const { isOpen, open, close, animProgress } = useDrawer();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isOpenShared = useSharedValue(false);
  const startProgress = useSharedValue(0);

  useEffect(() => {
    isOpenShared.value = isOpen;
    if (isOpen) {
      animProgress.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
    } else {
      animProgress.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
    }
  }, [isOpen]);

  // Drawer panel slides from -DRAWER_WIDTH (hidden) to 0 (visible)
  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: (animProgress.value - 1) * DRAWER_WIDTH }],
  }));

  const panGesture = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .onStart((event) => {
      startProgress.value = animProgress.value;
      isOpenShared.value = animProgress.value > 0.5;
    })
    .onUpdate((event) => {
      const currently = isOpenShared.value;
      // When closed, only respond to drags starting from left edge
      if (!currently && event.x > EDGE_HIT_SLOP && event.translationX <= 0) return;
      const newProgress = startProgress.value + event.translationX / DRAWER_WIDTH;
      animProgress.value = Math.max(0, Math.min(1, newProgress));
    })
    .onEnd((event) => {
      const shouldOpen =
        event.velocityX > 500 ||
        (event.velocityX > -500 && animProgress.value > 0.4);

      if (shouldOpen) {
        animProgress.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) });
        runOnJS(open)();
      } else {
        animProgress.value = withTiming(0, { duration: 260, easing: Easing.out(Easing.cubic) });
        runOnJS(close)();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View
        style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
        pointerEvents="box-none"
      >
        {/* Sidebar panel — always rendered, translated offscreen when closed */}
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
            <View style={styles.navItem}>
              <SymbolView name="bubble.left.fill" size={20} tintColor="rgba(255,255,255,0.85)" />
              <Text style={styles.navLabel}>Chat</Text>
            </View>

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

          {/* Spacer */}
          <View style={{ flex: 1 }} />

          {/* Bottom: profile + new chat */}
          <View style={styles.bottomRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>D</Text>
            </View>
            <Text style={styles.profileName}>Dylan Steck</Text>
            <TouchableOpacity style={styles.newChatButton} onPress={() => { router.push("/"); close(); }}>
              <SymbolView name="square.and.pencil" size={18} tintColor="rgba(255,255,255,0.9)" />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </GestureDetector>
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
