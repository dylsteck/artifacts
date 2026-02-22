# Artifacts

A React Native AI chat app built with Expo Router and the Vercel AI SDK. Stream responses from Claude models with persistent chat history stored locally in SQLite.

## Features

- Real-time streaming chat with Claude (Sonnet, Opus, Haiku)
- Model selector in the header
- Chat history in a slide-out drawer
- SQLite persistence across sessions

## Setup

```bash
bun install
cp .env.example .env.local
# Add your AI_GATEWAY_API_KEY to .env.local (create at vercel.com/dashboard/ai-gateway)
bun run start
```

## Stack

- [Expo Router](https://docs.expo.dev/router/introduction/) — file-based routing + server API routes
- [Vercel AI SDK v6](https://sdk.vercel.ai/docs) — streaming, `useChat`, Anthropic provider
- [expo-sqlite](https://docs.expo.dev/versions/latest/sdk/sqlite/) — local chat persistence
- NativeWind, Reanimated, SF Symbols

## Project Structure

```
src/
├── app/
│   ├── api/chat+api.ts       # POST /api/chat — streaming endpoint
│   └── (home)/
│       ├── index.tsx         # Welcome screen
│       └── chat/[id].tsx     # Active chat screen
├── components/chat/          # ChatInput, MessageBubble, ModelSelector
├── components/drawer/        # Animated sidebar with recent chats
└── lib/                      # db.ts, model-context.tsx, generate-api-url.ts
```

See [AGENTS.md](./AGENTS.md) for a full architecture reference.
