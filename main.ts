import { addIcon, MarkdownView, Notice, Plugin } from "obsidian";
import { DeepSeekClient } from "./src/api/deepseek";
import type { DeepSeekConfig } from "./src/api/deepseek";
import { registerAllBuiltinTools, setToolApiKeys, setDisabledTools, getToolDefinitions } from "./src/tools";
import { setArxivVaultApp } from "./src/tools/arxivDownload";
import { setSearchNotesApp } from "./src/tools/searchNotes";
import { setReadNoteApp } from "./src/tools/readNote";
import { setCreateNoteApp, setCreateNoteConfig } from "./src/tools/createNote";
import { setEditNoteApp, setEditNoteConfig } from "./src/tools/editNote";
import { setWebFetchConfig } from "./src/tools/webFetch";
import { setGetBacklinksApp } from "./src/tools/getBacklinks";
import { setListFolderApp } from "./src/tools/listFolder";
import {
  NotebrainSettingTab,
  DEFAULT_SETTINGS,
} from "./src/settings/settings";
import type { NotebrainSettings } from "./src/settings/settings";
import { runInlineChat } from "./src/editor/noteChat";
import { runFimComplete } from "./src/editor/fimComplete";

const BRAIN_ICON = `<svg t="1779116087829" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="9928" width="100" height="100"><path d="M902.709 416.67c-0.445 36.855-16.859 71.907-44.805 96.546 28.334 24.98 44.885 60.66 44.885 98.074 0 64.151-48.934 119.599-111.602 129.557 1.517 7.791 2.27 15.479 2.27 22.984 0 71.177-60.33 131.302-131.747 131.302-63.09 0-118.595-46.756-129.636-108.968-1.392-3.741-2.11-7.585-2.11-11.429V531.592c0-0.103-0.011-0.194-0.011-0.285 0-0.011 0.011-0.034 0.011-0.057V292.041c-12.296-52.619 8.361-107.04 52.881-138.978l1.209-0.764c15.992-8.692 32.84-14.772 50.064-18.08 1.677-0.354 2.989-0.627 4.312-0.855 2.361-0.376 4.597-0.707 6.844-0.97 11.863-1.426 19.973-1.437 31.094-0.251l1.506 0.205a136.72 136.72 0 0 1 14.201 2.464c24.513 5.68 45.604 17.338 63.033 34.71 29.942 29.84 43.722 74.257 36.832 116.188 62.223 10.3 110.85 65.771 110.85 129.442 0 0.171-0.034 0.354-0.034 0.525 0 0.194 0.034 0.388 0.034 0.582-0.001 0.137-0.081 0.263-0.081 0.411zM773.061 309.847c-56.805 0-103.241 44.452-106.458 100.276 16.848 3.171 29.646 17.908 29.646 35.612 0 19.996-16.334 36.273-36.41 36.273s-36.399-16.277-36.399-36.273c0-14.11 8.201-26.235 20.03-32.235 1.449-68.337 56.303-123.671 124.583-126.283 7.871-36.284-3.148-75.569-29.178-101.519-14.361-14.304-31.722-23.897-51.615-28.517-4.072-0.924-7.882-1.597-11.703-2.053l-0.422-11.612-1.232 11.372c-8.099-0.878-15.296-1.061-25.904 0.228-1.951 0.228-3.878 0.502-5.806 0.821-0.878 0.148-1.871 0.365-2.874 0.582-15.524 2.989-29.92 8.156-43.63 15.524-30.878 22.437-47.486 57.934-45.889 94.538 0.068 0.354 0.285 0.639 0.319 1.015 3.764 33.581 22.631 62.702 51.786 79.892 5.452 3.205 7.266 10.22 4.038 15.661-2.144 3.605-5.977 5.623-9.901 5.623-1.985 0-3.992-0.513-5.829-1.597-14.806-8.726-27.273-20.11-37.288-33.239v197.7c-0.24 36.889 29.623 67.139 66.649 67.459 6.331 0.057 11.429 5.213 11.384 11.544-0.057 6.274-5.19 11.338-11.486 11.338h-0.091c-26.452-0.228-50.098-11.909-66.455-30.182v182.94c0 1.232 0.297 2.589 0.844 3.901l0.741 2.544c8.703 51.923 54.786 91.07 107.199 91.07 58.972 0 108.785-49.642 108.785-108.42 0-1.209-0.24-2.487-0.285-3.707-0.068-0.445-0.285-0.821-0.297-1.278a87.476 87.476 0 0 0-2.19-16.813c-0.034-0.137-0.057-0.262-0.091-0.399-3.867-16.505-12.513-31.528-25.197-43.402-14.772-13.825-33.524-21.33-53.474-22.859-5.03 14.03-18.376 24.159-34.151 24.159-20.076 0-36.41-16.289-36.41-36.296 0-19.996 16.334-36.273 36.41-36.273 16.083 0 29.612 10.517 34.414 24.969 25.711 1.255 49.904 11.806 68.93 29.612 11.338 10.608 20.03 23.247 25.939 37.094 53.44-6.65 95.736-53.189 95.736-107.348 0-34.927-17.578-68.098-47.03-88.721l-13.369-9.353 13.369-9.365c29.315-20.509 46.836-53.451 46.995-88.207-0.332-58.39-48.068-105.796-106.733-105.796zM659.839 432.32c-7.414 0-13.448 6.011-13.448 13.414 0 7.38 6.034 13.391 13.448 13.391s13.448-6.011 13.448-13.391c0.001-7.403-6.034-13.414-13.448-13.414z m8.407 230.881c-0.023-7.369-6.034-13.357-13.437-13.357-7.414 0-13.448 6.011-13.448 13.391 0 7.391 6.034 13.414 13.448 13.414 7.266 0 13.129-5.806 13.357-12.992v-0.011c0-0.16 0.08-0.285 0.08-0.445zM447.22 873.368l-1.209 0.764c-15.992 8.692-32.828 14.772-50.064 18.079-1.677 0.354-2.977 0.639-4.3 0.856-2.361 0.376-4.608 0.707-6.855 0.981-6.205 0.741-11.429 1.084-16.437 1.084-4.563 0-9.353-0.274-14.658-0.844l-1.506-0.205a137.059 137.059 0 0 1-14.19-2.464c-24.547-5.692-45.627-17.327-63.044-34.699-29.942-29.851-43.722-74.257-36.832-116.199-62.212-10.3-110.838-65.771-110.838-129.431 0-0.182 0.023-0.354 0.023-0.536 0-0.194-0.023-0.376-0.023-0.57 0-0.148 0.068-0.274 0.08-0.411 0.445-36.866 16.836-71.919 44.805-96.546-28.345-24.98-44.885-60.672-44.885-98.074 0-64.151 48.923-119.61 111.591-129.556-1.506-7.791-2.259-15.49-2.259-22.996 0-71.177 60.33-131.302 131.735-131.302 63.09 0 118.606 46.756 129.636 108.968 1.403 3.741 2.11 7.585 2.11 11.441v243.36c0 0.011 0.011 0.034 0.011 0.057 0 0.011-0.011 0.011-0.011 0.023V734.39c12.297 52.619-8.36 107.04-52.88 138.978z m32.725-114.511c-3.764-33.615-22.631-62.725-51.775-79.915-5.452-3.205-7.266-10.22-4.038-15.661 3.217-5.43 10.266-7.243 15.73-4.015 14.806 8.726 27.273 20.098 37.277 33.239V494.862c0.148-17.874-6.696-34.745-19.277-47.497-12.582-12.764-29.406-19.87-47.36-20.03-6.342-0.057-11.441-5.213-11.384-11.544 0.057-6.274 5.179-11.338 11.475-11.338h0.103c24.091 0.205 46.653 9.764 63.546 26.874 1.095 1.106 1.871 2.43 2.897 3.582V251.707c0-1.243-0.285-2.601-0.844-3.912l-0.741-2.544c-8.692-51.923-54.775-91.071-107.2-91.071-58.961 0-108.785 49.653-108.785 108.42 0 1.221 0.251 2.509 0.297 3.741 0.068 0.433 0.285 0.81 0.297 1.255a87.926 87.926 0 0 0 2.19 16.848l0.068 0.308c3.867 16.528 12.513 31.574 25.209 43.448 14.772 13.825 33.524 21.501 53.463 22.916 5.019-14.064 18.365-24.205 34.163-24.205 20.076 0 36.41 16.277 36.41 36.284 0 19.996-16.334 36.285-36.41 36.285-16.14 0-29.703-10.608-34.459-25.14-25.711-1.483-49.881-11.669-68.873-29.452-11.338-10.608-20.041-23.247-25.95-37.094-53.44 6.65-95.736 53.201-95.736 107.359 0 34.939 17.578 68.098 47.03 88.709l13.38 9.365-13.38 9.365c-29.304 20.498-46.824 53.44-46.995 88.196 0.331 58.402 48.068 105.797 106.743 105.797 56.794 0 103.241-44.452 106.458-100.264-16.848-3.182-29.646-17.908-29.646-35.612 0-20.007 16.334-36.284 36.399-36.284 20.076 0 36.41 16.277 36.41 36.284 0 14.11-8.201 26.224-20.03 32.224-1.46 68.337-56.315 123.671-124.595 126.283-7.871 36.296 3.148 75.569 29.19 101.519 14.338 14.304 31.699 23.897 51.615 28.517 4.072 0.924 7.871 1.597 11.703 2.053l0.411 11.612 1.232-11.372c8.087 0.855 15.308 1.038 25.904-0.228a122.79 122.79 0 0 0 5.806-0.81c0.89-0.16 1.882-0.376 2.886-0.582 15.513-3 29.92-8.156 43.63-15.536 30.844-22.414 47.452-57.889 45.889-94.47-0.082-0.366-0.287-0.685-0.333-1.062zM361.818 363.23c0.023 7.369 6.046 13.369 13.437 13.369 7.414 0 13.448-6.023 13.448-13.403 0-7.391-6.034-13.403-13.448-13.403-7.266 0-13.14 5.806-13.357 13.004 0 0.159-0.08 0.285-0.08 0.433z m8.407 230.881c7.414 0 13.448-6.011 13.448-13.403s-6.034-13.403-13.448-13.403-13.448 6.011-13.448 13.403 6.034 13.403 13.448 13.403z" p-id="9929"></path></svg>`;

const PEN_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>`;

interface ToolDefInfo {
  function: { name: string; description: string };
}

const TOOL_CATEGORIES: Array<{ name: string; items: string[] }> = [
  { name: "Vault", items: ["searchNotes", "readNote", "listFolder", "createNote", "editNote", "getBacklinks"] },
  { name: "Time", items: ["getCurrentTime"] },
  { name: "Web Search & Content", items: ["webSearch", "cnNews", "webFetch", "tavilySearch", "tavilyExtract", "tavilyCrawl", "tavilyMap", "tavilyResearch", "tavilyResearchGet", "baiduBaike", "wikipedia"] },
  { name: "Academic Research", items: ["arxivSearch", "arxivDownload"] },
  { name: "Code & Repositories", items: ["githubSearch"] },
];

function buildSystemPrompt(
  toolDefs: ToolDefInfo[],
  settings: NotebrainSettings,
  notebrainInstructions: string,
): string {
  const toolMap = new Map(toolDefs.map((t) => [t.function.name, t.function.description]));

  const lines: string[] = [];
  lines.push("Use these tools proactively. Fetch information yourself rather than asking the user.");
  lines.push("Take action rather than suggesting it. Call multiple tools in parallel when they are independent.");
  lines.push("");

  for (const cat of TOOL_CATEGORIES) {
    const enabled = cat.items.filter((n) => toolMap.has(n));
    if (enabled.length === 0) continue;
    lines.push(cat.name);
    for (const name of enabled) {
      const desc = toolMap.get(name) || "";
      lines.push(`  ${name} — ${desc}`);
    }
    lines.push("");
  }

  const capabilities = lines.join("\n");

  // Build extra rules based on settings
  const extraRules: string[] = [];
  if (!settings.yamlEnabled) {
    extraRules.push("- NEVER create notes with YAML frontmatter (--- ... ---). The createNote tool will strip any frontmatter automatically.");
  }
  extraRules.push(`- When creating notes with createNote, NEVER include YAML frontmatter (--- ... ---) or an H1 title. The note header is injected automatically. Start content from the body text.`);

  const rulesBlock = [
    "- Give direct answers. Take action immediately. Be proactive.",
    "- When asked to search, look up, or find information, ALWAYS use tools — never simulate results.",
    "- If unsure, use tools first, then answer.",
    "- Keep responses concise. Use wikilinks [[file]] to reference files.",
    "- NEVER use createNote or editNote unless the user explicitly asks you to create or edit a note. Do not create notes just to summarize findings — answer in the chat instead.",
    "- When the user asks to create/edit a note, confirm the file name and location before proceeding.",
    ...extraRules,
  ].join("\n");

  let xml = `<system>
<persona>
You are Notebrain, an AI agent inside the user's Obsidian vault. You autonomously help manage notes, search the vault, research topics, and solve problems. Answer in the same language the user uses.
</persona>

<capabilities>
${capabilities}
</capabilities>

<rules>
${rulesBlock}
</rules>`;

  if (notebrainInstructions) {
    xml += `\n\n<vault_instructions>
The following is the user's NOTEBRAIN.md — it describes the vault structure, conventions, and preferences. Follow these instructions with highest priority.
${notebrainInstructions}
</vault_instructions>`;
  }

  xml += `\n</system>`;
  return xml;
}

const NOTEBRAIN_MD_TEMPLATE = `---
tags:
  - notebrain
---

# NOTEBRAIN.md

This file provides guidance to Notebrain when working in this vault. It is automatically loaded and injected into the system prompt with highest priority.

## Vault Structure
- Describe your folder structure here so the AI knows where things belong.
- Example: Daily/ for daily notes, Projects/ for project plans, Reference/ for knowledge base.

## Note Conventions
- Describe your note-taking conventions: frontmatter fields, tag taxonomy, naming patterns.
- Example: All notes use "date" and "tags" in frontmatter. Meeting notes start with "Meeting -".

## Preferences
- Language: Chinese
- Response style: Concise
- Any other preferences the AI should follow.

## Rules
- Add custom rules for the AI here.
- Example: Never delete notes without confirmation. Always use [[wikilinks]] when referencing other notes.
`;

export default class NotebrainPlugin extends Plugin {
  settings!: NotebrainSettings;
  client!: DeepSeekClient;
  systemPrompt =
    "You are Notebrain, an AI agent for Obsidian. Use tools when helpful. Answer in the same language as the user's message.";
  notebrainInstructions = "";

  async onload() {
    await this.loadSettings();

    addIcon("brain", BRAIN_ICON);
    addIcon("pen", PEN_ICON);

    this.client = new DeepSeekClient(this.getApiConfig());
    registerAllBuiltinTools();
    setArxivVaultApp(this.app);
    setSearchNotesApp(this.app);
    setReadNoteApp(this.app);
    setCreateNoteApp(this.app);
    setEditNoteApp(this.app);
    setGetBacklinksApp(this.app);
    setListFolderApp(this.app);
    this.pushCreateNoteConfig();
    await this.loadNotebrainMd();
    this.refreshPrompt();

    this.addRibbonIcon("brain", "Chat with Notebrain", () => this.runChat());
    this.addRibbonIcon("pen", "FIM Completion", async () => {
      const view = this.app.workspace.getActiveViewOfType(MarkdownView);
      if (!view) { new Notice("Notebrain FIM: Open a note first."); return; }
      await runFimComplete(this, view.editor);
    });

    this.addCommand({
      id: "notebrain-chat",
      name: "Chat with Notebrain",
      icon: "brain",
      editorCallback: async (editor, ctx) => {
        const view = ctx.app.workspace.getActiveViewOfType(MarkdownView);
        if (!view) return;
        await runInlineChat(this, editor, view);
      },
      hotkeys: [{ modifiers: ["Mod", "Shift"], key: "Enter" }],
    });

    this.addCommand({
      id: "notebrain-chat-no-editor",
      name: "Chat with Notebrain",
      icon: "brain",
      callback: () => this.runChat(),
    });

    this.addCommand({
      id: "notebrain-fim",
      name: "FIM Completion",
      icon: "pen",
      editorCallback: async (editor) => {
        await runFimComplete(this, editor);
      },
      hotkeys: [],
    });

    this.addSettingTab(new NotebrainSettingTab(this.app, this));
  }

  refreshPrompt() {
    this.systemPrompt = buildSystemPrompt(
      getToolDefinitions() as ToolDefInfo[],
      this.settings,
      this.notebrainInstructions,
    );
    const hasInstructions = this.notebrainInstructions ? this.notebrainInstructions.length : 0;
    console.log(`[Notebrain] refreshPrompt: systemPrompt=${this.systemPrompt.length} chars, notebrainInstructions=${hasInstructions} chars`);
  }

  private async loadNotebrainMd() {
    const tag = this.settings.editPermissionTag;
    const bareTag = tag.replace(/^#/, "");

    const hasTag = (text: string): boolean => {
      if (text.includes(tag) || text.includes(`#${bareTag}`)) return true;
      if (!/^---[\s\S]*?---/.test(text)) return false;
      const fm = text.match(/^---\n([\s\S]*?)---/)?.[1] || "";
      return fm.includes(bareTag);
    };

    // --- Path 1: Obsidian API (fast when cache is ready) ---
    const files = this.app.vault.getMarkdownFiles();
    for (const f of files) {
      if (f.basename.toLowerCase() !== "notebrain") continue;
      const cache = this.app.metadataCache.getFileCache(f);
      const inlineTags = (cache?.tags || []).map((t: any) => t.tag.replace(/^#/, ""));
      const fmTags: string[] = (cache?.frontmatter?.tags as any[])?.map((t: any) => String(t)) || [];
      const allTags = [...inlineTags, ...fmTags];
      if (allTags.length > 0 && allTags.some((t: any) => t === tag || t === bareTag || t === `#${bareTag}`)) {
        console.log(`[Notebrain] Loaded via API cache: ${f.path}`);
        this.notebrainInstructions = await this.app.vault.read(f);
        return;
      }
    }

    // --- Path 2: Vault adapter (works before Obsidian indexing) ---
    const adapter = this.app.vault.adapter;
    const found = await this.findNotebrainMdAdapter(adapter, "", hasTag);
    if (found) {
      console.log(`[Notebrain] Loaded via adapter: ${found.path} (${found.content.length} chars)`);
      this.notebrainInstructions = found.content;
      return;
    }

    // --- Path 3: No NOTEBRAIN.md anywhere — create at configured path ---
    const mdPath = this.settings.notebrainMdPath || "NOTEBRAIN.md";
    console.log(`[Notebrain] Creating default NOTEBRAIN.md at ${mdPath}...`);
    try {
      if (await adapter.exists(mdPath)) {
        this.notebrainInstructions = await adapter.read(mdPath);
        return;
      }
      // Ensure parent folder exists
      const slashIdx = mdPath.lastIndexOf("/");
      if (slashIdx !== -1) {
        const folder = mdPath.slice(0, slashIdx);
        if (!(await adapter.exists(folder))) {
          await this.app.vault.createFolder(folder);
        }
      }
      await this.app.vault.create(mdPath, NOTEBRAIN_MD_TEMPLATE);
      new Notice(`Notebrain: Created ${mdPath}. Edit it to customize AI behavior.`);
    } catch (e: any) {
      if (e.message?.includes("already exists")) {
        try { this.notebrainInstructions = await adapter.read(mdPath); return; } catch {}
      }
      console.error("[Notebrain] Failed to create NOTEBRAIN.md:", e.message);
    }
    // Always fall back to template content
    if (!this.notebrainInstructions) {
      this.notebrainInstructions = NOTEBRAIN_MD_TEMPLATE;
    }
  }

  private async findNotebrainMdAdapter(
    adapter: { exists(p: string): Promise<boolean>; list(p: string): Promise<{ files: string[]; folders: string[] }>; read(p: string): Promise<string> },
    dir: string,
    hasTag: (text: string) => boolean,
  ): Promise<{ path: string; content: string } | null> {
    const prefix = dir ? dir + "/" : "";
    try {
      const list = await adapter.list(dir || "/");
      for (const f of list.files) {
        if (f.toLowerCase() === "notebrain.md") {
          const fp = prefix + f;
          const content = await adapter.read(fp);
          if (hasTag(content)) return { path: fp, content };
          // Even without tag, accept if it's the only NOTEBRAIN.md
          console.log(`[Notebrain] Found ${fp} but missing permission tag, accepting anyway`);
          return { path: fp, content };
        }
      }
      for (const sub of list.folders) {
        if (sub.startsWith(".")) continue;
        const r = await this.findNotebrainMdAdapter(adapter, prefix + sub, hasTag);
        if (r) return r;
      }
    } catch { /* skip */ }
    return null;
  }

  private pushCreateNoteConfig() {
    setCreateNoteConfig({
      yamlEnabled: this.settings.yamlEnabled,
      noteTemplate: this.settings.noteTemplate,
    });
    setEditNoteConfig({
      permissionTag: this.settings.editPermissionTag,
    });
    setWebFetchConfig({
      headlessBrowserEndpoint: this.settings.headlessBrowserEndpoint,
    });
    setDisabledTools(this.settings.disabledTools);
  }

  private async runChat() {
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      new Notice("Notebrain: Open a note first.");
      return;
    }
    const editor = view.editor;
    await runInlineChat(this, editor, view);
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.refreshPrompt();
    this.updateToolKeys();
    this.pushCreateNoteConfig();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.client.updateConfig(this.getApiConfig());
    this.updateToolKeys();
    this.pushCreateNoteConfig();
    await this.loadNotebrainMd();
    this.refreshPrompt();
  }

  private updateToolKeys() {
    setToolApiKeys({
      tavilyKey: this.settings.tavilyKey,
      githubKey: this.settings.githubKey,
      baiduKey: this.settings.baiduKey,
    });
  }

  private getApiConfig(): DeepSeekConfig {
    return {
      apiKey: this.settings.apiKey,
      baseUrl: this.settings.baseUrl,
      model: this.settings.model,
      thinkingEnabled: this.settings.thinkingEnabled,
      reasoningEffort: this.settings.reasoningEffort,
      temperature: this.settings.thinkingEnabled ? undefined : this.settings.temperature,
    };
  }
}
