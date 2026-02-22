import "@/global.css";

import { Slot } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import ThemeProvider from "@/components/theme-provider";
import { DrawerProvider, useDrawer, DRAWER_WIDTH } from "@/components/drawer/DrawerContext";
import { Drawer } from "@/components/drawer/Drawer";
import { SQLiteProvider } from "expo-sqlite";
import { initDb } from "@/lib/db";

const EDGE_ZONE = 60; // px from left edge that triggers open

function AppContent() {
  const { animProgress, isOpen, open, close } = useDrawer();

  const startX = useSharedValue(0);
  const startProgress = useSharedValue(0);

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-8, 8])
    .onStart((event) => {
      startX.value = event.x;
      startProgress.value = animProgress.value;
    })
    .onUpdate((event) => {
      const drawerOpen = animProgress.value > 0.5;
      // Only open from the left edge zone; always allow closing from anywhere
      if (!drawerOpen && startX.value > EDGE_ZONE) return;
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

  const pushStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateX: animProgress.value * DRAWER_WIDTH }],
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value * 0.35,
  }));

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View style={pushStyle}>
        <ThemeProvider>
          <Slot />
        </ThemeProvider>
        {/* Tap-to-close dim overlay */}
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, dimStyle]}
          pointerEvents={isOpen ? "auto" : "none"}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

export { ErrorBoundary } from "expo-router";

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#1C1C1E" }}>
      <SQLiteProvider databaseName="artifacts.db" onInit={initDb}>
        <DrawerProvider>
          <AppContent />
          <Drawer />
        </DrawerProvider>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
