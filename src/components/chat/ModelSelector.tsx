import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useModel, type ModelId, MODELS } from "@/lib/model-context";

const HEADER_HEIGHT = 52;

export function ModelSelector() {
  const { model, setModel, modelInfo } = useModel();
  const [visible, setVisible] = useState(false);
  const insets = useSafeAreaInsets();

  function handleSelect(id: ModelId) {
    setModel(id);
    setVisible(false);
  }

  const menuTop = insets.top + HEADER_HEIGHT;

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Select model. Current: ${modelInfo.name}`}
      >
        <View style={styles.triggerInner}>
          <View style={styles.titleRow}>
            <Text style={styles.modelName}>{modelInfo.name}</Text>
            <SymbolView
              name="chevron.down"
              size={11}
              tintColor="rgba(255,255,255,0.6)"
              style={{ marginTop: 1 }}
            />
          </View>
          <Text style={styles.contextLabel}>{modelInfo.context}</Text>
        </View>
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() => setVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            Keyboard.dismiss();
            setVisible(false);
          }}
        >
          <View style={styles.overlay}>
            <View style={[styles.menu, { top: menuTop }]}>
              {MODELS.map((m, i) => (
                <TouchableOpacity
                  key={m.id}
                  style={[
                    styles.menuItem,
                    model === m.id && styles.menuItemSelected,
                    i === MODELS.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={() => handleSelect(m.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemName}>{m.name}</Text>
                    <Text style={styles.menuItemContext}>{m.context}</Text>
                  </View>
                  {model === m.id && (
                    <SymbolView
                      name="checkmark.circle"
                      size={20}
                      tintColor="rgba(255,255,255,0.5)"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    alignItems: "center",
    justifyContent: "center",
  },
  triggerInner: {
    alignItems: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  modelName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  contextLabel: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    fontWeight: "500",
    marginTop: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  menu: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: Platform.select({
      ios: "rgba(44,44,46,0.98)",
      default: "#2C2C2E",
    }),
    borderRadius: 14,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      default: {
        elevation: 8,
      },
    }),
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(255,255,255,0.08)",
  },
  menuItemSelected: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  menuItemContext: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
});
