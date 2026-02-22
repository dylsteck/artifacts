import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ChatInputProps = {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
};

export function ChatInput({
  onSend,
  placeholder = "Chat",
  disabled = false,
}: ChatInputProps) {
  const [text, setText] = useState("");
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText("");
  }

  const hasText = text.trim().length > 0;

  return (
    <View
      style={[
        styles.wrapper,
        { paddingBottom: Math.max(insets.bottom, 16) },
      ]}
    >
      <View style={styles.container}>
          {/* Top: Text Input */}
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.35)"
            multiline
            maxLength={4000}
            editable={!disabled}
            returnKeyType="default"
            onSubmitEditing={Platform.OS === "web" ? handleSend : undefined}
            blurOnSubmit={false}
          />

          {/* Bottom row */}
          <View style={styles.bottomRow}>
            {/* + button */}
            <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
              <SymbolView
                name="plus"
                size={18}
                tintColor="rgba(255,255,255,0.6)"
              />
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            {/* Mic button (hidden when text present) */}
            {!hasText && (
              <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                <SymbolView
                  name="mic.fill"
                  size={18}
                  tintColor="rgba(255,255,255,0.6)"
                />
              </TouchableOpacity>
            )}

            {/* Send button */}
            <TouchableOpacity
              style={[
                styles.sendButton,
                hasText && !disabled
                  ? styles.sendButtonActive
                  : styles.sendButtonInactive,
              ]}
              onPress={handleSend}
              disabled={!hasText || disabled}
              activeOpacity={0.8}
            >
              <SymbolView
                name={hasText ? "arrow.up" : "waveform"}
                size={16}
                tintColor={hasText ? "#1C1C1E" : "rgba(255,255,255,0.35)"}
              />
            </TouchableOpacity>
          </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: "#1C1C1E",
  },
  container: {
    backgroundColor: "#2C2C2E",
    borderRadius: 20,
    paddingTop: 14,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  input: {
    color: "#FFFFFF",
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 110,
    minHeight: 22,
    marginBottom: 8,
    padding: 0,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#FFFFFF",
  },
  sendButtonInactive: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
});
