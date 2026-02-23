import { Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import { useDrawer } from "@/components/drawer/DrawerContext";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { ModelProvider } from "@/lib/model-context";
import { AppleStackPreset } from "@/lib/utils";

function OptionsButton() {
  const { open } = useDrawer();
  return (
    <TouchableOpacity
      onPress={open}
      className="w-10 h-10 items-center justify-center"
    >
      <svg
        viewBox="0 0 22 16"
        width="22"
        height="16"
        fill="currentColor"
        style={{ color: "#ffffff" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect y="0" width="22" height="2" rx="1" />
        <rect y="7" width="22" height="2" rx="1" />
        <rect y="14" width="22" height="2" rx="1" />
      </svg>
    </TouchableOpacity>
  );
}

export { ErrorBoundary } from "expo-router";

export default function Layout() {
  return (
    <ModelProvider>
      <Stack screenOptions={AppleStackPreset}>
        <Stack.Screen
          name="index"
          options={{
            title: "",
            headerTitle: () => <ModelSelector />,
            headerLeft: () => (
              <div className="web:px-4">
                <OptionsButton />
              </div>
            ),
          }}
        />
        <Stack.Screen
          name="artifacts"
          options={{
            title: "Artifacts",
            contentStyle: { backgroundColor: "#1C1C1E" },
            headerLeft: () => (
              <div className="web:px-4">
                <OptionsButton />
              </div>
            ),
          }}
        />
        <Stack.Screen
          name="chat/[id]"
          options={{
            title: "Chat",
            headerTitle: () => <ModelSelector />,
            headerLeft: () => (
              <div className="web:px-4">
                <OptionsButton />
              </div>
            ),
            headerBackButtonDisplayMode: "minimal",
            headerLargeTitle: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            title: "Ask AI",
            headerTitleStyle: { fontWeight: "bold" },
            headerLargeTitle: false,
            sheetAllowedDetents: [0.25, 0.5],
            sheetGrabberVisible: true,
            presentation: "formSheet",
          }}
        />
      </Stack>
    </ModelProvider>
  );
}
