# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Deploy

```bash
# Type-check + build (production)
npx tsc --noEmit --skipLibCheck && node esbuild.config.mjs production

# Deploy to Obsidian desktop vault
cp main.js manifest.json styles.css D:/OB/obsidian/.obsidian/plugins/notebrain/

# Deploy to Android via ADB
MSYS_NO_PATHCONV=1 adb push main.js /storage/emulated/0/Documents/obsidian/.obsidian/plugins/notebrain/main.js
MSYS_NO_PATHCONV=1 adb push manifest.json /storage/emulated/0/Documents/obsidian/.obsidian/plugins/notebrain/manifest.json
MSYS_NO_PATHCONV=1 adb push styles.css /storage/emulated/0/Documents/obsidian/.obsidian/plugins/notebrain/styles.css

# Reload + re-enable (CLI)
obsidian reload && sleep 3 && obsidian eval "app.plugins.enablePlugin('notebrain')"
```

## Architecture

```
main.ts                       Plugin entry — commands, ribbon icons, settings, system prompt builder
  ├── src/api/deepseek.ts         OpenAI-compatible client (chat + stream + tools + thinking)
  ├── src/api/deepseekFim.ts      FIM completions client (beta endpoint, separate base URL)
  ├── src/tools/                  19 tools
  │   ├── registry.ts             Tool registry singleton, API key storage, disable filtering
  │   ├── arxivRateLimit.ts       Shared rate limiter (3s, blocking-style)
  │   └── index.ts                Barrel exports
  ├── src/editor/noteChat.ts      Inline chat engine (parse, unified file-only stream, agent loop, cache)
  ├── src/editor/fimComplete.ts   FIM completion (+-marker, prefix/suffix fill)
  ├── src/chat/cache.ts           In-memory chat cache (30-min TTL, native tool messages)
  ├── src/settings/settings.ts    Tabbed settings UI (Basic / Model / Tools / Note / FIM)
  └── src/settings/i18n.ts        zh/en translations for settings UI
```

**Talk flow:** user types in note → `Ctrl+Shift+Enter` or ribbon icon → `runInlineChat()` → sync editor to file → write header → `runAgentLoop()` with DeepSeek streaming + tool calls → write response to file → switch to reading mode.

**Unified file-only streaming:** all content written to file via `vault.modify()` (80ms batches, configurable). No editor-based writes — eliminates auto-merge races and editor-staleness on tab switch. File is single source of truth. Tool execution pauses file writes to avoid mobile I/O lock.

## Inline chat format

```
user message

%%
user
[Timestamp: ...]
%%

---
%%thinking content%%
[Tool calls]
searchNotes: {"query":"xxx"}
%%
AI response

%%
assistant
[Timestamp: ...]
%%

---
```

All thinking and tool call info within one agent turn share a single `%%...%%` pair. Tool results are passed to API but NOT written to the note. Only close `%%` when real message content appears.

## Chat cache (30-min TTL)

API-native messages (with `tool_calls`, `tool` role, `reasoning_content`) are cached in memory per file. Cache hit → use directly. Cache miss/expired → rebuild from note (user/assistant text only, no thinking history). Reset on each message within 30-min window.

## FIM completion

`+++` marker line in note → cursor on it → trigger FIM (`notebrain-fim` command, pen icon). `+++512` sets custom max tokens. Result replaces the marker. Dedicated API settings (key/base URL/model) separate from chat model.

## Settings tabs

| Tab | Content |
|-----|---------|
| Basic | Language, NOTEBRAIN.md path, write frequency |
| Model | API key, base URL, model, thinking mode, temperature |
| Tools | API keys (Tavily/GitHub/Baidu), headless browser, tool toggles |
| Note | YAML toggle, edit permission tag, note template |
| FIM | FIM-specific API settings, temperature, max tokens, usage docs |

## Tools (19 total)

| Category | Tools |
|----------|-------|
| Vault | `searchNotes`, `readNote`, `listFolder`, `createNote`, `editNote`, `getBacklinks` |
| Time | `getCurrentTime` |
| Web | `webFetch`, `tavilySearch`, `tavilyExtract`, `tavilyCrawl`, `tavilyMap`, `tavilyResearch`, `tavilyResearchGet`, `baiduBaike`, `wikipedia` |
| Academic | `arxivSearch`, `arxivDownload` |
| Code | `githubSearch` |

Each tool exports `RegisteredTool` with `{ definition, execute(args, apiKeys) }`. Tools needing vault access use module-level setter called from `main.ts` onload. External HTTP must use `requestUrl` not `fetch` (CSP — especially critical on mobile).

API keys managed via `setToolApiKeys({ tavilyKey, githubKey, baiduKey })` in registry.

## Key constraints

- **`requestUrl` not `fetch`** — Obsidian CSP blocks `fetch` for external domains. Always use `requestUrl()`. All 19 tools use `requestUrl`.
- **DeepSeek thinking mode** — `reasoning_content` MUST be passed back in subsequent messages after tool calls, or API returns 400. Cache handles this for warm starts.
- **arXiv 3s rate limit** — shared `enforceArxivRateLimit()` in `arxivRateLimit.ts`, used by both `arxivSearch` and `arxivDownload`. Blocking-style: updates `lastRequestTime` before delay to prevent concurrent call overlap.
- **Mobile compatibility** — vanilla DOM only, no React. `requestUrl` mandatory (CSP blocks `fetch`). Tool execution pauses file writes to avoid single-thread I/O deadlock.
- **Tool permission modal** — `createNote` / `editNote` show approval dialog before execution.
- **Session tag** — `#notebrain-session` auto-added to frontmatter after each chat session.
- **NOTEBRAIN.md** — Vault-wide AI instructions, auto-created if missing, injected into system prompt. Path configurable in settings.
- **i18n** — Settings UI supports zh/en via `src/settings/i18n.ts`. Use `tr(key)` helper in settings code.
