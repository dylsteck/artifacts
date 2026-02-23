import { defineCatalog } from "@json-render/core";
import {
  schema,
  standardComponentDefinitions,
  standardActionDefinitions,
} from "@json-render/react-native";

/** Minimal catalog for chat mode: layout, content, and interactive components */
export const catalog = defineCatalog(schema, {
  components: {
    Column: standardComponentDefinitions.Column,
    Paragraph: standardComponentDefinitions.Paragraph,
    Button: standardComponentDefinitions.Button,
    Card: standardComponentDefinitions.Card,
    Heading: standardComponentDefinitions.Heading,
  },
  actions: standardActionDefinitions,
});
