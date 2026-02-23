import { DarkTheme, ThemeProvider as RNTheme } from "@react-navigation/native";
import React from "react";

export default function ThemeProvider(props: { children: React.ReactNode }) {
  return <RNTheme value={DarkTheme}>{props.children}</RNTheme>;
}
