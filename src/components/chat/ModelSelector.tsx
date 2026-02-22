import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useModel, MODELS, type ModelId } from "@/lib/model-context";

export function ModelSelector() {
  const { model, setModel, modelInfo } = useModel();
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={styles.trigger}
        activeOpacity={0.7}
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
        <Pressable
          style={styles.backdrop}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>Select Model</Text>
            {MODELS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[
                  styles.modelOption,
                  m.id === model && styles.modelOptionSelected,
                ]}
                onPress={() => {
                  setModel(m.id as ModelId);
                  setVisible(false);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.modelOptionContent}>
                  <Text style={styles.modelOptionName}>{m.name}</Text>
                  <Text style={styles.modelOptionContext}>{m.context}</Text>
                </View>
                {m.id === model && (
                  <SymbolView
                    name="checkmark"
                    size={16}
                    tintColor="#E0745A"
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#2C2C2E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  modelOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 2,
  },
  modelOptionSelected: {
    backgroundColor: "rgba(224,116,90,0.15)",
  },
  modelOptionContent: {
    flex: 1,
  },
  modelOptionName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  modelOptionContext: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    marginTop: 2,
  },
});
