import React, { createContext, useContext, useState, type ReactNode } from "react";
import { useSharedValue } from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";
import { Dimensions } from "react-native";

export const DRAWER_WIDTH = Math.min(Dimensions.get("window").width * 0.8, 320);

type DrawerContextType = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  animProgress: SharedValue<number>; // 0 = closed, 1 = fully open
};

const DrawerContext = createContext<DrawerContextType>(null!);

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const animProgress = useSharedValue(0);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <DrawerContext.Provider value={{ isOpen, open, close, toggle, animProgress }}>
      {children}
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
