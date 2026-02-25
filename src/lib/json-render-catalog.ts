import { z } from "zod";
import { defineCatalog } from "@json-render/core";
import {
  schema,
  standardComponentDefinitions,
  standardActionDefinitions,
} from "@json-render/react-native";

/** Placeholder for missing or generic elements (e.g. like-count) */
const PlaceholderDefinition = {
  props: z.object({
    label: z.string().optional(),
    id: z.string().optional(),
  }),
};

/** Catalog for chat mode: layout, content, form, and interactive components */
export const catalog = defineCatalog(schema, {
  components: {
    // Layout
    Column: standardComponentDefinitions.Column,
    Row: standardComponentDefinitions.Row,
    Container: standardComponentDefinitions.Container,
    Divider: standardComponentDefinitions.Divider,
    // Content
    Paragraph: standardComponentDefinitions.Paragraph,
    Heading: standardComponentDefinitions.Heading,
    Label: standardComponentDefinitions.Label,
    // Form
    TextInput: standardComponentDefinitions.TextInput,
    Switch: standardComponentDefinitions.Switch,
    Checkbox: standardComponentDefinitions.Checkbox,
    // Interactive
    Button: standardComponentDefinitions.Button,
    Card: standardComponentDefinitions.Card,
    // Utility
    Placeholder: PlaceholderDefinition,
  },
  actions: standardActionDefinitions,
});
