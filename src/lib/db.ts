import type { SQLiteDatabase } from "expo-sqlite";

export async function initDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS chats (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL DEFAULT 'New Chat',
      model TEXT NOT NULL DEFAULT 'claude-sonnet-4-6',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY NOT NULL,
      chat_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
    );
  `);
}

export async function createChat(
  db: SQLiteDatabase,
  { model }: { model: string }
): Promise<string> {
  const id = `chat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = Date.now();
  await db.runAsync(
    "INSERT INTO chats (id, title, model, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
    [id, "New Chat", model, now, now]
  );
  return id;
}

export async function updateChatTitle(
  db: SQLiteDatabase,
  id: string,
  title: string
) {
  await db.runAsync(
    "UPDATE chats SET title = ?, updated_at = ? WHERE id = ?",
    [title.slice(0, 60), Date.now(), id]
  );
}

export async function deleteChat(db: SQLiteDatabase, id: string) {
  await db.runAsync("DELETE FROM chats WHERE id = ?", [id]);
}

export async function getRecentChats(
  db: SQLiteDatabase
): Promise<{ id: string; title: string; model: string; updated_at: number }[]> {
  return db.getAllAsync(
    "SELECT id, title, model, updated_at FROM chats ORDER BY updated_at DESC LIMIT 50"
  ) as any;
}

export async function saveMessage(
  db: SQLiteDatabase,
  {
    chatId,
    role,
    content,
  }: { chatId: string; role: string; content: string }
) {
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const now = Date.now();
  await db.runAsync(
    "INSERT INTO messages (id, chat_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)",
    [id, chatId, role, content, now]
  );
  await db.runAsync("UPDATE chats SET updated_at = ? WHERE id = ?", [now, chatId]);
}

export async function getChatMessages(
  db: SQLiteDatabase,
  chatId: string
): Promise<{ id: string; role: string; content: string; created_at: number }[]> {
  return db.getAllAsync(
    "SELECT id, role, content, created_at FROM messages WHERE chat_id = ? ORDER BY created_at ASC",
    [chatId]
  ) as any;
}
