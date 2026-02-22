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

## Debugging

**Where to see logs:**
- **Terminal** (where `bun run start` runs): API logs (`[LLM] chunk:`, `[LLM] reasoning:`), client logs (`[LLM] Stream:`, `[LLM] Complete:`), and errors (`[LLM] Error:`)
- **Physical device**: Same terminal — Expo pipes device logs there. If you don't see logs, ensure the device is on the same Wi‑Fi as your machine and that `EXPO_PUBLIC_API_BASE_URL` is unset (the app auto-detects the dev server)

**No LLM response / stuck on "Thinking...":**
- Check the terminal for errors. If you see `[LLM] Error:`, the message will describe the failure (e.g. network, API key, CORS)
- On a physical device, the app uses the dev server URL from the manifest. If it still fails, set `EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP:8081` in `.env.local` (replace with your machine's IP)
