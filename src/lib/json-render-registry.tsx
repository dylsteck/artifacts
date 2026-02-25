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

/** Adapt standard components (expect { element }) to defineRegistry format (passes { props }) */
function adapt(
  Component: React.ComponentType<{ element: { props?: unknown }; children?: React.ReactNode }>
) {
  return ({
    props,
    children,
    ...rest
  }: {
    props: Record<string, unknown>;
    children?: React.ReactNode;
    [key: string]: unknown;
  }) => <Component element={{ props }} {...rest} children={children} />;
}

/** Registry mapping catalog components to React Native implementations */
export const { registry } = defineRegistry(catalog, {
  components: {
    Column: adapt(standardComponents.Column),
    Paragraph: adapt(standardComponents.Paragraph),
    Button: adapt(standardComponents.Button),
    Card: adapt(standardComponents.Card),
    Heading: adapt(standardComponents.Heading),
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
