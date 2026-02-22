# AGENTS.md: Artifacts Chat Application

## 1. Project Overview

**Artifacts** is a cross-platform AI chat application built with **Expo Router** and **React Native**, providing real-time conversation with multiple Anthropic Claude models. The app demonstrates a production-grade architecture for integrating the **Anthropic AI SDK v6** with local data persistence using **SQLite**.

### Tech Stack

- **Framework**: Expo Router 6.0 + React Native 0.81.4
- **Language**: TypeScript
- **UI Framework**: NativeWind (Tailwind CSS for React Native)
- **AI Integration**:
  - `ai` (v6.0.97) — Vercel AI SDK core streaming/transport layer
  - `@ai-sdk/anthropic` (v3.0.46) — Anthropic model provider
  - `@ai-sdk/react` (v3.0.99) — `useChat` hook for client-side chat management
- **Database**: SQLite via `expo-sqlite` (16.0.10) with WAL mode
- **Animation**: Reanimated 4.1 + Gesture Handler 2.30
- **Icons**: SF Symbols via `expo-symbols`
- **Colors**: Apple system colors via `@bacons/apple-colors`
- **Platform Support**: iOS, Android, Web

---

## 2. Architecture

### Routing Layout (Expo Router)

```
src/app/
├── _layout.tsx                    # Root layout (SQLiteProvider, DrawerProvider)
├── api/
│   └── chat+api.ts               # Server-side POST handler for streaming
└── (home)/
    ├── _layout.tsx               # Stack layout with ModelProvider
    ├── index.tsx                 # Home/welcome screen
    ├── artifacts.tsx             # Artifacts page (stub)
    ├── modal.tsx                 # Modal view (stub)
    └── chat/
        └── [id].tsx              # Chat screen (dynamic route)
```

The app uses **Expo Router's file-based routing** with:
- **Stack-based navigation** within the home group
- **Dynamic routes** (`[id]`) for individual chat screens
- **Drawer navigation** as an overlay (not part of Stack)
- **Server-side API route** (`chat+api.ts`) for streaming responses

### Data Flow Architecture

```
HOME SCREEN
  → createChat(db, { model })     ← SQLite INSERT
  → navigate to /chat/[id]

CHAT SCREEN
  → loadMessages from SQLite
  → sendMessage({ text })
      → saveMessage(user msg)     ← SQLite INSERT
      → POST /api/chat + model
          → streamText(anthropic)
          → toUIMessageStreamResponse()
      ← chunks stream back to useChat
      → onFinish: saveMessage(assistant msg) ← SQLite INSERT

DRAWER
  → isOpen → getRecentChats(db) → render list
  → tap → router.push(/chat/[id])
  → trash → deleteChat(db, id)
```

### Context Hierarchy

```
GestureHandlerRootView
  └── SQLiteProvider (artifacts.db)
        └── DrawerProvider
              └── AppContent
                    └── ModelProvider  ← only in (home) group
                          └── Stack screens
```

---

## 3. AI Integration

### useChat Hook (`src/app/(home)/chat/[id].tsx`)

```typescript
const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({
    api: generateAPIUrl("/api/chat"),
    fetch: expoFetch as unknown as typeof globalThis.fetch,
    body: { model },
  }),
  onFinish: async ({ message }) => {
    const textContent = message.parts
      .filter((p) => p.type === "text")
      .map((p) => (p as { type: "text"; text: string }).text)
      .join("");
    await saveMessage(db, { chatId: id, role: "assistant", content: textContent });
  },
});
```

**Key points**:
- `expo/fetch` polyfill is required — native `fetch` may not support proper streaming on React Native
- `body: { model }` injects the selected model into every request
- `onFinish` fires once when streaming completes; extract text from `message.parts`

### UIMessage Structure (AI SDK v6)

```typescript
interface UIMessage {
  id: string;
  role: "user" | "assistant";
  parts: Array<{ type: "text"; text: string } | ...>; // multimodal-ready
}
```

**Important**: v6 uses `parts` array, NOT a flat `content` string. Always filter by type:
```typescript
const text = msg.parts
  .filter((p) => p.type === "text")
  .map((p) => (p as { type: "text"; text: string }).text)
  .join("");
```

### sendMessage API

```typescript
sendMessage({ text: "Hello" });         // text shorthand
sendMessage({ parts: [...] });           // explicit parts
```

### Status Values

| Value | Meaning |
|-------|---------|
| `"ready"` | Idle, ready for new input |
| `"submitted"` | POST sent, awaiting stream start |
| `"streaming"` | Chunks arriving |
| `"error"` | Request failed |

### API Route (`src/app/api/chat+api.ts`)

```typescript
export async function POST(req: Request) {
  const { messages, model } = await req.json();
  const result = streamText({
    model: createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })(model),
    messages: await convertToModelMessages(messages),  // async in v6!
    maxOutputTokens: 4096,
  });
  return result.toUIMessageStreamResponse({
    headers: { "Content-Type": "application/octet-stream", "Content-Encoding": "none" },
  });
}
```

**Key notes**:
- `convertToModelMessages` is **async** in v6 — always `await` it
- Use `maxOutputTokens` not `maxTokens` (renamed in v6)
- Headers prevent HTTP compression from breaking streaming

---

## 4. SQLite Persistence (`src/lib/db.ts`)

### Schema

```sql
chats(id TEXT PK, title TEXT, model TEXT, created_at INTEGER, updated_at INTEGER)
messages(id TEXT PK, chat_id TEXT FK→chats.id ON DELETE CASCADE, role TEXT, content TEXT, created_at INTEGER)
```

### ID Generation Pattern

```typescript
const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
```

### Exported Functions

| Function | Description |
|----------|-------------|
| `initDb(db)` | Create tables + enable WAL; called once on app start via `SQLiteProvider.onInit` |
| `createChat(db, { model })` | Insert new chat row, return `id` |
| `updateChatTitle(db, id, title)` | Set title from first message (≤60 chars) |
| `deleteChat(db, id)` | Remove chat + all messages (CASCADE) |
| `getRecentChats(db)` | Last 50 chats sorted by `updated_at DESC` |
| `saveMessage(db, { chatId, role, content })` | Insert message + update `chats.updated_at` |
| `getChatMessages(db, chatId)` | All messages for a chat, chronological order |

### Persistence Order

1. **User message saved BEFORE `sendMessage()`** — ensures history even if API fails
2. **Assistant message saved in `onFinish`** — saves complete (not partial) response

---

## 5. Model Context (`src/lib/model-context.tsx`)

```typescript
export const MODELS = [
  { id: "claude-sonnet-4-6",       name: "Sonnet 4.6", context: "Standard" },
  { id: "claude-opus-4-6",          name: "Opus 4.6",   context: "Extended" },
  { id: "claude-haiku-4-5-20251001", name: "Haiku 4.5", context: "Standard" },
] as const;
```

- Default model: `claude-sonnet-4-6`
- `ModelProvider` wraps only the `(home)` stack (not global)
- `useModel()` returns `{ model, setModel, modelInfo }`
- Model is passed via `DefaultChatTransport.body` — not in URL

---

## 6. Typed Routes

Expo Router typed routes are defined in `.expo/types/router.d.ts`. This file is auto-generated but was manually updated to include `chat/[id]`:

```typescript
{ pathname: `${'/(home)'}/chat/[id]` | `/chat/[id]`; params: { id: string | number; initialMessage?: string }; }
```

To navigate type-safely:
```typescript
router.push({ pathname: "/chat/[id]", params: { id, initialMessage } });
```

---

## 7. Key Patterns

### Double-Send Prevention

```typescript
const initialSent = useRef(false);
const titleSet = useRef(false);

useEffect(() => {
  if (!initialSent.current && initialMessage) {
    initialSent.current = true;
    handleSend(initialMessage);
  }
}, [id]);
```

Refs survive re-renders and prevent React 18 strict mode from double-firing effects.

### Auto-Title from First Message

```typescript
useEffect(() => {
  if (!titleSet.current && messages.length > 0) {
    const firstUser = messages.find((m) => m.role === "user");
    const textPart = firstUser?.parts.find((p) => p.type === "text") as { type: "text"; text: string } | undefined;
    const title = textPart?.text?.slice(0, 50).trim();
    if (title) {
      titleSet.current = true;
      updateChatTitle(db, id, title);
      navigation.setOptions({ title });
    }
  }
}, [messages]);
```

### Drawer Recent Chats Refresh

```typescript
useEffect(() => {
  if (isOpen) {
    getRecentChats(db).then(setRecentChats);
  }
}, [isOpen]);
```

Fetches fresh data every time drawer opens — no stale cache.

### String Conversion for Apple Colors

```typescript
// AC.label is OpaqueColorValue (platform-specific), not string
fill={String(AC.label)}   // ✅ correct for web SVG fill
```

---

## 8. Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `ANTHROPIC_API_KEY` | `.env.local` (server only) | Anthropic API authentication |
| `EXPO_PUBLIC_API_BASE_URL` | `.env.local` (client) | Base URL for API calls (empty = same origin) |

Set in `.env.local`:
```
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
# EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
```

---

## 9. Common Gotchas & Fixes

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| `content` missing on UIMessage | v6 uses `parts` not `content` | Filter `parts` by `type === "text"` |
| `maxTokens` TS error | Renamed in v6 | Use `maxOutputTokens` |
| `convertToModelMessages` type error | Returns `Promise` in v6 | Always `await` it |
| Double initial message | React 18 strict mode | Guard with `useRef(false)` |
| Typed route error for `/chat/[id]` | `.expo/types/router.d.ts` not regenerated | Manually add route entry |
| Streaming stops on native | Native fetch doesn't support proper streaming | Use `expo/fetch` polyfill |
| `OpaqueColorValue` SVG error | `AC.label` is not a string | Wrap with `String(AC.label)` |

---

## 10. File Reference

| File | Purpose |
|------|---------|
| `src/app/_layout.tsx` | Root: SQLiteProvider + DrawerProvider |
| `src/app/api/chat+api.ts` | POST /api/chat streaming endpoint |
| `src/app/(home)/_layout.tsx` | Stack + ModelProvider + header model selector |
| `src/app/(home)/index.tsx` | Welcome screen + chat creation |
| `src/app/(home)/chat/[id].tsx` | Active chat + useChat + persistence |
| `src/components/chat/ChatInput.tsx` | Multi-line input + send/mic buttons |
| `src/components/chat/MessageBubble.tsx` | User/assistant message display |
| `src/components/chat/ModelSelector.tsx` | Header model picker modal |
| `src/components/drawer/Drawer.tsx` | Animated sidebar + recent chats |
| `src/components/drawer/DrawerContext.tsx` | Drawer state + Reanimated shared value |
| `src/lib/db.ts` | All SQLite schema + query functions |
| `src/lib/model-context.tsx` | Model list + provider + useModel hook |
| `src/lib/generate-api-url.ts` | API URL construction |
| `src/lib/utils.ts` | `cn()`, `AppleStackPreset`, `launchApp()` |
| `.expo/types/router.d.ts` | Typed route definitions (manually maintained) |
