import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from "react-native";
import { SymbolView } from "expo-symbols";

type ThinkingDropdownProps = {
  reasoning: string;
  isStreaming: boolean;
};

export function ThinkingDropdown({ reasoning, isStreaming }: ThinkingDropdownProps) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32;

  const [expanded, setExpanded] = useState(true);
  const startTime = useRef(0);
  const finalMs = useRef(0);
  const shimmer = useRef(new Animated.Value(1)).current;

  // Track actual elapsed time
  useEffect(() => {
    if (isStreaming) {
      startTime.current = Date.now();
      finalMs.current = 0;
    } else if (startTime.current > 0) {
      finalMs.current = Date.now() - startTime.current;
    }
  }, [isStreaming]);

  // Auto-collapse when streaming finishes
  useEffect(() => {
    if (!isStreaming) {
      const timer = setTimeout(() => setExpanded(false), 500);
      return () => clearTimeout(timer);
    } else {
      setExpanded(true);
    }
  }, [isStreaming]);

  // Shimmer pulse while streaming
  useEffect(() => {
    if (isStreaming) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmer, { toValue: 0.4, duration: 900, useNativeDriver: true }),
          Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(shimmer, { toValue: 0.6, duration: 200, useNativeDriver: true }).start();
    }
  }, [isStreaming]);

  const label = isStreaming
    ? `Thinking...`
    : finalMs.current >= 2000
    ? `Thought for ${Math.round(finalMs.current / 1000)}s`
    : "Thought";

  return (
    <View style={[styles.wrapper, { width: contentWidth }]}>
      <Pressable style={styles.header} onPress={() => setExpanded((v) => !v)} hitSlop={8}>
        <Animated.View style={{ opacity: shimmer }}>
          <SymbolView name="brain" size={14} tintColor="rgba(255,255,255,0.55)" />
        </Animated.View>
        <Animated.Text style={[styles.label, { opacity: shimmer }]}>{label}</Animated.Text>
        <SymbolView
          name={expanded ? "chevron.down" : "chevron.right"}
          size={11}
          tintColor="rgba(255,255,255,0.35)"
        />
      </Pressable>
      {expanded && reasoning ? (
        <Text style={styles.text}>{reasoning}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 14,
    fontWeight: "500",
  },
  text: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 4,
  },
});
