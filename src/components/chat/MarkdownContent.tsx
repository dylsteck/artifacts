import React from "react";
import Markdown from "react-native-markdown-display";

type MarkdownContentProps = {
  content: string;
  isStreaming?: boolean;
};

export function MarkdownContent({ content, isStreaming = false }: MarkdownContentProps) {
  const displayContent = isStreaming ? content + "▋" : content;

  return (
    <Markdown style={markdownStyles}>{displayContent}</Markdown>
  );
}

const markdownStyles = {
  body: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 16,
    lineHeight: 24,
    backgroundColor: "transparent",
  },
  heading1: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700" as const,
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 32,
  },
  heading2: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700" as const,
    marginTop: 10,
    marginBottom: 5,
    lineHeight: 28,
  },
  heading3: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600" as const,
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 26,
  },
  heading4: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600" as const,
    marginTop: 6,
    marginBottom: 4,
    lineHeight: 24,
  },
  heading5: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600" as const,
    marginTop: 6,
    marginBottom: 4,
  },
  heading6: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600" as const,
    marginTop: 6,
    marginBottom: 4,
  },
  strong: {
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  em: {
    fontStyle: "italic" as const,
    color: "rgba(255,255,255,0.9)",
  },
  code_inline: {
    fontFamily: "Menlo",
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "#2C2C2E",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  fence: {
    fontFamily: "Menlo",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  code_block: {
    fontFamily: "Menlo",
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    backgroundColor: "#2C2C2E",
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
    flexDirection: "row" as const,
  },
  bullet_list_icon: {
    color: "rgba(255,255,255,0.6)",
    marginRight: 6,
  },
  ordered_list_icon: {
    color: "rgba(255,255,255,0.6)",
    marginRight: 6,
  },
  blockquote: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderLeftColor: "rgba(255,255,255,0.3)",
    borderLeftWidth: 3,
    paddingLeft: 12,
    paddingVertical: 4,
    marginVertical: 6,
    borderRadius: 2,
  },
  hr: {
    backgroundColor: "rgba(255,255,255,0.15)",
    height: 1,
    marginVertical: 12,
  },
  link: {
    color: "#64B5F6",
    textDecorationLine: "underline" as const,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 6,
  },
};
