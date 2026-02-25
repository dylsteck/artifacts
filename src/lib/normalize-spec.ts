import type { Spec } from "@json-render/core";

/**
 * Ensures every element in the spec has a valid `props` object.
 * The json-render library's resolveElementProps expects props to be an object;
 * when the LLM omits props (e.g. { type: "Row", children: [...] }), element.props
 * is undefined, causing "Cannot convert undefined value to object".
 */
export function normalizeSpec(spec: Spec): Spec {
  if (!spec?.elements) return spec;
  const elements: Record<string, unknown> = {};
  for (const [key, element] of Object.entries(spec.elements)) {
    const el = element as Record<string, unknown>;
    elements[key] = {
      ...el,
      props: el.props != null && typeof el.props === "object" ? el.props : {},
    };
  }
  return { ...spec, elements };
}
