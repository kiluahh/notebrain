import type { App, TFile } from "obsidian";
import type { RegisteredTool } from "./registry";

let vaultApp: App | null = null;
export function setGetBacklinksApp(app: App) {
  vaultApp = app;
}

function resolveFile(args: Record<string, unknown>): TFile | null {
  if (!vaultApp) return null;
  const filePath = args.path as string | undefined;
  const fileName = args.file as string | undefined;

  if (filePath) {
    const f = vaultApp.vault.getAbstractFileByPath(filePath);
    if (f && (f as any).extension === "md") return f as TFile;
  }

  if (fileName) {
    const clean = fileName.replace(/\.md$/, "");
    const all = vaultApp.vault.getMarkdownFiles();
    const matches = all.filter((f) => f.basename === clean);
    if (matches.length === 1) return matches[0];
    const ci = all.filter((f) => f.basename.toLowerCase() === clean.toLowerCase());
    if (ci.length === 1) return ci[0];
  }

  return null;
}

export const getBacklinksTool: RegisteredTool = {
  definition: {
    type: "function" as const,
    function: {
      name: "getBacklinks",
      description:
        "Get all notes that link to a given note (backlinks). Specify the target note by file name or path. Omit both to use the currently active note. Returns linking note paths and the context around each link.",
      parameters: {
        type: "object",
        properties: {
          file: {
            type: "string",
            description: "Target note name without extension. Omit to use active note.",
          },
          path: {
            type: "string",
            description: "Vault-relative path of the target note. More precise than file.",
          },
        },
      },
    },
  },

  execute: async (args: Record<string, unknown>) => {
    if (!vaultApp) return JSON.stringify({ error: "Vault not available" });

    let file = resolveFile(args);
    if (!file && !args.file && !args.path) {
      file = vaultApp.workspace.getActiveFile();
    }
    if (!file) return JSON.stringify({ error: "Note not found. Provide a valid file name or path." });

    try {
      const targetPath = file.path;
      const result: Array<{ file: string; path: string; displayText: string; line: number }> = [];

      // Iterate all markdown files and check their outgoing links
      const allFiles = vaultApp.vault.getMarkdownFiles();
      for (const src of allFiles) {
        if (src.path === targetPath) continue;
        const cache = vaultApp.metadataCache.getFileCache(src);
        if (!cache?.links) continue;

        for (const link of cache.links) {
          const resolved = vaultApp.metadataCache.getFirstLinkpathDest(link.link, src.path);
          if (resolved?.path === targetPath) {
            const line = link.position?.start?.line ?? 0;
            result.push({
              file: src.basename,
              path: src.path,
              displayText: link.displayText || link.link,
              line: line + 1,
            });
            break; // one entry per source file
          }
        }
      }

      return JSON.stringify({
        file: file.basename,
        path: file.path,
        backlinks: result,
        count: result.length,
      });
    } catch (e: any) {
      return JSON.stringify({ error: e.message || "Failed to get backlinks" });
    }
  },
};
