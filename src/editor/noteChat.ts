import { App, Editor, MarkdownView, Modal, Notice, TFile } from "obsidian";
import { DeepSeekClient, type ToolDefinition } from "../api/deepseek";
import { getToolDefinitions, getAllTools, toolApiKeys } from "../tools";
import type NotebrainPlugin from "../../main";
import { getCache, setCache } from "../chat/cache";

interface ConversationTurn {
  userText: string;
  userContext: string[];
  timestamp: string;
  assistantText: string;
  thinkingText: string;
  startOffset: number;
  endOffset: number;
}

const TURN_SEP_RE = /\n---\n/;
const USER_OPEN = "\n%%\nuser\n";
const ASSISTANT_OPEN = "\n%%\nassistant\n";
const BLOCK_CLOSE = "\n%%";

const SESSION_TAG = "notebrain-session";

function stripYamlFrontmatter(content: string): string {
  return content.replace(/^---[\s\S]*?---\n*/, "");
}

async function ensureSessionTag(file: TFile, app: App) {
  // Check cache first
  const cache = app.metadataCache.getFileCache(file);
  const inlineTags = (cache?.tags || []).map((t: any) => t.tag.replace(/^#/, ""));
  const fmTags: string[] = (cache?.frontmatter?.tags as any[])?.map((t: any) => String(t)) || [];
  const allTags = [...inlineTags, ...fmTags];
  if (allTags.some((t) => t === SESSION_TAG || t === `#${SESSION_TAG}`)) return;

  // Cache might not be ready — check raw content
  try {
    const raw = await app.vault.read(file);
    if (raw.includes(`#${SESSION_TAG}`) || raw.includes(SESSION_TAG)) return;

    await app.vault.process(file, (current) => {
      const TAG = SESSION_TAG;

      // No frontmatter — prepend one
      if (!current.startsWith("---")) {
        return `---\ntags:\n  - ${TAG}\n---\n\n${current}`;
      }

      const endIdx = current.indexOf("---", 3);
      if (endIdx === -1) return current;
      const fm = current.slice(3, endIdx);
      const after = current.slice(endIdx + 3);

      // Already has the tag somewhere in frontmatter
      if (fm.includes(TAG)) return current;

      // Case 1: inline array — tags: [a, b]
      const inlineArr = fm.match(/^tags?\s*:\s*\[([^\]]*)\]/m);
      if (inlineArr) {
        const items = inlineArr[1].split(",").map((s: string) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
        items.push(TAG);
        const newFm = fm.replace(/^tags?\s*:\s*\[[^\]]*\]/m, `tags: [${items.join(", ")}]`);
        return `---${newFm}---${after}`;
      }

      // Case 2: list format — tags:\n  - a\n  - b
      if (/^tags?\s*:\s*\n/m.test(fm)) {
        const newFm = fm.replace(/^(tags?\s*:\s*\n)/m, `$1  - ${TAG}\n`);
        return `---${newFm}---${after}`;
      }

      // Case 3: single value — tags: something
      const single = fm.match(/^tags?\s*:\s*(.+)$/m);
      if (single) {
        const val = single[1].trim();
        const newFm = fm.replace(/^tags?\s*:\s*.+$/m, `tags:\n  - ${val}\n  - ${TAG}`);
        return `---${newFm}---${after}`;
      }

      // Case 4: no tags field — add one
      return `---\ntags:\n  - ${TAG}\n${fm}---${after}`;
    });
  } catch { /* skip */ }
}

export function formatTimestamp(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const h = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${y}-${mo}-${d} ${h}:${mi}:${s}`;
}

function getOpenTabsContext(plugin: NotebrainPlugin): string[] {
  const contexts: string[] = [];
  const workspace = plugin.app.workspace;
  const activeFile = workspace.getActiveFile();

  for (const leaf of workspace.getLeavesOfType("markdown")) {
    const file = (leaf.view as MarkdownView)?.file;
    if (file && file instanceof TFile && file !== activeFile) {
      contexts.push(`[File: ${file.path}]`);
    }
  }

  for (const leaf of workspace.getLeavesOfType("webviewer")) {
    const state = leaf.getViewState();
    const url = (state.state as any)?.url;
    if (url) {
      contexts.push(`[Web: ${url}]`);
    }
  }

  return contexts;
}

export function parseConversationTurns(content: string): ConversationTurn[] {
  const turns: ConversationTurn[] = [];
  let searchFrom = 0;

  while (true) {
    const markerPos = content.indexOf(USER_OPEN, searchFrom);
    if (markerPos === -1) break;

    // user text is between previous position and the user block
    const userText = content.slice(searchFrom, markerPos).trim();

    // find where the user block ends: closing %%
    const userClosePos = content.indexOf(BLOCK_CLOSE, markerPos + USER_OPEN.length);
    if (userClosePos === -1) {
      searchFrom = markerPos + USER_OPEN.length;
      continue;
    }
    const userBlockEnd = userClosePos + BLOCK_CLOSE.length;

    // find the next user block (for turn end)
    const nextMarker = content.indexOf(USER_OPEN, userBlockEnd);
    const turnEnd = nextMarker !== -1 ? nextMarker : content.length;

    // turn content is from user block end to next user block (or EOF)
    const turnContent = content.slice(userBlockEnd, turnEnd);

    // find --- separator between user block and assistant content
    const sepMatch = TURN_SEP_RE.exec(turnContent);
    if (!sepMatch) {
      searchFrom = turnEnd;
      continue;
    }

    const bodySection = turnContent.slice(sepMatch.index + sepMatch[0].length);

    // find assistant block: %%\nassistant\n...%%
    const assistantPos = bodySection.indexOf(ASSISTANT_OPEN);
    let responseText = "";
    let thinkingText = "";

    if (assistantPos !== -1) {
      const responseBlock = bodySection.slice(0, assistantPos);
      thinkingText = (responseBlock.match(/%%([\s\S]*?)%%/)?.[1] ?? "").trim();
      responseText = responseBlock.replace(/%%[\s\S]*?%%/g, "").trim();
    } else {
      thinkingText = (bodySection.match(/%%([\s\S]*?)%%/)?.[1] ?? "").trim();
      responseText = bodySection.replace(/%%[\s\S]*?%%/g, "").trim();
    }

    // parse user block header for context and timestamp
    const userBlockContent = content.slice(markerPos + USER_OPEN.length, userClosePos);
    const userContext: string[] = [];
    let userTimestamp = "";

    for (const line of userBlockContent.split("\n")) {
      const tsMatch = line.match(/^\[Timestamp:\s*(.+?)\]$/);
      if (tsMatch) {
        userTimestamp = tsMatch[1].trim();
      } else if (line.startsWith("[") && line.endsWith("]")) {
        userContext.push(line);
      }
    }

    turns.push({
      userText,
      userContext,
      timestamp: userTimestamp,
      assistantText: responseText,
      thinkingText,
      startOffset: markerPos + 1,
      endOffset: turnEnd,
    });

    searchFrom = turnEnd;
  }

  return turns;
}

export function buildApiMessages(
  turns: ConversationTurn[],
  systemPrompt: string,
): Array<any> {
  const messages: Array<any> = [
    { role: "system", content: systemPrompt },
  ];

  for (const turn of turns) {
    let userContent = turn.userText;
    if (turn.userContext.length > 0) {
      userContent += "\n\n[Context]\n" + turn.userContext.join("\n");
    }
    messages.push({ role: "user", content: userContent });
    if (turn.assistantText) {
      // Cold start: no reasoning_content — cache handles native tool/thinking history
      messages.push({ role: "assistant", content: turn.assistantText });
    }
  }

  return messages;
}

/** Returns error message string if chat should not start, null if valid. */
function validateChatStart(content: string): string | null {
  // 1. Empty note or only whitespace
  if (!content.trim()) return "Note is empty. Type a message first.";

  // Find positions of last user / assistant markers
  const lastUser = content.lastIndexOf(USER_OPEN);
  const lastAssist = content.lastIndexOf(ASSISTANT_OPEN);

  // Helper: find the end of a suffix block (closing %% + ---)
  const suffixEnd = (markerOpen: number, type: string): number => {
    const afterOpen = markerOpen + (type === "user" ? USER_OPEN.length : ASSISTANT_OPEN.length);
    const close = content.indexOf(BLOCK_CLOSE, afterOpen);
    if (close === -1) return -1; // unclosed %%
    const dash = content.indexOf("\n---\n", close + BLOCK_CLOSE.length);
    if (dash === -1) return -1; // missing ---
    return dash + 5; // position after \n---\n
  };

  // 3. Last suffix is a user message (no AI reply after it)
  if (lastUser > lastAssist) {
    return "The last message is yours. Wait for the AI to finish responding before sending another.";
  }

  // 2. No new content after the last AI suffix
  if (lastAssist !== -1) {
    const end = suffixEnd(lastAssist, "assistant");
    if (end !== -1) {
      const after = content.slice(end);
      if (!after.trim()) return "No new message. Type something after the last response.";
    } else {
      // 4. Invalid suffix: unclosed %% or missing --- after last assistant marker
      return "The last AI response marker is malformed. Check the %% and --- markers.";
    }
  }

  // No conversation markers found — fresh note, allowed
  return null;
}

export async function runInlineChat(
  plugin: NotebrainPlugin,
  editor: Editor,
  view: MarkdownView,
) {
  const isReading = (view.leaf.getViewState().state as any)?.mode === "preview";
  const file = view.file!;

  // --- Collect user input ---
  let fullContent: string;
  let userInput: string;
  let insertAt: number;

  if (isReading) {
    // Reading mode: file is source of truth
    fullContent = await plugin.app.vault.read(file);
    const lastTurnEnd = findLastTurnEnd(fullContent);
    const rawInputFull = fullContent.slice(lastTurnEnd);
    userInput = stripYamlFrontmatter(rawInputFull).trim();
    if (!userInput) return;
    insertAt = lastTurnEnd + rawInputFull.length;
  } else {
    // Source mode: read from editor, then sync to file
    const doc = editor.getDoc();
    fullContent = doc.getValue();

    const cursor = editor.getCursor();
    const cursorOffset = doc.posToOffset(cursor);
    const selection = editor.getSelection();

    if (selection) {
      userInput = selection.trim();
      insertAt = doc.posToOffset(editor.getCursor("to")) + 1;
    } else {
      const textBeforeCursor = fullContent.slice(0, cursorOffset);
      const lastTurnEnd = findLastTurnEnd(textBeforeCursor);
      const rawInputFull = fullContent.slice(lastTurnEnd);
      userInput = stripYamlFrontmatter(rawInputFull).trim();
      insertAt = lastTurnEnd + rawInputFull.length;
    }
    if (!userInput) return;

    // Sync editor to file before any file writes
    await plugin.app.vault.modify(file, fullContent);
    fullContent = await plugin.app.vault.read(file);
  }

  // --- Pre-flight validation ---
  const err = validateChatStart(fullContent);
  if (err) { new Notice(`Notebrain: ${err}`); return; }

  // --- Build header and API messages ---
  const contextContent = stripYamlFrontmatter(fullContent);
  const previousTurns = parseConversationTurns(contextContent);
  const openContexts = isReading ? [] : getOpenTabsContext(plugin);
  const timestamp = formatTimestamp();

  const contextSection = openContexts.map((c) => c).join("\n");
  const userBlock = [
    "", "", "%%", "user",
    ...(contextSection ? [contextSection] : []),
    `[Timestamp: ${timestamp}]`, "%%", "",
  ].join("\n");
  const headerToInsert = userBlock + "\n---\n\n";

  // Slice content at insertion point
  const before = fullContent.slice(0, insertAt);
  const after = fullContent.slice(insertAt);

  // Write header to file (single source of truth)
  fullContent = before + headerToInsert + after;
  await plugin.app.vault.modify(file, fullContent);

  // Cache-aware message building: warm cache uses native tool/thinking data,
  // cold start builds simple user/assistant messages from note text only.
  let apiMessages = getCache(file.path);

  if (apiMessages) {
    // Warm cache: messages already have proper tool_calls, tool results, reasoning_content
    apiMessages.push({ role: "user", content: userInput });
  } else {
    // Cold start: build from note — user/assistant text only, no reasoning/tool history
    apiMessages = buildApiMessages(previousTurns, plugin.systemPrompt);
    apiMessages.push({ role: "user", content: userInput });
  }

  const tools = getToolDefinitions();
  const toolRegistry = getAllTools();

  // --- Unified file-only streaming ---
  const writeFreq = plugin.settings.writeFrequency || 80;
  let streamBuffer = "";
  let lastFlush = 0;
  let writeChain: Promise<void> = Promise.resolve();
  let toolsRunning = false;

  const drainWrites = async () => {
    // Flush buffer to file and wait for completion. Do NOT reset streamBuffer —
    // each write is a full file replacement with the COMPLETE buffer, so resetting
    // would cause post-tool content to overwrite pre-tool content in the file.
    if (streamBuffer) {
      writeChain = writeChain.then(async () => {
        await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
      });
    }
    await writeChain;
    writeChain = Promise.resolve();
  };

  try {
    await runAgentLoop(plugin.client, apiMessages, tools, toolRegistry, (text) => {
      streamBuffer += text;
      // Don't write to file while tools are executing (avoid I/O lock on mobile)
      if (toolsRunning) return;
      const now = Date.now();
      if (now - lastFlush > writeFreq) {
        lastFlush = now;
        // Write FULL buffer (not incremental) — vault.modify replaces entire file
        writeChain = writeChain.then(async () => {
          await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
        });
      }
    }, plugin.app, async () => {
      // Called before tool execution: drain pending writes, capture + reset buffer
      toolsRunning = true;
      await drainWrites();
    }, () => {
      // Called after tool execution: resume writes (streamBuffer already reset by drain)
      toolsRunning = false;
      lastFlush = 0;
    });

    // Wait for pending writes
    await writeChain;

    // Final flush
    if (streamBuffer) {
      await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + after);
    }

    // Footer
    const footer = [
      "", "", "%%", "assistant",
      `[Timestamp: ${formatTimestamp()}]`, "%%", "", "---", "",
    ].join("\n");
    await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + footer + after);
  } catch (err: any) {
    console.error("[Notebrain] error:", err);
    const errMsg = `\n\nError: ${err.message ?? "Unknown error"}\n`;
    await plugin.app.vault.modify(file, before + headerToInsert + streamBuffer + errMsg + after);
  }

  // Save native messages to cache (with tool_calls, tool results, reasoning_content)
  setCache(file.path, apiMessages);

  // Switch to reading mode after completion (source mode only)
  if (!isReading) {
    try {
      const state = view.leaf.getViewState();
      if ((state.state as any)?.mode !== "preview") {
        (state.state as any).mode = "preview";
        await view.leaf.setViewState(state);
      }
    } catch { /* ignore */ }
  }

  // Add session tag now that streaming is complete
  ensureSessionTag(file, plugin.app);
}

function findLastTurnEnd(text: string): number {
  // each turn ends with "\n%%\n" (closing of assistant block) then "\n---\n"
  const closingMarker = "\n%%\n";
  const lastSep = text.lastIndexOf(closingMarker);
  if (lastSep !== -1) {
    // skip past the assistant timestamp line and closing %%
    const afterClose = text.indexOf("\n", lastSep + closingMarker.length);
    if (afterClose !== -1) {
      const afterDash = text.indexOf("---\n", afterClose);
      if (afterDash !== -1) {
        return afterDash + "---\n".length;
      }
    }
    return lastSep + closingMarker.length;
  }
  return 0;
}

type StreamCallback = (text: string) => void;

interface ToolCallAccum {
  index: number;
  id: string;
  name: string;
  arguments: string;
}

const PERMISSION_TOOLS = new Set(["createNote", "editNote"]);

class ToolPermissionModal extends Modal {
  private resolve!: (approved: boolean) => void;

  constructor(
    app: App,
    private toolName: string,
    private args: Record<string, unknown>,
  ) {
    super(app);
  }

  openModal(): Promise<boolean> {
    return new Promise((resolve) => {
      this.resolve = resolve;
      this.open();
    });
  }

  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("notebrain-permission-modal");

    contentEl.createEl("h3", { text: "Notebrain 工具权限" });

    const info = contentEl.createEl("div", { cls: "notebrain-permission-info" });

    if (this.toolName === "createNote") {
      info.createEl("p", { text: `工具: 创建笔记` });
      info.createEl("p", { text: `文件名: ${(this.args.file as string) || "?"}` });
      if (this.args.folder) info.createEl("p", { text: `文件夹: ${this.args.folder}` });
      const contentPreview = (this.args.content as string) || "";
      if (contentPreview) {
        info.createEl("p", { text: `内容预览: ${contentPreview.slice(0, 200)}${contentPreview.length > 200 ? "..." : ""}` });
      }
    } else if (this.toolName === "editNote") {
      const modeMap: Record<string, string> = { replace: "替换文本", append: "追加内容", prepend: "前置内容" };
      info.createEl("p", { text: `工具: 编辑笔记` });
      info.createEl("p", { text: `文件: ${(this.args.file as string) || (this.args.path as string) || "?"}` });
      info.createEl("p", { text: `模式: ${modeMap[this.args.mode as string] || this.args.mode}` });
      if (this.args.search) info.createEl("p", { text: `查找: ${(this.args.search as string).slice(0, 100)}` });
      const editContent = (this.args.replace as string) || (this.args.content as string) || "";
      if (editContent) {
        info.createEl("p", { text: `内容: ${editContent.slice(0, 200)}${editContent.length > 200 ? "..." : ""}` });
      }
    }

    const btnRow = contentEl.createEl("div", { cls: "notebrain-permission-buttons" });

    const denyBtn = btnRow.createEl("button", { text: "拒绝", cls: "notebrain-permission-deny" });
    denyBtn.onclick = () => {
      this.resolve(false);
      this.close();
    };

    const approveBtn = btnRow.createEl("button", { text: "批准", cls: "notebrain-permission-approve" });
    approveBtn.onclick = () => {
      this.resolve(true);
      this.close();
    };
  }

  onClose() {
    if (this.resolve) this.resolve(false);
  }
}

async function runAgentLoop(
  client: DeepSeekClient,
  messages: Array<{ role: string; content: string }>,
  tools: ToolDefinition[],
  toolRegistry: Map<string, any>,
  onStream: StreamCallback,
  app?: App,
  beforeTools?: () => Promise<void>,
  afterTools?: () => void,
) {
  const maxTurns = 10;

  let commentOpen = false;
  let hasWritten = false;

  for (let turn = 0; turn < maxTurns; turn++) {
    let content = "";
    let reasoningContent = "";

    const toolCallResult: { calls: ToolCallAccum[] } = { calls: [] };

    await client.chatStream(
      messages as any,
      tools.length > 0 ? tools : undefined,
      (chunk) => {
        // thinking or tool: keep inside same %% block
        if (chunk.reasoningContent || chunk.toolCalls) {
          if (!commentOpen) {
            commentOpen = true;
            onStream(hasWritten ? "\n%%" : "%%");
          }
          if (chunk.reasoningContent) {
            onStream(chunk.reasoningContent);
            reasoningContent += chunk.reasoningContent;
          }
        }
        // real message content: close %%, write normally
        if (chunk.content) {
          if (commentOpen) {
            onStream("%%\n");
            commentOpen = false;
          }
          onStream(chunk.content);
          content += chunk.content;
          hasWritten = true;
        }
        if (chunk.toolCalls) {
          toolCallResult.calls = chunk.toolCalls;
        }
      },
    );

    const toolCalls = toolCallResult.calls;

    if (toolCalls.length > 0) {
      // Pause file writes before tool execution (avoid I/O lock on mobile)
      if (beforeTools) await beforeTools();

      const callsForApi = toolCalls.map((tc) => ({
        id: tc.id,
        type: "function" as const,
        function: { name: tc.name, arguments: tc.arguments },
      }));

      (messages as any[]).push({
        role: "assistant",
        content: content || "",
        reasoning_content: reasoningContent,
        tool_calls: callsForApi,
      });

      // keep tool info inside the same %% block
      if (!commentOpen) {
        commentOpen = true;
        onStream(hasWritten ? "\n%%" : "%%");
      }

      onStream(`\n[Tool calls]\n`);
      for (const tc of toolCalls) {
        let argsStr = tc.arguments;
        try { argsStr = JSON.stringify(JSON.parse(tc.arguments)); } catch { /* raw */ }
        onStream(`${tc.name}: ${argsStr}\n`);
      }

      for (const tc of toolCalls) {
        const tool = toolRegistry.get(tc.name);
        let result: string;
        if (tool) {
          try {
            const args = JSON.parse(tc.arguments);

            // Permission check for createNote / editNote
            if (PERMISSION_TOOLS.has(tc.name) && app) {
              onStream(`\n[Permission requested: ${tc.name}]\n`);
              const approved = await new ToolPermissionModal(app, tc.name, args).openModal();
              if (!approved) {
                result = JSON.stringify({ error: "User denied the operation." });
                (messages as any[]).push({
                  role: "tool",
                  tool_call_id: tc.id,
                  content: result,
                });
                onStream(`\n[Permission denied: ${tc.name}]\n`);
                continue;
              }
              onStream(`\n[Permission granted: ${tc.name}]\n`);
            }

            result = String(await tool.execute(args, toolApiKeys));
          } catch (e: any) {
            result = JSON.stringify({ error: `${tc.name} failed: ${e?.message || "unknown error"}` });
          }
        } else {
          result = JSON.stringify({ error: `Unknown tool: ${tc.name}` });
        }

        (messages as any[]).push({
          role: "tool",
          tool_call_id: tc.id,
          content: result,
        });

        // Tool result is passed to API but NOT written to the note
      }
      if (afterTools) afterTools();
      continue;
    }

    // final response — no more tool calls
    if (commentOpen) {
      onStream("%%\n");
      commentOpen = false;
    }
    break;
  }

  // Reached maxTurns without resolution
  if (!commentOpen) {
    commentOpen = true;
    onStream(hasWritten ? "\n%%" : "%%");
  }
  onStream(`\n[Tool calls exceeded max rounds (${maxTurns}) — stopped]\n`);
  if (commentOpen) {
    onStream("%%\n");
  }
}
