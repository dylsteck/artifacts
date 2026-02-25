import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput as RNTextInput,
  Switch as RNSwitch,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  defineRegistry,
  StateProvider,
  VisibilityProvider,
  ActionProvider,
  useStateStore,
  useBoundProp,
} from "@json-render/react-native";
import { catalog } from "./json-render-catalog";

/**
 * Dark theme for json-render components.
 * Contrast: primary text 0.9 on secondary bg meets WCAG AA; secondary text 0.6 for hierarchy.
 * Accent #0A84FF (iOS blue) on dark bg for interactive elements.
 */
const DARK_THEME = {
  bg: { primary: "#1C1C1E", secondary: "#2C2C2E", tertiary: "#3A3A3C", input: "#343438" },
  text: {
    primary: "rgba(255,255,255,0.9)",
    secondary: "rgba(255,255,255,0.6)",
    tertiary: "rgba(255,255,255,0.4)",
  },
  border: "#38383A",
  borderFocus: "#48484A",
  borderError: "#dc2626",
  accent: "#0A84FF",
  placeholder: "rgba(255,255,255,0.4)",
} as const;

const buttonSizeStyles = {
  sm: { paddingH: 12, paddingV: 6, fontSize: 13 },
  md: { paddingH: 16, paddingV: 10, fontSize: 15 },
  lg: { paddingH: 24, paddingV: 14, fontSize: 17 },
} as const;

const headingSizes = { h1: 32, h2: 24, h3: 20, h4: 16 } as const;
const labelSizes = { xs: 10, sm: 12, md: 14 } as const;

type ComponentProps = {
  props?: Record<string, unknown>;
  children?: React.ReactNode;
  emit?: (event: string) => void;
  bindings?: Record<string, unknown>;
};

function DarkContainer({ props: p = {}, children }: ComponentProps) {
  return (
    <View
      style={{
        padding: p.padding as number | undefined,
        paddingHorizontal: p.paddingHorizontal as number | undefined,
        paddingVertical: p.paddingVertical as number | undefined,
        margin: p.margin as number | undefined,
        backgroundColor: (p.backgroundColor as string) ?? "transparent",
        borderRadius: p.borderRadius as number | undefined,
        flex: p.flex as number | undefined,
      }}
    >
      {children}
    </View>
  );
}

function DarkRow({ props: p = {}, children }: ComponentProps) {
  const gap = (p.gap as number | undefined) ?? 14;
  return (
    <View
      style={{
        flexDirection: "row",
        gap,
        alignItems: p.alignItems as "flex-start" | "center" | "flex-end" | "stretch" | "baseline" | undefined,
        justifyContent: p.justifyContent as "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly" | undefined,
        flexWrap: p.flexWrap as "wrap" | "nowrap" | undefined,
        padding: p.padding as number | undefined,
        flex: p.flex as number | undefined,
      }}
    >
      {children}
    </View>
  );
}

function DarkColumn({ props: p = {}, children }: ComponentProps) {
  const gap = (p.gap as number | undefined) ?? 14;
  return (
    <View
      style={{
        flexDirection: "column",
        gap,
        alignItems: (p.alignItems as "flex-start" | "center" | "flex-end" | "stretch" | "baseline") ?? "stretch",
        justifyContent: p.justifyContent as "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly" | undefined,
        padding: p.padding as number | undefined,
        flex: p.flex as number | undefined,
      }}
    >
      {children}
    </View>
  );
}

function DarkDivider({ props: p = {} }: ComponentProps) {
  const isVertical = p.direction === "vertical";
  const thickness = (p.thickness as number) ?? 1;
  const color = (p.color as string) ?? DARK_THEME.border;
  return (
    <View
      style={{
        width: isVertical ? thickness : "100%",
        height: isVertical ? "100%" : thickness,
        backgroundColor: color,
        marginVertical: isVertical ? 0 : (p.margin as number) ?? 8,
        marginHorizontal: isVertical ? (p.margin as number) ?? 8 : 0,
      }}
    />
  );
}

function DarkParagraph({ props: p = {} }: ComponentProps) {
  const fontSize = (p.fontSize as number) ?? 16;
  return (
    <Text
      numberOfLines={p.numberOfLines as number | undefined}
      style={{
        fontSize,
        lineHeight: fontSize * 1.45,
        color: (p.color as string) ?? DARK_THEME.text.primary,
        textAlign: (p.align as "left" | "center" | "right") ?? "left",
      }}
    >
      {String(p.text ?? "")}
    </Text>
  );
}

function DarkHeading({ props: p = {} }: ComponentProps) {
  const level = (p.level as keyof typeof headingSizes) ?? "h2";
  const size = headingSizes[level];
  return (
    <Text
      style={{
        fontSize: size,
        lineHeight: size * 1.3,
        fontWeight: "700",
        color: (p.color as string) ?? DARK_THEME.text.primary,
        textAlign: (p.align as "left" | "center" | "right") ?? "left",
      }}
    >
      {String(p.text ?? "")}
    </Text>
  );
}

function DarkLabel({ props: p = {} }: ComponentProps) {
  const size = (p.size as keyof typeof labelSizes) ?? "sm";
  const fontSize = labelSizes[size];
  return (
    <Text
      style={{
        fontSize,
        lineHeight: fontSize * 1.4,
        fontWeight: p.bold ? "600" : "400",
        color: (p.color as string) ?? DARK_THEME.text.secondary,
      }}
    >
      {String(p.text ?? "")}
    </Text>
  );
}

function DarkCard({ props: p = {}, children }: ComponentProps) {
  const padding = (p.padding as number) ?? 20;
  const bgColor = (p.backgroundColor as string) ?? DARK_THEME.bg.secondary;
  const elevated = p.elevated !== false;
  const shadowStyle =
    Platform.OS === "ios" && elevated
      ? {
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 4,
        }
      : Platform.OS === "android" && elevated
        ? { elevation: 4 }
        : {};
  return (
    <View
      style={{
        backgroundColor: bgColor,
        borderRadius: (p.borderRadius as number) ?? 16,
        padding,
        borderWidth: 1,
        borderColor: DARK_THEME.border,
        overflow: "hidden",
        ...shadowStyle,
      }}
    >
      {p.title ? (
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: DARK_THEME.text.primary,
            marginBottom: p.subtitle ? 4 : 16,
          }}
        >
          {String(p.title)}
        </Text>
      ) : null}
      {p.subtitle ? (
        <Text
          style={{
            fontSize: 14,
            color: DARK_THEME.text.secondary,
            marginBottom: 16,
          }}
        >
          {String(p.subtitle)}
        </Text>
      ) : null}
      {children}
    </View>
  );
}

function DarkButton({ props: p = {}, emit = () => {} }: ComponentProps) {
  const variant = (p.variant as string) ?? "primary";
  const sizeKey = (p.size as keyof typeof buttonSizeStyles) ?? "md";
  const size = buttonSizeStyles[sizeKey];
  const disabled = Boolean(p.disabled || p.loading);

  const variantStyles: Record<
    string,
    { bg: string; text: string; border?: string }
  > = {
    primary: { bg: DARK_THEME.accent, text: "#ffffff" },
    secondary: { bg: DARK_THEME.bg.tertiary, text: "#ffffff" },
    danger: { bg: "#dc2626", text: "#ffffff" },
    outline: {
      bg: "transparent",
      text: DARK_THEME.accent,
      border: DARK_THEME.accent,
    },
    ghost: { bg: "transparent", text: DARK_THEME.text.primary },
  };
  const v = variantStyles[variant] ?? variantStyles.primary;

  return (
    <Pressable
      disabled={disabled}
      onPress={() => emit("press")}
      style={({ pressed }) => ({
        backgroundColor: v.bg,
        paddingHorizontal: size.paddingH,
        paddingVertical: size.paddingV,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        transform: [{ scale: disabled ? 1 : pressed ? 0.98 : 1 }],
        borderWidth: v.border ? 1 : 0,
        borderColor: v.border,
        alignSelf: "stretch",
        minHeight: 48,
      })}
    >
      {p.loading ? (
        <ActivityIndicator
          size="small"
          color={v.text}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text
        style={{
          color: v.text,
          fontSize: size.fontSize,
          fontWeight: "600",
        }}
      >
        {String(p.label ?? "")}
      </Text>
    </Pressable>
  );
}

function DarkTextInput({ props: p = {}, bindings }: ComponentProps) {
  const [focused, setFocused] = useState(false);
  const [boundValue, setBoundValue] = useBoundProp(
    p.value,
    bindings?.value as string | undefined
  );
  const displayValue = (boundValue ?? "") as string;
  const hasError = Boolean(p.error);
  const borderColor = hasError
    ? DARK_THEME.borderError
    : focused
      ? DARK_THEME.borderFocus
      : DARK_THEME.border;

  return (
    <View style={[p.flex != null ? { flex: p.flex as number } : undefined, { marginBottom: 2 }]}>
      {p.label ? (
        <Text
          style={{
            fontSize: 14,
            fontWeight: "500",
            color: DARK_THEME.text.secondary,
            marginBottom: 6,
          }}
        >
          {String(p.label)}
        </Text>
      ) : null}
      <RNTextInput
        placeholder={p.placeholder as string | undefined}
        placeholderTextColor={DARK_THEME.placeholder}
        value={displayValue}
        onChangeText={bindings?.value ? setBoundValue : undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!p.disabled}
        secureTextEntry={Boolean(p.secureTextEntry)}
        keyboardType={((p.keyboardType as string) ?? "default") as "default" | "email-address" | "numeric" | "phone-pad" | "url"}
        multiline={Boolean(p.multiline)}
        numberOfLines={p.numberOfLines as number | undefined}
        style={[
          {
            borderWidth: 1,
            borderColor,
            borderRadius: 10,
            paddingHorizontal: 14,
            paddingVertical: 12,
            fontSize: 16,
            color: DARK_THEME.text.primary,
            backgroundColor: p.disabled ? DARK_THEME.bg.tertiary : DARK_THEME.bg.input,
            opacity: p.disabled ? 0.6 : 1,
          },
          p.multiline && {
            minHeight: ((p.numberOfLines as number) ?? 3) * 20,
            textAlignVertical: "top",
          },
        ]}
      />
    </View>
  );
}

function DarkSwitch({ props: p = {}, bindings }: ComponentProps) {
  const [checked, setChecked] = useBoundProp(
    p.checked,
    bindings?.checked as string | undefined
  );
  const displayValue = checked ?? false;
  const isDisabled = Boolean(p.disabled);

  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <RNSwitch
        value={Boolean(displayValue)}
        onValueChange={bindings?.checked ? setChecked : undefined}
        disabled={isDisabled}
        trackColor={{
          false: isDisabled ? DARK_THEME.border : DARK_THEME.borderFocus,
          true: isDisabled ? DARK_THEME.border : DARK_THEME.accent,
        }}
        thumbColor={isDisabled ? "#636366" : "#ffffff"}
      />
      {p.label ? (
        <Text
          style={{
            fontSize: 16,
            color: isDisabled
              ? DARK_THEME.text.secondary
              : DARK_THEME.text.primary,
          }}
        >
          {String(p.label)}
        </Text>
      ) : null}
    </View>
  );
}

function DarkPlaceholder({ props: p = {} }: ComponentProps) {
  const label = (p.label as string) ?? (p.id as string) ?? "";
  if (!label) return null;
  return (
    <View style={{ paddingVertical: 4 }}>
      <Text
        style={{
          fontSize: 14,
          color: DARK_THEME.text.secondary,
        }}
      >
        {String(label)}
      </Text>
    </View>
  );
}

function DarkCheckbox({ props: p = {}, bindings }: ComponentProps) {
  const [checked, setChecked] = useBoundProp(
    p.checked,
    bindings?.checked as string | undefined
  );
  const isChecked = checked ?? false;

  return (
    <Pressable
      disabled={Boolean(p.disabled)}
      onPress={() => {
        if (bindings?.checked) {
          setChecked(!isChecked);
        }
      }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        opacity: p.disabled ? 0.5 : 1,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 2,
          borderColor: isChecked ? DARK_THEME.accent : DARK_THEME.borderFocus,
          backgroundColor: isChecked ? DARK_THEME.accent : DARK_THEME.bg.input,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {isChecked ? (
          <Text
            style={{
              color: "#ffffff",
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            ✓
          </Text>
        ) : null}
      </View>
      {p.label ? (
        <Text
          style={{
            fontSize: 16,
            color: DARK_THEME.text.primary,
          }}
        >
          {String(p.label)}
        </Text>
      ) : null}
    </Pressable>
  );
}

/** Registry mapping catalog components to dark-theme React Native implementations */
export const { registry } = defineRegistry(catalog, {
  components: {
    Column: DarkColumn,
    Row: DarkRow,
    Container: DarkContainer,
    Divider: DarkDivider,
    Paragraph: DarkParagraph,
    Heading: DarkHeading,
    Label: DarkLabel,
    Card: DarkCard,
    Button: DarkButton,
    TextInput: DarkTextInput,
    Switch: DarkSwitch,
    Checkbox: DarkCheckbox,
    Placeholder: DarkPlaceholder,
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
