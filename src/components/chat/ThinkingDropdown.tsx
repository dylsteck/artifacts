import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Animated, useWindowDimensions } from "react-native";

type ThinkingDropdownProps = {
  reasoning: string;
  isStreaming: boolean;
};

export function ThinkingDropdown({ reasoning, isStreaming }: ThinkingDropdownProps) {
  const { width } = useWindowDimensions();
  // row has paddingHorizontal: 16 on each side
  const contentWidth = width - 32;
  const [expanded, setExpanded] = useState(true);
  const shimmer = useRef(new Animated.Value(1)).current;

  // Auto-collapse shortly after streaming finishes
  useEffect(() => {
    if (!isStreaming) {
      const timer = setTimeout(() => setExpanded(false), 600);
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
          Animated.timing(shimmer, {
            toValue: 0.35,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(shimmer, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isStreaming]);

  return (
    <View style={[styles.wrapper, { width: contentWidth }]}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        hitSlop={8}
      >
        <Animated.Text style={[styles.label, { opacity: shimmer }]}>
          {isStreaming ? "Thinking..." : "Thought"}
        </Animated.Text>
        <Text style={styles.chevron}>{expanded ? "⌃" : "⌄"}</Text>
      </Pressable>
      {expanded && (
        <View style={styles.body}>
          <View style={styles.bar} />
          <Text style={styles.text}>{reasoning}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  label: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  chevron: {
    color: "rgba(255,255,255,0.3)",
    fontSize: 11,
  },
  body: {
    flexDirection: "row",
    gap: 10,
    paddingLeft: 2,
  },
  bar: {
    width: 2,
    borderRadius: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  text: {
    flex: 1,
    color: "rgba(255,255,255,0.35)",
    fontSize: 13,
    lineHeight: 19,
    fontStyle: "italic",
  },
});
