import "@/global.css";

import { Slot } from "expo-router";
import ThemeProvider from "@/components/theme-provider";

export { ErrorBoundary } from "expo-router";

export default function Layout() {
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}
