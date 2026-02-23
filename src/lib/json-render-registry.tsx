import React, { useMemo } from "react";
import {
  defineRegistry,
  standardComponents,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  useStateStore,
} from "@json-render/react-native";
import { catalog } from "./json-render-catalog";

/** Registry mapping catalog components to React Native implementations */
export const { registry } = defineRegistry(catalog, {
  components: {
    Column: standardComponents.Column,
    Paragraph: standardComponents.Paragraph,
    Button: standardComponents.Button,
    Card: standardComponents.Card,
    Heading: standardComponents.Heading,
  },
});

/** Wraps Renderer with required providers for state/actions/visibility */
function JsonRenderProvidersInner({ children }: { children: React.ReactNode }) {
  const { set } = useStateStore();
  const actionHandlers = useMemo(
    () => ({
      setState: async (params: { statePath?: string; value?: unknown }) => {
        if (params?.statePath != null) {
          set(params.statePath, params.value);
        }
      },
    }),
    [set]
  );
  return (
    <VisibilityProvider>
      <ActionProvider handlers={actionHandlers}>{children}</ActionProvider>
    </VisibilityProvider>
  );
}

/** Wraps Renderer with required providers for state/actions/visibility */
export function JsonRenderProviders({
  initialState,
  children,
}: {
  initialState?: Record<string, unknown>;
  children: React.ReactNode;
}) {
  return (
    <StateProvider initialState={initialState}>
      <JsonRenderProvidersInner>{children}</JsonRenderProvidersInner>
    </StateProvider>
  );
}
