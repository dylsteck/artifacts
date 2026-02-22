import "@/global.css";

import { Slot } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import ThemeProvider from "@/components/theme-provider";
import { DrawerProvider, useDrawer, DRAWER_WIDTH } from "@/components/drawer/DrawerContext";
import { Drawer } from "@/components/drawer/Drawer";
import { SQLiteProvider } from "expo-sqlite";
import { initDb } from "@/lib/db";

// Wraps the entire app content — pushes right and dims as drawer opens
function AppContent() {
  const { animProgress, isOpen, close } = useDrawer();

  const pushStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateX: animProgress.value * DRAWER_WIDTH }],
  }));

  const dimStyle = useAnimatedStyle(() => ({
    opacity: animProgress.value * 0.35,
  }));

  return (
    <Animated.View style={pushStyle}>
      <ThemeProvider>
        <Slot />
      </ThemeProvider>
      {/* Tap-to-close dim overlay, only interactive when drawer is open */}
      <Animated.View
        style={[StyleSheet.absoluteFill, { backgroundColor: "#000" }, dimStyle]}
        pointerEvents={isOpen ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
      </Animated.View>
    </Animated.View>
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
