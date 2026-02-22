import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import { SymbolView } from "expo-symbols";
import { useModel, type ModelId, MODELS } from "@/lib/model-context";

export function ModelSelector() {
  const { model, setModel, modelInfo } = useModel();
  const [visible, setVisible] = useState(false);

  function handleSelect(id: ModelId) {
    setModel(id);
    setVisible(false);
  }

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
            <View style={styles.menu}>
                {MODELS.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    style={styles.menuItem}
                    onPress={() => handleSelect(m.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.menuItemText}>{m.name}</Text>
                    {model === m.id && (
                      <SymbolView
                        name="checkmark"
                        size={14}
                        tintColor="rgba(255,255,255,0.8)"
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
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  menu: {
    backgroundColor: "#2C2C2E",
    borderRadius: 12,
    minWidth: 200,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuItemText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});
