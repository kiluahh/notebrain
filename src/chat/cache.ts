/**
 * In-memory chat cache with 30-minute TTL.
 * Stores API-native messages (with tool_calls, tool results, reasoning_content)
 * so we don't need to re-parse %% blocks from notes.
 */

const TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  messages: any[];
  lastActivity: number;
  timer: ReturnType<typeof setTimeout> | null;
}

const store = new Map<string, CacheEntry>();

function resetTimer(filePath: string, entry: CacheEntry) {
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => {
    store.delete(filePath);
  }, TTL_MS);
}

/** Get cached messages for a file, or null if expired / not found. Resets TTL. */
export function getCache(filePath: string): any[] | null {
  const entry = store.get(filePath);
  if (!entry) return null;
  const elapsed = Date.now() - entry.lastActivity;
  if (elapsed > TTL_MS) {
    store.delete(filePath);
    if (entry.timer) clearTimeout(entry.timer);
    return null;
  }
  entry.lastActivity = Date.now();
  resetTimer(filePath, entry);
  return entry.messages;
}

/** Store or update cached messages. Starts / resets TTL. */
export function setCache(filePath: string, messages: any[]) {
  const existing = store.get(filePath);
  if (existing?.timer) clearTimeout(existing.timer);

  const entry: CacheEntry = {
    messages,
    lastActivity: Date.now(),
    timer: null,
  };
  resetTimer(filePath, entry);
  store.set(filePath, entry);
}

/** Explicitly clear cache for a file. */
export function clearCache(filePath: string) {
  const entry = store.get(filePath);
  if (entry?.timer) clearTimeout(entry.timer);
  store.delete(filePath);
}
