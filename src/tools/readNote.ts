import type { App, TFile } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setReadNoteApp(app: App) {
  vaultApp = app;
}

export const readNoteTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "readNote",
      description:
        "Read the content of an Obsidian note. Use file (wikilink-style name without extension) or path (vault-relative). Omit both to read the currently active note. Supports offset/limit for large files.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Note name without extension (wikilink-style), e.g. 'My Note', '日记'. Omit to read active note.",
          },
          path: {
            type: "string",
            description: "Vault-relative path, e.g. 'folder/note.md'. More precise than file. Omit to read active note.",
          },
          offset: {
            type: "integer",
            description: "Line number to start reading from (1-based, default 1). Use for large notes.",
          },
          limit: {
            type: "integer",
            description: "Max lines to read. Omit for full note content.",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    const fileName = args.file as string | undefined;
    const filePath = args.path as string | undefined;
    const offset = Math.max(Number(args.offset) || 1, 1);
    const limit = args.limit ? Number(args.limit) : undefined;

    let file: TFile | null = null;

    if (filePath) {
      const f = vaultApp.vault.getAbstractFileByPath(filePath);
      if (f && (f as any).extension === "md") {
        file = f as TFile;
      }
    }

    if (!file && fileName) {
      const clean = fileName.replace(/\.md$/, "");
      const all = vaultApp.vault.getMarkdownFiles();
      const matches = all.filter(
        (f) => f.basename === clean || f.basename.toLowerCase() === clean.toLowerCase(),
      );
      if (matches.length === 1) file = matches[0];
      else if (matches.length > 1) {
        return JSON.stringify({
          error: `Multiple notes match "${clean}". Use path instead.`,
          candidates: matches.map((f) => f.path),
        });
      }
      if (!file) {
        // try case-insensitive
        const ci = all.filter((f) => f.basename.toLowerCase() === clean.toLowerCase());
        if (ci.length === 1) file = ci[0];
        if (!file) {
          return JSON.stringify({ error: `Note not found: ${clean}` });
        }
      }
    }

    if (!file && !fileName && !filePath) {
      file = vaultApp.workspace.getActiveFile();
      if (!file) return JSON.stringify({ error: "No note specified and no active note" });
    }

    if (!file) return JSON.stringify({ error: "Could not resolve note" });

    try {
      const content = await vaultApp.vault.read(file);
      const cache = vaultApp.metadataCache.getFileCache(file);

      let text = content;
      let totalLines = text.split("\n").length;
      let readFrom = 1;

      if (offset > 1) {
        const lines = text.split("\n");
        readFrom = Math.min(offset, lines.length);
        text = lines.slice(readFrom - 1).join("\n");
      }
      if (limit && limit > 0) {
        const lines = text.split("\n");
        text = lines.slice(0, limit).join("\n");
      }

      return JSON.stringify({
        file: file.basename,
        path: file.path,
        offset: readFrom,
        lines: text.split("\n").length,
        totalLines,
        truncated: limit ? text.split("\n").length < (content.split("\n").length - (readFrom - 1)) : false,
        tags: (cache?.tags || []).map((t: any) => t.tag),
        properties: cache?.frontmatter || {},
        links: cache?.links?.map((l: any) => l.link) || [],
        embeds: cache?.embeds?.map((e: any) => e.link) || [],
        headings: cache?.headings?.map((h: any) => ({ level: h.level, text: h.heading })) || [],
        content: text,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Read failed" });
    }
  },
};
