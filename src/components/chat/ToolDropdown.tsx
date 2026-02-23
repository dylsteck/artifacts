import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
  useWindowDimensions,
} from "react-native";
import { SymbolView } from "expo-symbols";
import Animated, { FadeIn } from "react-native-reanimated";

type ToolDropdownProps = {
  toolName: string;
  state: ToolPart["state"];
  input?: unknown;
  output?: unknown;
  errorText?: string;
  isStreaming?: boolean;
};

function formatJson(value: unknown): string {
  if (value === undefined || value === null) return "";
  try {
    return typeof value === "string"
      ? value
      : JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function ToolDropdown({
  toolName,
  state,
  input,
  output,
  errorText,
  isStreaming = false,
}: ToolDropdownProps) {
  const { width } = useWindowDimensions();
  const contentWidth = width - 32;
  const [expanded, setExpanded] = useState(false);

  const displayName = toolName.replace(/^tool-/, "").replace(/-/g, " ");
  const hasOutput = state === "output-available" && output != null;
  const hasError = state === "output-error";
  const hasInput = input !== undefined && input !== null;

  const label = isStreaming
    ? `Using ${displayName}...`
    : hasError
    ? `${displayName} (error)`
    : hasOutput
    ? `${displayName} (results)`
    : hasInput
    ? `${displayName}`
    : `Using ${displayName}`;

  const hasContent = hasInput || hasOutput || hasError;

  return (
    <Animated.View entering={FadeIn.duration(120)} style={[styles.wrapper, { width: contentWidth }]}>
      <Pressable
        style={styles.header}
        onPress={() => setExpanded((v) => !v)}
        hitSlop={8}
      >
        <SymbolView
          name="wrench.and.screwdriver"
          size={14}
          tintColor="rgba(255,255,255,0.55)"
        />
        <Text style={styles.label}>{label}</Text>
        <SymbolView
          name={expanded ? "chevron.down" : "chevron.right"}
          size={11}
          tintColor="rgba(255,255,255,0.35)"
        />
      </Pressable>
      {expanded && hasContent ? (
        <View style={styles.content}>
          {hasInput ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Input</Text>
              <Text style={styles.mono} selectable>
                {formatJson(input)}
              </Text>
            </View>
          ) : null}
          {hasOutput ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Results</Text>
              <Text style={styles.mono} selectable>
                {formatJson(output)}
              </Text>
            </View>
          ) : null}
          {hasError && errorText ? (
            <View style={styles.section}>
              <Text style={[styles.sectionLabel, styles.errorLabel]}>Error</Text>
              <Text style={[styles.mono, styles.errorText]} selectable>
                {errorText}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
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
  content: {
    gap: 12,
    marginTop: 4,
  },
  section: {
    gap: 4,
  },
  sectionLabel: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  errorLabel: {
    color: "rgba(255,107,107,0.9)",
  },
  mono: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    lineHeight: 18,
  },
  errorText: {
    color: "rgba(255,107,107,0.9)",
  },
});
