import { Stack } from "expo-router";
import { LaunchButton } from "@/components/launch-button";
import { AppleStackPreset } from "@/lib/utils";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { TouchableOpacity } from "react-native";
import * as AC from "@bacons/apple-colors";
import { useDrawer } from "@/components/drawer/DrawerContext";

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
        fill={AC.label}
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
    <Stack screenOptions={AppleStackPreset}>
      <Stack.Screen
        name="index"
        options={{
          title: "ACME",

          headerLeft: () => (
            <div className="web:px-4">
              <OptionsButton />
            </div>
          ),

          headerRight: () => (
            <div className="web:px-4">
              <LaunchButton />
            </div>
          ),
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          title: "Ask AI",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: isLiquidGlassAvailable()
            ? {
                backgroundColor: "transparent",
              }
            : undefined,
          headerLargeTitle: false,
          sheetAllowedDetents: [0.25, 0.5],
          sheetGrabberVisible: true,
          presentation: "formSheet",
        }}
      />
    </Stack>
  );
}
